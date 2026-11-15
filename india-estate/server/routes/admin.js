import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';

// Zero Trust Middleware: Verify Passkey Token
const requireAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized: No Token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_vault_key');
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access Denied: Admin Only' });
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};

router.use(requireAuth);

// 1. ANALYTICS (Mock Data for "Extraordinary" Visuals)
router.get('/analytics', (req, res) => {
    // In a real app, this would query a TrafficLogs collection
    const analyticsData = {
        visitors: Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            visitors: Math.floor(Math.random() * 500) + 100,
            botAttempts: Math.floor(Math.random() * 50)
        })),
        heatmaps: [
            { id: 'contact-btn', clicks: 120, x: 80, y: 90 },
            { id: 'hero-cta', clicks: 350, x: 50, y: 50 },
            { id: 'snake-menu', clicks: 200, x: 70, y: 10 },
        ],
        liveUsers: Math.floor(Math.random() * 20),
        securityThreatsBlocked: 142
    };
    res.json(analyticsData);
});

// 2. MESSAGES: Fetch All (Decrypted)
router.get('/messages', async (req, res) => {
    try {
        if (global.demoMode) {
            // Return mock messages for demo
            return res.json([
                { _id: '1', name: 'John Doe', email: 'john@example.com', content: 'Interested in the Villa in Goa.', read: false, timestamp: new Date() },
                { _id: '2', name: 'Sara Smith', email: 'sara@luxury.com', content: 'Please send brochure for penthouses.', read: true, timestamp: new Date(Date.now() - 86400000) }
            ]);
        }

        const messages = await Message.find().sort({ timestamp: -1 });
        const decryptedMessages = messages.map(msg => msg.toJSONDecrypted());
        res.json(decryptedMessages);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// 3. MESSAGES: Mark as Read
router.patch('/messages/:id/read', async (req, res) => {
    try {
        if (global.demoMode) {
            return res.json({ success: true, mode: 'demo' });
        }

        await Message.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
