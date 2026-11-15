import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    currentChallenge: { type: String }, // For WebAuthn flows
    devices: [{ // Registered Authenticators (Passkeys)
        credentialID: { type: String, required: true },
        credentialPublicKey: { type: Buffer, required: true },
        counter: { type: Number, required: true },
        transports: [String]
    }],
    role: { type: String, default: 'user', enum: ['user', 'admin'] }
});

export default mongoose.model('User', userSchema);
