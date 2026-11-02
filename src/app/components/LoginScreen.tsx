import React, { useState } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLogin: (token: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const success = await onLogin(token.trim());
      if (!success) {
        setError("Access token was not accepted. Check the token and try again.");
      }
    } catch (err) {
      setError("Could not connect to DealFlow. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="df-login flex min-h-screen w-full items-center justify-center bg-[#F8F9FD] text-[#192137] relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="df-panel w-full max-w-md p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl shadow-slate-200/50 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck size={28} className="text-[#5B50E6]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#192137] tracking-tight">
            DealFlow
          </h1>
          <p className="text-xs text-[#59657a] mt-1.5 text-center leading-relaxed">
            Deal curation and distribution engine. Sign in to review deals, manage channels, and publish.
          </p>
        </div>

        <form onSubmit={handleSubmit} aria-busy={loading} className="space-y-4">
          <div>
            <label htmlFor="admin-access-token" className="block text-xs font-semibold text-[#374151] mb-1.5">Admin access token</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={15} className="text-[#9CA3AF]" />
              </div>
              <input
                id="admin-access-token"
                name="access-token"
                required
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="df_adm_..."
                className="df-field w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#192137] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#5B50E6] focus:ring-2 focus:ring-[#5B50E6]/20 transition-all"
                autoComplete="off"
              />
            </div>
          </div>

          {error && <p id="login-error" role="alert" className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="df-primary w-full flex items-center justify-center gap-2 bg-[#5B50E6] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#4E43D8] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm shadow-indigo-500/20"
          >
            {loading ? (
              <span role="status">Signing in…</span>
            ) : (
              <>
                Sign in to Dashboard
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
