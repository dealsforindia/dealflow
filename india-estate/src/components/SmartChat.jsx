import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Phone, User, Bot, Sparkles, ChevronDown } from 'lucide-react';

/**
 * SmartChat - Intelligent Support Widget
 * Features: WhatsApp integration, Quick FAQs, AI Assistant placeholder
 * Position: Fixed bottom-left (to avoid conflict with BackToTop)
 */
const SmartChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Hi there! 👋 Welcome to India Estate.' },
        { id: 2, type: 'bot', text: 'How can I help you find your dream home today?' }
    ]);
    const [inputText, setInputText] = useState('');

    const quickActions = [
        { label: 'Chat on WhatsApp', icon: <MessageCircle className="w-4 h-4" />, action: 'whatsapp' },
        { label: 'Schedule Call', icon: <Phone className="w-4 h-4" />, action: 'call' },
        { label: 'Property Advice', icon: <Sparkles className="w-4 h-4" />, action: 'ai' }
    ];

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: inputText }]);
        setInputText('');

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: "Thanks for your message! Our team is currently offline, but we'll get back to you shortly. For urgent queries, please use WhatsApp."
            }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-80 md:w-96 glass-effect rounded-2xl overflow-hidden border border-white/20 premium-shadow mb-2 origin-bottom-left"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-accent to-emerald-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Estate Assistant</h3>
                                    <p className="text-xs text-white/80 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black/40">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.type === 'user'
                                            ? 'bg-accent text-white rounded-tr-none'
                                            : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/10'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="p-3 bg-white/5 border-t border-white/10 flex gap-2 overflow-x-auto">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-gray-300 whitespace-nowrap transition-colors"
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50"
                            />
                            <button
                                type="submit"
                                className="p-2 bg-accent hover:bg-accent/80 rounded-xl text-white transition-colors disabled:opacity-50"
                                disabled={!inputText.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="group relative flex items-center justify-center -ml-2"
            >
                {/* Pulse Effect */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-accent opacity-20 group-hover:opacity-40 animate-ping duration-1000" />
                )}

                <div className={`
                    h-14 bg-gradient-to-r from-accent to-emerald-500 rounded-full shadow-glow-lg flex items-center justify-center text-white transition-all duration-300
                    ${isHovered || isOpen ? 'px-6 w-auto' : 'w-14'}
                `}>
                    {isOpen ? (
                        <ChevronDown className="w-6 h-6" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-6 h-6" />
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-sm font-bold whitespace-nowrap overflow-hidden"
                                    >
                                        Chat with us
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Notification Badge */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#030712]">
                        1
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default SmartChat;
