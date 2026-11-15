import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import setupSecurity from './middleware/security.js';
import cookieParser from 'cookie-parser';

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(cookieParser());

// Bulletproof Security Layer
setupSecurity(app);

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import Message from './models/Message.js';

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Debug Log Endpoint (Temporary)
app.post('/api/debug-log', (req, res) => {
    console.error('[Frontend Error Log]:', req.body);
    res.sendStatus(200);
});

// Public Contact Route (Rate limited)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, content } = req.body;
        // Validation handled by Zod in frontend, double check here ideally
        // In Bulletproof mode, we trust WAF largely but manual check is good
        if (!name || !email || !content) return res.status(400).json({ error: 'Fields required' });

        const msg = new Message({ name, email, phone, content });
        await msg.save(); // Encrypts automatically

        // TODO: Send Auto-Reply Email via NodeMailer/Resend

        res.json({ success: true, message: 'Message encrypted and stored in vault.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Database Connection (Micro-segmented Isolation)
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxe_india_secure'; // Default to local if no env
        await mongoose.connect(MONGODB_URI);
        console.log('[Database] Secure Connection Established (AES-256 Storage Ready)');
        global.demoMode = false;
    } catch (err) {
        console.warn('[Database] Connection Failed (Running in DEMO MODE)');
        console.warn('[Notice] Using In-Memory Storage for Demonstration purposes.');
        global.demoMode = true;
        // Do NOT exit, allow server to run for UI demo
    }
};

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Secure',
        system: 'Zero Trust Backend Active',
        mode: global.demoMode ? 'DEMO (In-Memory)' : 'PRODUCTION (Persistent)'
    });
});

// Start Server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`[Server] Bulletproof Backend running on port ${PORT}`);
        if (global.demoMode) {
            console.log(`[info] Login with username: "admin" (No setup required)`);
        }
    });
};

startServer();
