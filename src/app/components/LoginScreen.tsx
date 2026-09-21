import React, { useState } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface LoginScreenProps {
  onLogin: (token: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setLoading(true);
    try {
      const success = await onLogin(token.trim());
      if (!success) {
        toast.error("Invalid access token");
      }
    } catch (err) {
      toast.error("Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#07080E] text-white relative overflow-hidden">
      <div className="ambient-mesh opacity-60 absolute inset-0 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center mb-4 shadow-2xl shadow-sky-900/20">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            DealFlow Admin
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Enter your master access token to securely connect to the curation engine.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={16} className="text-slate-500" />
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="df_adm_..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all backdrop-blur-xl"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Authenticate
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
