import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Phone, HelpCircle, ArrowRight } from 'lucide-react';

interface ContactPageProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome, onNavigateTab }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-14 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onBackToHome} className="hover:text-emerald-400 transition-colors">
          Home
        </button>
        <span>/</span>
        <span className="text-emerald-400 font-medium">Contact Us</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Get in Touch
        </h1>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
          Have feedback on a deal, found a broken link, or want to discuss a partnership? We respond to every inquiry within 24 hours.
        </p>
      </div>

      {/* 3 Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="mailto:hello@rudranil.me"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors group block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Support</div>
          <div className="text-sm font-semibold text-white">hello@rudranil.me</div>
          <div className="text-xs text-slate-400 mt-1">Average response: &lt; 4 hours</div>
        </a>

        <a
          href="https://t.me/dealsforindiachannel"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors group block"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Telegram Community</div>
          <div className="text-sm font-semibold text-white">@dealsforindiachannel</div>
          <div className="text-xs text-slate-400 mt-1">Live alerts & admin PMs</div>
        </a>

        <a
          href="https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors group block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">WhatsApp Channel</div>
          <div className="text-sm font-semibold text-white">IndiaDealHunts Alerts</div>
          <div className="text-xs text-slate-400 mt-1">Instant loot drops on WhatsApp</div>
        </a>
      </div>

      {/* Form & FAQ split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            {submitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Received!</h3>
                <p className="text-slate-300 text-xs max-w-sm mx-auto">
                  Thanks for reaching out. Our team has received your message and will reply to <span className="text-emerald-400">{email}</span> shortly.
                </p>
                <button
                  onClick={() => {
                    setName('');
                    setEmail('');
                    setMessage('');
                    setSubmitted(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Send us a direct message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Feedback">General Feedback or Suggestion</option>
                    <option value="Discrepancy">Report Expired or Incorrect Deal</option>
                    <option value="Bug">Technical Issue / Bug Report</option>
                    <option value="Partnership">Partnership / Brand Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Quick Accordion */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Frequently Asked Questions
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-bold text-white">How quickly do deals expire?</div>
              <p className="text-slate-400 leading-relaxed">
                Price glitches and flash drops often last between 5 and 30 minutes. To never miss a deal, keep Telegram notifications turned on.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-bold text-white">Why did the price change when I clicked?</div>
              <p className="text-slate-400 leading-relaxed">
                Stores update prices dynamically when stock depletes or sale quotas finish. If you find an expired deal, our system tags it as "OVER" on its next cycle.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-bold text-white">Can brands pay to get featured?</div>
              <p className="text-slate-400 leading-relaxed">
                No. We maintain strict editorial independence. Every deal must pass our 90-day price drop verification and quality filter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
