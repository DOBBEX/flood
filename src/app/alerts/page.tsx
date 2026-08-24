"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BellRing, ShieldCheck, RefreshCw, Radio, Send, Clock, AlertTriangle, AlertOctagon } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulationStore } from "@/store/simulationStore";

interface AlertRecord {
  id: string;
  state: string;
  message: string;
  recipient: string;
  status: string;
  createdAt: string | Date;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { config, timers, state, dispatchGsmSms, gsmTransmitting } = useSimulationStore();
  const [manualMsg, setManualMsg] = useState("");

  const fetchAlerts = () => {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data: any) => {
        if (Array.isArray(data)) {
          setAlerts(data);
        } else if (data.error) {
          console.error("API Error:", data.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const handleManualDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMsg.trim() || gsmTransmitting) return;
    await dispatchGsmSms(manualMsg);
    setManualMsg("");
    fetchAlerts();
  };

  // Cooldown calculation
  const lastSend = timers.lastSmsTimes[state];
  const now = Date.now();
  const isFirst = lastSend === 0;
  const remainingSec = isFirst ? 0 : Math.max(0, Math.ceil((config.smsCooldownMs - (now - lastSend)) / 1000));

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen relative overflow-hidden py-6 px-4 max-w-5xl mx-auto space-y-6 select-none pb-28 bg-[#0a0c10]"
    >
      {/* Page Header Card */}
      <motion.header variants={itemVariants} className="app-card shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-inner">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Alerts</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                SMS dispatch history & manual triggers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setLoading(true); fetchAlerts(); }}
              className="flex items-center space-x-1 text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Form & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div variants={itemVariants} className="app-card !p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-white">Send Manual Alert</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                remainingSec > 0 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
              }`}>
                {remainingSec > 0 ? `Wait ${remainingSec}s` : "Ready"}
              </span>
            </div>

            <form onSubmit={handleManualDispatch} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Type emergency broadcast advisory..."
                value={manualMsg}
                onChange={(e) => setManualMsg(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="submit"
                disabled={gsmTransmitting || !manualMsg.trim()}
                className="w-full px-4 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{gsmTransmitting ? "TX Transmitting..." : "Send SMS"}</span>
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Column - Logs Feed */}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-4">
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
              <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
              <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
            </div>
          )}

          {!loading && alerts.length === 0 && (
            <div className="app-card !p-8 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">All Clear // No Alarms Dispatched</p>
                <p className="text-xs text-zinc-400 font-mono">System standing by in safe condition.</p>
              </div>
            </div>
          )}

          {!loading && alerts.map((alert) => (
            <motion.div
              key={alert.id}
              variants={itemVariants}
              className={`app-card !p-4 space-y-2.5 ${
                alert.state === "SOS"
                  ? "border-l-4 border-l-rose-500 bg-rose-950/10"
                  : alert.state === "WARNING"
                  ? "border-l-4 border-l-amber-500 bg-amber-950/10"
                  : "border-l-4 border-l-sky-500 bg-sky-950/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                    alert.state === "SOS"
                      ? "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                      : alert.state === "WARNING"
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                      : "bg-sky-500/25 text-sky-300 border border-sky-500/40"
                  }`}>
                    {alert.state}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Target: {alert.recipient}
                  </span>
                </div>

                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <p className="text-xs text-zinc-200 font-mono leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5">
                {alert.message}
              </p>

              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-500">
                <span>GSM Protocol: AT+CMGS</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  {alert.status || "CONFIRMED +CMGS"}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
