import React, { useState, useEffect, useCallback } from "react";
import {
  Cpu, Zap, Shield, Flame, CheckCircle2, AlertTriangle,
  Sliders, Plus, Trash2, RotateCw, Play, Sparkles, Check, X
} from "lucide-react";
import { toast } from "sonner";

export interface AutoRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    min_discount_pct?: number;
    stores?: string[];
    min_score?: number;
    min_consensus?: number;
    min_temperature?: number;
    min_price?: number;
    max_price?: number;
    affiliate_applied?: boolean;
    is_deal?: boolean;
    price_glitch_only?: boolean;
  };
  action: "auto_approve";
}

interface Props {
  apiBase: string;
}

const AVAILABLE_STORES = ["amazon", "flipkart", "myntra", "ajio", "shopsy", "swiggy", "blinkit", "zepto"];

export const SmartAutoRulesDeck: React.FC<Props> = ({ apiBase }) => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [rules, setRules] = useState<AutoRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Simulator state
  const [simDiscount, setSimDiscount] = useState<number>(70);
  const [simStore, setSimStore] = useState<string>("amazon");
  const [simScore, setSimScore] = useState<number>(80);
  const [simConsensus, setSimConsensus] = useState<number>(2);
  const [simPrice, setSimPrice] = useState<number>(499);
  const [simResult, setSimResult] = useState<{ matched: boolean; rule_name: string } | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  // New Rule Form
  const [newRuleName, setNewRuleName] = useState<string>("");
  const [newRuleDiscount, setNewRuleDiscount] = useState<number>(60);
  const [newRuleScore, setNewRuleScore] = useState<number>(70);
  const [newRuleConsensus, setNewRuleConsensus] = useState<number>(1);
  const [newRuleStores, setNewRuleStores] = useState<string[]>(["amazon", "flipkart"]);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/settings/auto-rules`);
      if (res.ok) {
        const data = await res.json();
        setEnabled(data.enabled !== false);
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error("Failed to load auto-rules:", err);
      toast.error("Could not load auto-rules configuration");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const saveRules = async (updatedRules = rules, masterEnabled = enabled) => {
    try {
      setSaving(true);
      const res = await fetch(`${apiBase}/api/v1/settings/auto-rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: masterEnabled,
          rules: updatedRules,
        }),
      });
      if (res.ok) {
        toast.success("🤖 Smart Auto-Rules saved & synced to workers!");
      } else {
        toast.error("Failed to save auto-rules");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Network error while saving auto-rules");
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = (ruleId: string) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    setRules(updated);
    saveRules(updated, enabled);
  };

  const updateRuleDiscount = (ruleId: string, disc: number) => {
    const updated = rules.map((r) =>
      r.id === ruleId
        ? { ...r, conditions: { ...r.conditions, min_discount_pct: disc } }
        : r
    );
    setRules(updated);
  };

  const updateRuleConsensus = (ruleId: string, cons: number) => {
    const updated = rules.map((r) =>
      r.id === ruleId
        ? { ...r, conditions: { ...r.conditions, min_consensus: cons } }
        : r
    );
    setRules(updated);
  };

  const toggleStoreInRule = (ruleId: string, store: string) => {
    const updated = rules.map((r) => {
      if (r.id !== ruleId) return r;
      const currentStores = r.conditions.stores || [];
      const hasStore = currentStores.includes(store);
      const newStores = hasStore
        ? currentStores.filter((s) => s !== store)
        : [...currentStores, store];
      return {
        ...r,
        conditions: { ...r.conditions, stores: newStores.length > 0 ? newStores : undefined },
      };
    });
    setRules(updated);
  };

  const deleteRule = (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this auto-rule?")) return;
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    saveRules(updated, enabled);
  };

  const handleCreateRule = () => {
    if (!newRuleName.trim()) {
      toast.error("Please enter a rule name");
      return;
    }
    const id = `rule_${Date.now()}`;
    const newRule: AutoRule = {
      id,
      name: newRuleName.trim(),
      enabled: true,
      conditions: {
        min_discount_pct: newRuleDiscount,
        min_score: newRuleScore,
        min_consensus: newRuleConsensus,
        stores: newRuleStores.length > 0 ? newRuleStores : undefined,
        is_deal: true,
        affiliate_applied: true,
      },
      action: "auto_approve",
    };
    const updated = [...rules, newRule];
    setRules(updated);
    saveRules(updated, enabled);
    setShowAddModal(false);
    setNewRuleName("");
  };

  const runSimulation = async () => {
    try {
      setSimulating(true);
      const payload = {
        prices: { sale: simPrice, mrp: Math.round(simPrice / (1 - simDiscount / 100)), discount_pct: simDiscount },
        platforms: [simStore],
        deal_score: simScore,
        cluster_count: simConsensus,
        affiliate_applied: true,
        intent: "IS_DEAL",
      };
      const res = await fetch(`${apiBase}/api/v1/settings/auto-rules/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult({ matched: data.matched, rule_name: data.rule_name });
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header Banner & Master Toggle */}
      <div className="p-5 rounded-3xl glass-panel border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-teal-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Cpu size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Smart Auto-Approve Engine v2</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black border ${
                enabled
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40"
              }`}>
                {enabled ? "● 24/7 AUTONOMOUS ACTIVE" : "PAUSED"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-condition decision engine evaluating discounts, store reputation, consensus signals, and price glitch anomalies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              saveRules(rules, next);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all cursor-pointer ${
              enabled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30"
            }`}
          >
            <Zap size={14} />
            <span>{enabled ? "Engine Enabled" : "Engine Paused"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isLoot = rule.id === "mega_loot" || rule.id === "fat_finger_glitch";
          const isFire = rule.id === "desidime_fire";
          return (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl glass-card border transition-all flex flex-col justify-between ${
                rule.enabled
                  ? "border-emerald-500/30 bg-[#0c121e]/90 shadow-md shadow-emerald-950/20"
                  : "border-white/5 bg-slate-950/50 opacity-60"
              }`}
            >
              <div>
                {/* Rule Top Row */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{rule.name.split(" ")[0]}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {rule.name.replace(/^[^\s]+\s*/, "")}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        ID: {rule.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRule(rule.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        rule.enabled
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border-white/10"
                      }`}
                    >
                      {rule.enabled ? "ACTIVE" : "OFF"}
                    </button>
                    {rule.id.startsWith("rule_") && (
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rule Conditions */}
                <div className="py-3 flex flex-col gap-2.5 text-xs">
                  {/* Discount Slider */}
                  {rule.conditions.min_discount_pct !== undefined && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Min Discount Required:</span>
                        <span className="font-extrabold text-emerald-400">
                          {rule.conditions.min_discount_pct}% OFF
                        </span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="90"
                        step="5"
                        value={rule.conditions.min_discount_pct}
                        onChange={(e) => updateRuleDiscount(rule.id, parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-400 cursor-pointer h-1 bg-white/10 rounded-lg"
                      />
                    </div>
                  )}

                  {/* Consensus requirement */}
                  {rule.conditions.min_consensus !== undefined && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Cross-Channel Consensus:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => updateRuleConsensus(rule.id, cnt)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                              rule.conditions.min_consensus === cnt
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-white/5 text-slate-400 border-white/10"
                            }`}
                          >
                            {cnt === 1 ? "1x (Solo)" : `${cnt}x Channels`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Store Multi-Select Tags */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-400">Eligible Stores:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {AVAILABLE_STORES.map((st) => {
                        const isSelected = (rule.conditions.stores || []).includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => toggleStoreInRule(rule.id, st)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                                : "bg-white/5 text-slate-500 border-white/5 hover:text-slate-300"
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Guardrails summary */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 text-[10.5px] text-slate-400 font-mono">
                    {rule.conditions.min_score && (
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                        Score ≥ {rule.conditions.min_score}
                      </span>
                    )}
                    {rule.conditions.min_price && (
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                        Price ≥ ₹{rule.conditions.min_price}
                      </span>
                    )}
                    {rule.conditions.min_temperature && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Temp ≥ {rule.conditions.min_temperature}°
                      </span>
                    )}
                    {rule.conditions.price_glitch_only && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        🚨 Price-Glitch Filter
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action pill */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Shield size={12} className="text-emerald-400" />
                  Action:
                </span>
                <span className="font-extrabold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ⚡ Auto-Approve & Broadcast
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Trigger Button */}
      <div className="flex items-center justify-end gap-3 p-3 rounded-2xl glass-panel border border-white/10">
        <span className="text-xs text-slate-400">
          Changes take effect instantly across all VM background workers.
        </span>
        <button
          onClick={() => saveRules()}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RotateCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          <span>{saving ? "Saving..." : "Save & Sync Rules"}</span>
        </button>
      </div>

      {/* Live Deal Rule Simulator / Sandbox */}
      <div className="p-5 rounded-3xl glass-panel border border-indigo-500/20 bg-gradient-to-br from-[#0c1024] to-[#080d1a] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Live Rule Simulator & Match Tester</h3>
          </div>
          <button
            onClick={runSimulation}
            disabled={simulating}
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {simulating ? <RotateCw size={12} className="animate-spin" /> : <Play size={12} />}
            <span>Test Payload</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Discount %</label>
            <input
              type="number"
              value={simDiscount}
              onChange={(e) => setSimDiscount(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Store</label>
            <select
              value={simStore}
              onChange={(e) => setSimStore(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
            >
              {AVAILABLE_STORES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Deal Score (0-100)</label>
            <input
              type="number"
              value={simScore}
              onChange={(e) => setSimScore(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Consensus</label>
            <input
              type="number"
              value={simConsensus}
              onChange={(e) => setSimConsensus(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Price (₹)</label>
            <input
              type="number"
              value={simPrice}
              onChange={(e) => setSimPrice(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
        </div>

        {simResult && (
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-slide-up ${
            simResult.matched
              ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-200 border-rose-500/30"
          }`}>
            <div className="flex items-center gap-2">
              {simResult.matched ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-rose-400" />}
              <span>
                {simResult.matched
                  ? `Match Confirmed! Auto-approves under: "${simResult.rule_name}"`
                  : "No Rule Matched — This deal will safely wait in the Pending Queue for manual curator review."}
              </span>
            </div>
            <span className="font-mono text-[11px] opacity-75">
              {simResult.matched ? "AUTO_POST_READY" : "MANUAL_REVIEW"}
            </span>
          </div>
        )}
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e1322] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-emerald-400" />
                <span>Add Smart Auto-Rule</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. ⚡ Fashion Steal Deals"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Min Discount (%)</label>
                  <input
                    type="number"
                    value={newRuleDiscount}
                    onChange={(e) => setNewRuleDiscount(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Min Deal Score</label>
                  <input
                    type="number"
                    value={newRuleScore}
                    onChange={(newS) => setNewRuleScore(parseInt(newS.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Min Channels Consensus</label>
                <select
                  value={newRuleConsensus}
                  onChange={(e) => setNewRuleConsensus(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                >
                  <option value={1}>1x (Solo Channel Drop)</option>
                  <option value={2}>2x (Spotted on 2+ Channels)</option>
                  <option value={3}>3x (Universal Consensus)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Target Stores</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVAILABLE_STORES.map((s) => {
                    const sel = newRuleStores.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setNewRuleStores(
                            sel ? newRuleStores.filter((x) => x !== s) : [...newRuleStores, s]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                          sel
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                            : "bg-slate-900 text-slate-500 border-white/5"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-500 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/30"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
