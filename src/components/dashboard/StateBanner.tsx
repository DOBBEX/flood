"use client";

import { SystemState } from "@/lib/stateMachine";
import { ShieldCheck, Waves, AlertTriangle, AlertOctagon, Activity } from "lucide-react";

export function StateBanner({ state }: { state: SystemState }) {
  const getTheme = () => {
    switch (state) {
      case "IDLE":
        return {
          bg: "bg-zinc-900/90 border-zinc-700/60 shadow-lg",
          iconBg: "bg-zinc-800 text-white border border-zinc-700",
          badgeBg: "bg-zinc-800 text-white border-zinc-600",
          title: "Normal Operations",
          icon: ShieldCheck,
          desc: "Reservoir water levels are within safe operating limits. All systems normal.",
        };
      case "MONITORING":
        return {
          bg: "bg-zinc-900/90 border-slate-600/70 shadow-lg",
          iconBg: "bg-slate-800 text-white border border-slate-600",
          badgeBg: "bg-slate-800 text-slate-200 border-slate-600",
          title: "Active Rain Monitoring",
          icon: Waves,
          desc: "Precipitation detected. Sensor array actively monitoring inflow rates.",
        };
      case "WARNING":
        return {
          bg: "bg-amber-950/40 border-amber-500/50 shadow-[0_15px_35px_rgba(245,158,11,0.2)]",
          iconBg: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/40",
          title: "Elevated Flood Risk",
          icon: AlertTriangle,
          desc: "Water depth approaching threshold limits. Auxiliary spillways standby.",
        };
      case "SOS":
        return {
          bg: "bg-red-950/50 border-red-500/70 shadow-[0_20px_50px_rgba(239,68,68,0.35)] animate-soft-pulse",
          iconBg: "bg-red-500/25 text-red-400 border border-red-500/60",
          badgeBg: "bg-red-500/30 text-red-200 border-red-400",
          title: "Critical Flood Alert",
          icon: AlertOctagon,
          desc: "Critical water capacity reached! Automated floodgates opening. Alert dispatches sent.",
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div
      className={`w-full p-6 md:p-8 rounded-3xl border ${theme.bg} backdrop-blur-xl relative overflow-hidden transition-all duration-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}
    >
      <div className="flex items-center space-x-5 z-10">
        <div className={`p-4 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0 shadow-md`}>
          <Icon className="w-9 h-9 md:w-11 md:h-11" />
        </div>

        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">System Status</span>
            <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider ${theme.badgeBg}`}>
              {state}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {theme.title}
          </h2>
        </div>
      </div>

      <div className="z-10 w-full md:w-auto md:max-w-md">
        <div className="bg-zinc-950/80 p-4 md:p-5 rounded-2xl border border-white/10 backdrop-blur-md flex items-start space-x-3">
          <Activity className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
          <p className="text-zinc-200 text-xs md:text-sm font-medium leading-relaxed">
            {theme.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
