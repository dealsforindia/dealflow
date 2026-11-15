import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const messageSchema = new mongoose.Schema({
    name: { type: Object, required: true }, // Store as { iv, content }
    email: { type: Object, required: true },
    phone: { type: Object, required: true },
    content: { type: Object, required: true }, // Encrypted body
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

// Middleware to encrypt before saving
messageSchema.pre('save', function (next) {
    if (!this.isModified('name') && !this.isModified('email') && !this.isModified('content')) return next();

    // Encrypt fields
    // Note: In real app, we need to handle if already encrypted or not carefully.
    // For this demo, we assume incoming data is plain text and we convert it.
    // BUT mongoose hook runs on the document.
    try {
        if (typeof this.name === 'string') this.name = encrypt(this.name);
        if (typeof this.email === 'string') this.email = encrypt(this.email);
        if (typeof this.phone === 'string') this.phone = encrypt(this.phone);
        if (typeof this.content === 'string') this.content = encrypt(this.content);
        next();
    } catch (err) {
        next(err);
    }
});

// Helper to get decrypted JSON
messageSchema.methods.toJSONDecrypted = function () {
    const obj = this.toObject();
    try {
        obj.name = decrypt(obj.name);
        obj.email = decrypt(obj.email);
        obj.phone = decrypt(obj.phone);
        obj.content = decrypt(obj.content);
        // keep encrypted form hidden? optional.
    } catch (e) {
        console.error('Decryption failed for message', this._id);
    }
    return obj;
};

export default mongoose.model('Message', messageSchema);
