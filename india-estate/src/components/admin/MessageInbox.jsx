import React from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MessageInbox = ({ messages, onMarkRead }) => {
    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages in the secure vault.</p>
            ) : (
                messages.map((msg, i) => (
                    <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl border ${msg.read ? 'bg-white/5 border-white/5' : 'bg-card border-accent/30'} hover:border-accent transition-colors`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${msg.read ? 'bg-gray-800 text-gray-400' : 'bg-accent/20 text-accent'}`}>
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{msg.name}</h4>
                                    <p className="text-xs text-gray-400">{msg.email}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleDateString()}</span>
                        </div>

                        <p className="text-gray-300 text-sm mb-3 pl-11">{msg.content}</p>

                        {!msg.read && (
                            <button
                                onClick={() => onMarkRead(msg._id)}
                                className="ml-11 text-xs flex items-center gap-1 text-accent hover:text-white transition-colors"
                            >
                                <CheckCircle className="w-3 h-3" /> Mark as Read
                            </button>
                        )}
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default MessageInbox;
