"use client";

import { SystemState } from "@/lib/stateMachine";
import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";

export function LedIndicator({ state }: { state: SystemState }) {
  const isGreenOn = state === "IDLE" || state === "MONITORING";
  const isYellowOn = state === "WARNING";
  const isRedOn = state === "SOS";

  return (
    <div className="grid grid-cols-3 gap-3 w-full h-full items-center">
      {/* SAFE */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center space-y-1.5 ${
          isGreenOn
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            : "bg-slate-950/40 border-white/5 text-slate-600 opacity-40"
        }`}
      >
        <ShieldCheck className="w-6 h-6" />
        <span className="text-xs font-bold tracking-wider">SAFE</span>
      </div>

      {/* WARN */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center space-y-1.5 ${
          isYellowOn
            ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse"
            : "bg-slate-950/40 border-white/5 text-slate-600 opacity-40"
        }`}
      >
        <AlertTriangle className="w-6 h-6" />
        <span className="text-xs font-bold tracking-wider">WARN</span>
      </div>

      {/* CRIT */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center space-y-1.5 ${
          isRedOn
            ? "bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.25)] animate-pulse"
            : "bg-slate-950/40 border-white/5 text-slate-600 opacity-40"
        }`}
      >
        <AlertOctagon className="w-6 h-6" />
        <span className="text-xs font-bold tracking-wider">CRITICAL</span>
      </div>
    </div>
  );
}
