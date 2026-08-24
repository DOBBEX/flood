"use client";

import { SystemState } from "@/lib/stateMachine";
import { ShieldCheck, CloudRain, AlertTriangle, AlertOctagon } from "lucide-react";

export function StateBanner({ state, reason }: { state: SystemState; reason?: string }) {
  const getTheme = () => {
    switch (state) {
      case "IDLE":
        return {
          bg: "bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-transparent",
          border: "border-emerald-500/30",
          icon: ShieldCheck,
          iconColor: "text-emerald-400",
          iconBg: "bg-emerald-500/15 border-emerald-500/30",
          dot: "bg-emerald-400",
          title: "All Clear",
          sub: "No rain detected. System on standby.",
        };
      case "MONITORING":
        return {
          bg: "bg-gradient-to-r from-sky-950/40 via-sky-900/20 to-transparent",
          border: "border-sky-500/30",
          icon: CloudRain,
          iconColor: "text-sky-400",
          iconBg: "bg-sky-500/15 border-sky-500/30",
          dot: "bg-sky-400",
          title: "Rain Detected",
          sub: "Monitoring water levels. Sensors polling every 2s.",
        };
      case "WARNING":
        return {
          bg: "bg-gradient-to-r from-amber-950/50 via-amber-900/20 to-transparent",
          border: "border-amber-500/40",
          icon: AlertTriangle,
          iconColor: "text-amber-400",
          iconBg: "bg-amber-500/15 border-amber-500/30",
          dot: "bg-amber-400",
          title: "Water Rising",
          sub: "Distance below 30cm. Yellow LED active.",
        };
      case "SOS":
        return {
          bg: "bg-gradient-to-r from-rose-950/60 via-rose-900/30 to-transparent",
          border: "border-rose-500/50",
          icon: AlertOctagon,
          iconColor: "text-rose-400",
          iconBg: "bg-rose-500/20 border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.4)]",
          dot: "bg-rose-400 animate-pulse",
          title: "Emergency SOS",
          sub: "Both sensors triggered. Siren active, SMS sent.",
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className={`app-card ${theme.bg} border ${theme.border} relative overflow-hidden p-4 sm:p-5 shadow-2xl transition-all duration-300`}>
      <div className="relative z-10 flex items-center space-x-3 sm:space-x-4">
        <div className={`p-3 rounded-2xl border ${theme.iconBg} shrink-0`}>
          <Icon className={`w-6 h-6 ${theme.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-0.5">
            <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
            <h2 className="text-base sm:text-lg font-bold text-white">{theme.title}</h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed truncate">
            {reason || theme.sub}
          </p>
        </div>
      </div>
    </div>
  );
}
