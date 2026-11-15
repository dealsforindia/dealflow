"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, FolderGit2, Send, Check } from "lucide-react";

const EMAIL = "sahanilotpal005@gmail.com";

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<string | null>(null);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      /* clipboard blocked — the address is visible on screen as a fallback */
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    const subject = service
      ? `Project inquiry — ${service}`
      : "Project inquiry — Nilotpal Saha portfolio";

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      service ? `Focus: ${service}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDraft(href);
    window.location.href = href;
  };

  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6 scroll-mt-28" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Get in touch
          </h2>
          <p className="text-sm text-slate-400 mb-9 leading-relaxed max-w-md">
            Send a brief — scope, deadline, and what the work needs to do. I reply to
            everything within two working days.
          </p>

          <div className="flex flex-col divide-y divide-white/5 border-y border-white/5">
            <a
              href={`tel:+917003996685`}
              className="flex items-center gap-4 py-4 group"
            >
              <Phone className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              <div>
                <span className="block text-sm font-semibold text-white">+91 70039 96685</span>
                <span className="text-xs text-slate-500">Tap to call</span>
              </div>
            </a>

            <button
              type="button"
              onClick={copyEmail}
              className="flex items-center gap-4 py-4 text-left group cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Mail className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              )}
              <div>
                <span className="block text-sm font-semibold text-white">{EMAIL}</span>
                <span className="text-xs text-slate-500">
                  {copied ? "Copied" : "Click to copy"}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-4 py-4">
              <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <span className="block text-sm font-semibold text-white">Kolkata, India</span>
                <span className="text-xs text-slate-500">Working remotely worldwide</span>
              </div>
            </div>

            <a
              href="https://drive.google.com/drive/folders/1hdfEVgvwOKkYJGhdHjabrn6sF3IdND27"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 py-4 group"
            >
              <FolderGit2 className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              <div>
                <span className="block text-sm font-semibold text-white">Full work archive</span>
                <span className="text-xs text-slate-500">Google Drive</span>
              </div>
            </a>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                aria-label="Your name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Your email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              aria-label="Project focus"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">What do you need? (optional)</option>
              <option value="Graphic design & branding">Graphic design &amp; branding</option>
              <option value="Video editing & reels">Video editing &amp; reels</option>
              <option value="Motion graphics & 3D">Motion graphics &amp; 3D</option>
              <option value="Poster & collateral">Poster &amp; collateral</option>
              <option value="Full-time role">Full-time creative role</option>
            </select>

            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scope, deadline, and what the work needs to achieve."
              aria-label="Project details"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors resize-none"
            />

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3.5 rounded-full transition-colors cursor-pointer"
            >
              <span>Open in email app</span>
              <Send className="w-4 h-4" />
            </button>

            <p className="text-xs text-slate-500 leading-relaxed">
              This opens your email client with the brief filled in.{" "}
              {draft && (
                <a href={draft} className="text-blue-400 hover:text-blue-300 underline">
                  Nothing happened? Open it manually.
                </a>
              )}{" "}
              Prefer to write directly? <a href={`mailto:${EMAIL}`} className="text-blue-400 hover:text-blue-300 underline">{EMAIL}</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
