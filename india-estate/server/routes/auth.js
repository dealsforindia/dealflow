import express from 'express';
const router = express.Router();
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const PRO_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5174'; // Updated to 5174
const RP_ID = 'localhost'; // Relaying Party ID

// In-Memory User Store for Demo Mode
const demoUsers = [];

// Helper to find user (DB or Memory)
const findUser = async (username) => {
    if (global.demoMode) {
        return demoUsers.find(u => u.username === username);
    }
    return await User.findOne({ username });
};

// Helper to save user (DB or Memory)
const saveUser = async (user) => {
    if (global.demoMode) {
        const existing = demoUsers.findIndex(u => u.username === user.username);
        if (existing >= 0) demoUsers[existing] = user;
        else demoUsers.push(user);
        return user;
    }
    return await user.save();
};

// 1. REGISTER: Generate Options
router.post('/register/start', async (req, res) => {
    const { username } = req.body;

    // Check if user exists (or create on fly for demo)
    let user = await findUser(username);
    if (!user) {
        if (global.demoMode) {
            user = {
                _id: 'demo_id_' + Date.now(),
                username,
                devices: [],
                role: 'admin' // Force admin for demo
            };
            demoUsers.push(user);
        } else {
            user = new User({ username });
            await user.save();
        }
    }

    const options = await generateRegistrationOptions({
        rpName: 'LuxeIndia Secure',
        rpID: RP_ID,
        userID: user._id.toString(),
        userName: user.username,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
    });

    user.currentChallenge = options.challenge;
    await saveUser(user);

    res.json(options);
});

// 2. REGISTER: Verify Response
router.post('/register/finish', async (req, res) => {
    const { username, response } = req.body;
    const user = await findUser(username);

    if (!user) return res.status(404).json({ error: 'User not found' });

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: PRO_ORIGIN,
            expectedRPID: RP_ID,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
        const newDevice = {
            credentialID: Buffer.from(registrationInfo.credentialID).toString('base64url'),
            credentialPublicKey: Buffer.from(registrationInfo.credentialPublicKey),
            counter: registrationInfo.counter,
            transports: response.response.transports,
        };

        if (global.demoMode) {
            user.devices.push(newDevice);
        } else {
            user.devices.push({
                ...newDevice,
                credentialPublicKey: Buffer.from(registrationInfo.credentialPublicKey) // Buffer for Mongo
            });
        }

        user.currentChallenge = undefined; // Clear challenge
        await saveUser(user);
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false });
    }
});

// 3. LOGIN: Generate Options
router.post('/login/start', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await findUser(username);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            userVerification: 'preferred',
            allowCredentials: user.devices.map(dev => ({
                id: Buffer.from(dev.credentialID, 'base64url'),
                type: 'public-key',
                transports: dev.transports,
            })),
        });

        user.currentChallenge = options.challenge;
        await saveUser(user);

        res.json(options);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 4. LOGIN: Verify Response
router.post('/login/finish', async (req, res) => {
    const { username, response } = req.body;
    const user = await findUser(username);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const authenticator = user.devices.find(dev =>
        dev.credentialID === response.id
    );

    if (!authenticator) return res.status(400).json({ error: 'Authenticator not registered' });

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: PRO_ORIGIN,
            expectedRPID: RP_ID,
            authenticator: {
                credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
                credentialPublicKey: authenticator.credentialPublicKey,
                counter: authenticator.counter,
            },
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        authenticator.counter = authenticationInfo.newCounter;
        user.currentChallenge = undefined;
        await saveUser(user);

        // Issue JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_vault_key', { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400000 // 1 day
        });

        res.json({ verified: true, role: user.role });
    } else {
        res.status(400).json({ verified: false });
    }
});

// 5. LOGIN: Password (Fallback)
router.post('/login/password', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Simple Hardcoded Check for Demo
        if (username === 'admin' && password === 'admin123') {
            const user = { _id: 'admin_id', username: 'admin', role: 'admin' };

            // Issue JWT
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_vault_key', { expiresIn: '1d' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400000 // 1 day
            });

            return res.json({ verified: true, role: 'admin' });
        }

        return res.status(401).json({ error: 'Invalid Credentials' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
