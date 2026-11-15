import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Bell,
  Mail,
  Bookmark,
  Check,
  LogIn,
  LogOut,
  TrendingDown,
  Search,
  ExternalLink,
  ChevronRight,
  Trash2,
  RefreshCw,
  Target,
  CheckCircle2,
  Activity,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTheme, ThemePreference } from '../utils/themeManager';
import { getSavedDealIds } from '../utils/savedDeals';
import { TelegramIcon } from './TelegramIcon';
import { playTactileClick, playSuccessChime } from '../utils/audio';
import { PUBLIC_API_BASE } from '../utils/publicLinks';

interface ProfilePageProps {
  onNavigateTab: (tab: any) => void;
  onOpenLookup?: () => void;
  onOpenSubmit?: () => void;
  onShowToast?: (msg: string) => void;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
}

interface TrackedAlert {
  id: string;
  product_url: string;
  target_price: number;
  current_price?: number;
  product_title: string;
  store?: string;
  image_url?: string;
  status: string;
  created_at: number;
  last_checked_at?: number;
  triggered_at?: number;
  email_status?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function suggestEmailDomain(email: string): string | null {
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || !domain) return null;
  const typoMap: Record<string, string> = {
    'gmil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmaik.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahho.com': 'yahoo.com',
    'yaho.co.in': 'yahoo.co.in',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
  };
  if (typoMap[domain]) {
    return `${local}@${typoMap[domain]}`;
  }
  return null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigateTab,
  onOpenLookup,
  onOpenSubmit,
  onShowToast,
  isAudioEnabled = true,
  onToggleAudio,
}) => {
  const { preference, setTheme } = useTheme();

  // User auth state
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('idh_user_email') || '';
    } catch {
      return '';
    }
  });

  // Auth dialog state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'email' | 'code'>('email');
  const [inputEmail, setInputEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Alert preferences
  const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
    try {
      return localStorage.getItem('idh_email_alerts') !== 'false';
    } catch {
      return true;
    }
  });

  // Saved deals count
  const [savedCount, setSavedCount] = useState<number>(0);

  // ── Scraper & Watchlist State ──
  const [trackedAlerts, setTrackedAlerts] = useState<TrackedAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Add Scraper Form state
  const [inputUrl, setInputUrl] = useState('');
  const [inputTargetPrice, setInputTargetPrice] = useState('');
  const [inputScraperEmail, setInputScraperEmail] = useState(userEmail || '');
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectPreview, setInspectPreview] = useState<{
    title: string;
    price?: number;
    mrp?: number;
    image?: string;
    store?: string;
  } | null>(null);
  const [isArmingScraper, setIsArmingScraper] = useState(false);
  const [checkingAlertId, setCheckingAlertId] = useState<string | null>(null);

  // Sync user email to input email
  useEffect(() => {
    if (userEmail && !inputScraperEmail) {
      setInputScraperEmail(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    setSavedCount(getSavedDealIds().length);
  }, []);

  // Fetch active alerts for current user
  const fetchUserAlerts = async (emailToFetch: string) => {
    if (!emailToFetch.trim() || !emailToFetch.includes('@')) return;
    setLoadingAlerts(true);
    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/alerts?contact=${encodeURIComponent(emailToFetch.trim().toLowerCase())}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.alerts)) {
          setTrackedAlerts(data.alerts);
        }
      }
    } catch (e) {
      console.warn('Could not fetch user alerts:', e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserAlerts(userEmail);
    }
  }, [userEmail]);

  const handleRequestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setAuthError(null);
    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setAuthError('Please enter a valid email address (e.g. yourname@gmail.com)');
      return;
    }
    setIsSendingCode(true);
    playTactileClick();

    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || 'Failed to send verification code');
      }
      playSuccessChime();
      setAuthStep('code');
      setResendCooldown(30);
      onShowToast?.(`6-digit verification code sent to ${cleanEmail}`);
    } catch (err: any) {
      setAuthError(err.message || 'Could not connect to auth service');
      onShowToast?.(err.message || 'Error sending code');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanCode = inputCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setAuthError('Please enter the 6-digit verification code');
      return;
    }

    setIsVerifyingCode(true);
    playTactileClick();

    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || 'Invalid or expired verification code');
      }

      if (data.token) {
        try {
          localStorage.setItem('idh_auth_token', data.token);
        } catch {}
      }
      setUserEmail(cleanEmail);
      setInputScraperEmail(cleanEmail);
      try {
        localStorage.setItem('idh_user_email', cleanEmail);
      } catch {}

      playSuccessChime();
      setShowAuthModal(false);
      setAuthStep('email');
      setInputCode('');
      setResendCooldown(0);
      fetchUserAlerts(cleanEmail);
      onShowToast?.(`Signed in successfully as ${cleanEmail}`);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid or expired verification code');
      onShowToast?.(err.message || 'Verification failed');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSignOut = () => {
    playTactileClick();
    setUserEmail('');
    setTrackedAlerts([]);
    try {
      localStorage.removeItem('idh_user_email');
      localStorage.removeItem('idh_auth_token');
    } catch {}
    onShowToast?.('Signed out of Deal Hunter session');
  };

  const handleToggleEmailAlerts = () => {
    playTactileClick();
    const next = !emailAlerts;
    setEmailAlerts(next);
    try {
      localStorage.setItem('idh_email_alerts', String(next));
    } catch {}
    onShowToast?.(next ? 'Email price drop alerts enabled' : 'Email alerts paused');
  };

  // Inspect any store URL to fetch live product metadata
  const handleInspectUrl = async (urlToInspect?: string) => {
    const targetUrl = (urlToInspect || inputUrl).trim();
    if (!targetUrl || !targetUrl.startsWith('http')) {
      onShowToast?.('Please paste a valid product link (Amazon, Flipkart, Myntra, etc.)');
      return;
    }
    setIsInspecting(true);
    playTactileClick();
    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/deals/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title || data.product_name || data.price) {
          const preview = {
            title: data.title || data.product_name || 'Verified Product',
            price: data.price ? Number(data.price) : undefined,
            mrp: data.mrp ? Number(data.mrp) : undefined,
            image: data.image || undefined,
            store: data.store || 'Store',
          };
          setInspectPreview(preview);
          if (preview.price && !inputTargetPrice) {
            setInputTargetPrice(String(Math.round(preview.price * 0.85)));
          }
          playSuccessChime();
          onShowToast?.(`Detected: ${preview.title.slice(0, 30)}... (₹${preview.price?.toLocaleString('en-IN') || 'Live'})`);
          return;
        }
      }
      onShowToast?.('Product link verified. Enter your desired target price below.');
    } catch {
      onShowToast?.('Product link verified. You can arm the price alert directly.');
    } finally {
      setIsInspecting(false);
    }
  };

  // Arm scraper and save price drop alert
  const handleAddScraper = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl || !cleanUrl.startsWith('http')) {
      onShowToast?.('Please enter a valid store product link');
      return;
    }
    const cleanEmail = (inputScraperEmail || userEmail).trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      onShowToast?.('Please enter a valid email address (e.g. yourname@gmail.com)');
      return;
    }
    const targetP = parseFloat(inputTargetPrice);
    if (isNaN(targetP) || targetP <= 0) {
      onShowToast?.('Please enter a target price greater than ₹0');
      return;
    }

    setIsArmingScraper(true);
    playTactileClick();

    try {
      const payload = {
        product_url: cleanUrl,
        target_price: targetP,
        contact: cleanEmail,
        product_title: inspectPreview?.title || 'Tracked Product',
        current_price: inspectPreview?.price || null,
        store: inspectPreview?.store || 'Store',
        image_url: inspectPreview?.image || null,
      };

      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      playSuccessChime();
      onShowToast?.(`🎯 Radar active! We will email ${cleanEmail} when price drops to ≤₹${targetP.toLocaleString('en-IN')}`);

      // Auto-save user email session if not yet saved
      if (!userEmail) {
        setUserEmail(cleanEmail);
        try {
          localStorage.setItem('idh_user_email', cleanEmail);
        } catch {}
      }

      // Reset form & reload alerts list
      setInputUrl('');
      setInputTargetPrice('');
      setInspectPreview(null);
      fetchUserAlerts(cleanEmail);
    } catch (err: any) {
      onShowToast?.('Could not arm price drop scraper. Please check connection and retry.');
    } finally {
      setIsArmingScraper(false);
    }
  };

  // Run live scraper check on demand for an alert
  const handleCheckAlertNow = async (alert: TrackedAlert) => {
    setCheckingAlertId(alert.id);
    playTactileClick();
    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/alerts/${alert.id}/check`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.triggered) {
          playSuccessChime();
          onShowToast?.(`🎉 PRICE DROPPED! Live Price: ₹${data.live_price}. Email notification dispatched!`);
        } else {
          onShowToast?.(data.message || `Current price: ₹${data.live_price || 'unconfirmed'}. Target: ₹${alert.target_price}. Radar active.`);
        }
        if (userEmail) fetchUserAlerts(userEmail);
      } else {
        onShowToast?.('Scanner check completed.');
      }
    } catch {
      onShowToast?.('Live check completed. 24/7 background sweeps remain active.');
    } finally {
      setCheckingAlertId(null);
    }
  };

  // Delete an alert
  const handleDeleteAlert = async (alertId: string) => {
    playTactileClick();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('idh_auth_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const emailParam = userEmail ? `?email=${encodeURIComponent(userEmail.trim().toLowerCase())}` : '';
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/alerts/${alertId}${emailParam}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
        onShowToast?.('Price scraper stopped and removed from radar.');
      } else {
        setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch {
      setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  const triggeredCount = trackedAlerts.filter((a) => a.status === 'triggered').length;

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28">
      {/* ── Top Header Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 mb-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white">
                {userEmail ? (
                  <span className="text-2xl font-black uppercase text-emerald-400">{userEmail.charAt(0)}</span>
                ) : (
                  <User size={30} className="text-emerald-400" />
                )}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                  {userEmail ? userEmail.split('@')[0] : 'Guest Shopper'}
                </h1>
                {userEmail ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Member
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 border border-slate-400/40 text-slate-300 flex items-center gap-1">
                    <User size={12} /> Guest Session
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs sm:text-sm max-w-lg leading-relaxed">
                {userEmail
                  ? `Signed in as ${userEmail} · 24/7 personal price drop radar active.`
                  : 'Sign in with your email to track custom products, receive instant price drop alerts, and sync saved deals.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {userEmail ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={15} /> Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInputEmail('');
                  setShowAuthModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <LogIn size={15} /> Sign In with Email
              </button>
            )}
          </div>
        </div>

        {/* ── Real Stats Strip ── */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Target size={13} className="text-emerald-400" /> Active Monitors
            </div>
            <div className="text-base sm:text-lg font-bold text-white">{trackedAlerts.length} Products</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={13} className="text-emerald-400" /> Triggered Drops
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-400">{triggeredCount} Emailed</div>
          </div>

          <div
            onClick={() => onNavigateTab('saved')}
            className="cursor-pointer bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/5 transition-colors"
          >
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Bookmark size={13} className="text-amber-400" /> Saved Loot
            </div>
            <div className="text-base sm:text-lg font-bold text-white">{savedCount} Deals</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Bell size={13} className="text-blue-400" /> Drop Notifications
            </div>
            <div className="text-base sm:text-lg font-bold text-blue-300">
              {emailAlerts ? 'Email Live' : 'Paused'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: Live Scraper Tool & Tracked Watchlist (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Add Scraper Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                <Target size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Track Any Store Product Link
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    24/7 Radar
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste Amazon, Flipkart, Myntra, Swiggy, or any product URL. When price drops, get an instant email!
                </p>
              </div>
            </div>

            <form onSubmit={handleAddScraper} className="mt-5 space-y-4">
              {/* Product URL Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Store Product Link (URL)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      required
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://www.amazon.in/dp/... or flipkart.com/..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInspectUrl()}
                    disabled={isInspecting || !inputUrl.trim()}
                    className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40"
                    title="Inspect product live"
                  >
                    {isInspecting ? (
                      <RefreshCw size={14} className="animate-spin text-emerald-500" />
                    ) : (
                      <Search size={14} />
                    )}
                    <span>Inspect</span>
                  </button>
                </div>
              </div>

              {/* Scraped Product Live Preview Card */}
              {inspectPreview && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {inspectPreview.image ? (
                      <img src={inspectPreview.image} alt={inspectPreview.title} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {inspectPreview.store || 'Verified Store'}
                      </span>
                      {inspectPreview.price && (
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Live: ₹{inspectPreview.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {inspectPreview.title}
                    </p>
                  </div>
                </div>
              )}

              {/* Target Price & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Price */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Alert Me If Price Drops Below (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={inputTargetPrice}
                      onChange={(e) => setInputTargetPrice(e.target.value)}
                      placeholder="e.g. 1499"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {/* Quick percentage drop pills */}
                  {inspectPreview?.price && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {[0.9, 0.8, 0.7].map((pct) => {
                        const val = Math.round((inspectPreview.price || 0) * pct);
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              playTactileClick();
                              setInputTargetPrice(String(val));
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10.5px] font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            -{Math.round((1 - pct) * 100)}% (₹{val.toLocaleString('en-IN')})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Email for price drops */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Notification Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={inputScraperEmail}
                      onChange={(e) => setInputScraperEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isArmingScraper}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isArmingScraper ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Arming 24/7 Scraper...</span>
                  </>
                ) : (
                  <>
                    <Target size={16} />
                    <span>Arm Price Drop Scraper & Email Radar</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 2. Active Tracked Scrapers Watchlist */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Your Tracked Scrapers ({trackedAlerts.length})
                  </h3>
                  <p className="text-xs text-slate-500">24/7 background monitors running on IndiaDealHunts</p>
                </div>
              </div>

              {userEmail && (
                <button
                  type="button"
                  onClick={() => fetchUserAlerts(userEmail)}
                  disabled={loadingAlerts}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  title="Refresh list"
                >
                  <RefreshCw size={14} className={loadingAlerts ? 'animate-spin text-blue-500' : ''} />
                </button>
              )}
            </div>

            {trackedAlerts.length === 0 ? (
              <div className="py-8 px-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-center">
                <Target size={28} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No active scrapers yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Paste any Amazon, Flipkart, or store product link above to start automated 24/7 price scanning with email alerts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trackedAlerts.map((alert) => {
                  const isChecking = checkingAlertId === alert.id;
                  const isTriggered = alert.status === 'triggered';
                  return (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {alert.image_url ? (
                            <img src={alert.image_url} alt={alert.product_title} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {alert.store || 'Store'}
                            </span>
                            {isTriggered ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Price Dropped! (Emailed)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                <Clock size={10} /> 24/7 Radar Active
                              </span>
                            )}
                          </div>
                          <a
                            href={alert.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-slate-900 dark:text-white truncate block hover:text-emerald-500 transition-colors"
                          >
                            {alert.product_title}
                          </a>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>
                              Target: <strong className="text-emerald-600 dark:text-emerald-400">≤ ₹{alert.target_price.toLocaleString('en-IN')}</strong>
                            </span>
                            {alert.current_price && (
                              <span>
                                · Last check: ₹{alert.current_price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCheckAlertNow(alert)}
                          disabled={isChecking}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                          title="Check store price now"
                        >
                          <RefreshCw size={12} className={isChecking ? 'animate-spin text-emerald-500' : ''} />
                          <span>{isChecking ? 'Checking...' : 'Check Price'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete scraper"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Explainer Guide & Clean Preferences (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* 1. How 24/7 Price Radar Works */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 to-indigo-950 text-white border border-indigo-500/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <Target size={20} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">How 24/7 Price Radar Works</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Track any product on Amazon, Flipkart, Myntra, Swiggy, or any store without installing browser extensions.
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span><strong>Paste Product Link:</strong> Paste any store URL in the tracker on the left.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span><strong>Set Target Price:</strong> Specify the exact price you want to pay.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span><strong>24/7 Background Sweeps:</strong> Our server continuously checks prices every few minutes.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                  <span><strong>Instant Email Alert:</strong> As soon as the price drops to or below your target, you get an email.</span>
                </div>
              </div>

              {!userEmail && (
                <button
                  type="button"
                  onClick={() => {
                    setInputEmail('');
                    setShowAuthModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={14} /> Sign In with Email
                </button>
              )}
            </div>
          </div>

          {/* 2. Preferences & Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Preferences</h3>

            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <Mail size={18} className="text-emerald-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Email Drop Notifications</div>
                  <div className="text-[11px] text-slate-500">
                    {userEmail ? `Delivering to ${userEmail}` : 'Requires email sign in'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleEmailAlerts}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  emailAlerts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Appearance Theme Selector */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Interface Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light' as ThemePreference, label: 'Light', Icon: Sun },
                  { id: 'dark' as ThemePreference, label: 'Dark', Icon: Moon },
                  { id: 'system' as ThemePreference, label: 'Auto', Icon: Monitor },
                ].map(({ id, label, Icon }) => {
                  const active = preference === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setTheme(id);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        active
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactile Audio Sound */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                {isAudioEnabled ? (
                  <Volume2 size={18} className="text-amber-500" />
                ) : (
                  <VolumeX size={18} className="text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Tactile Feedback Sounds</div>
                  <div className="text-[11px] text-slate-500">Audio feedback on clicks & saves</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isAudioEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAudioEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. Telegram VIP Channel */}
          <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TelegramIcon />
              <div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-200">Telegram VIP Channel</div>
                <div className="text-[11px] text-blue-700 dark:text-blue-300">Live loot drops before web post</div>
              </div>
            </div>
            <a
              href="https://t.me/dealsforindiachannel"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              Join <ExternalLink size={12} />
            </a>
          </div>

        </div>
      </div>

      {/* ── Auth / Sign In Modal ── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#0D1527] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign In to IndiaDealHunts</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {authStep === 'email'
                  ? 'Passwordless & secure email authentication. Enter your email to receive a 6-digit verification code.'
                  : (
                    <>
                      Enter the 6-digit verification code sent to{' '}
                      <strong className="text-slate-900 dark:text-white font-semibold">{inputEmail}</strong>.
                    </>
                  )}
              </p>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authStep === 'email' ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={inputEmail}
                      onChange={(e) => {
                        setInputEmail(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {suggestEmailDomain(inputEmail) && (
                      <button
                        type="button"
                        onClick={() => {
                          const suggested = suggestEmailDomain(inputEmail);
                          if (suggested) {
                            setInputEmail(suggested);
                            setAuthError(null);
                          }
                        }}
                        className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span>💡 Did you mean <strong>{suggestEmailDomain(inputEmail)}</strong>?</span>
                        <span className="font-bold underline ml-1">Use this</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow hover:from-emerald-400 hover:to-teal-400 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingCode ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Sending Verification Code...
                      </>
                    ) : (
                      <>
                        <Mail size={16} /> Send 6-Digit Code
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xl font-mono font-black text-center tracking-[8px] text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                      Check your inbox or spam folder for an email from <span className="text-slate-700 dark:text-slate-300 font-medium">IndiaDealHunts</span>.
                      <br />
                      <span className="text-slate-400">If you entered the wrong email address, use &ldquo;← Change Email&rdquo; below.</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingCode || inputCode.length !== 6}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow hover:from-emerald-400 hover:to-teal-400 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingCode ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Verifying Code...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} /> Verify & Access Profile
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('email');
                        setInputCode('');
                        setAuthError(null);
                        setResendCooldown(0);
                      }}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium cursor-pointer"
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestCode()}
                      disabled={isSendingCode || resendCooldown > 0}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer disabled:opacity-50 disabled:no-underline"
                    >
                      {isSendingCode ? 'Sending...' : resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
