import { PUBLIC_API_BASE, PUBLIC_EDGE_BASE, publicStoreUrl, lookupTargetUrl } from '../utils/publicLinks';
import React, { useState } from 'react';
import { IconCheck } from './Icons';

const API_BASE = PUBLIC_API_BASE;

interface ContactPageProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Shopper',
          email: email.trim(),
          subject: subject || 'Website Inquiry',
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to send. Please email us directly at hello@rudranil.me'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={onBackToHome}
          className="hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-[#F8FAFC] font-semibold">Contact & Support</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-[#F1F5F9]">
          Contact & Curation Desk
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Report an expired deal, provide partnership inquiries, or suggest feature requests to our engineering team. Direct inquiries: <a href="mailto:hello@rudranil.me" className="text-blue-600 font-medium hover:underline">hello@rudranil.me</a>.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0D1527] border border-emerald-200 flex flex-col gap-3 items-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <IconCheck size={24} />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-[#F1F5F9]">
            Message Received
          </h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Thank you for reaching out! Your note has been dispatched to our moderation queue. We will review and respond if needed.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setMessage('');
            }}
            className="mt-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-900 dark:text-[#F1F5F9] text-xs font-bold border border-slate-300 dark:border-white/20 cursor-pointer transition-colors"
          >
            Send Another Note
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Your name" placeholder="Rohan Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address" placeholder="rohan@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
              Subject
            </label>
            <select aria-label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            >
              <option value="Feedback">Feedback & Suggestions</option>
              <option value="Expired Deal">Report an Expired / Fake Deal</option>
              <option value="Channel Partnership">Telegram Channel Partnership</option>
              <option value="Technical">Technical Bug / API Question</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
              Your Message *
            </label>
            <textarea aria-label="Your message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the deal URL, bug, or feedback..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Sending Message...' : 'Send Message →'}
          </button>
        </form>
      )}
    </div>
  );
};
