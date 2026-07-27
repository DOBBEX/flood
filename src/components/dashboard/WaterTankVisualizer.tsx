"use client";

import { useSimulationStore } from "@/store/simulationStore";
import { Droplets, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

export function WaterTankVisualizer() {
  const { sensors, setSensor, state } = useSimulationStore();

  const isCritical = state === "SOS";
  const isWarning = state === "WARNING";
  const waterHeightPercent = Math.min(100, Math.max(4, (sensors.waterValue / 1023) * 100));
  const estimatedDepthCm = Math.round((sensors.waterValue / 1023) * 250);

  const fillTank = () => {
    setSensor("waterValue", Math.min(1023, sensors.waterValue + 250));
  };

  const drainTank = () => {
    setSensor("waterValue", Math.max(0, sensors.waterValue - 250));
  };

  const resetTank = () => {
    setSensor("waterValue", 150);
  };

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-zinc-800 text-white border border-zinc-700">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Reservoir Water Level</h3>
            <p className="text-xs text-zinc-400">Real-time volumetric capacity & depth</p>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
            isCritical
              ? "bg-red-500/20 text-red-300 border-red-500/50 animate-pulse"
              : isWarning
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-zinc-800 text-white border-zinc-600"
          }`}
        >
          {Math.round(waterHeightPercent)}% Full
        </span>
      </div>

      {/* Main Tank Visualizer */}
      <div className="relative w-full h-[360px] bg-zinc-950/90 rounded-2xl border border-white/10 shadow-inner overflow-hidden flex flex-col justify-end">
        
        {/* Scale Markers */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 z-30 pointer-events-none opacity-70">
          {[100, 75, 50, 25, 0].map((mark) => (
            <div key={mark} className="flex items-center justify-between w-full">
              <div className="w-6 border-t border-zinc-600"></div>
              <span className="text-[11px] font-mono font-semibold text-zinc-300 bg-zinc-900/90 px-2 py-0.5 rounded border border-white/10">
                {mark}% ({Math.round((mark / 100) * 250)}cm)
              </span>
              <div className="w-6 border-t border-zinc-600"></div>
            </div>
          ))}
        </div>

        {/* Dynamic Water Body */}
        <div
          className="w-full relative transition-all duration-1000 ease-in-out bg-gradient-to-t from-zinc-950 via-zinc-700/80 to-slate-500/70 shadow-[0_-10px_30px_rgba(255,255,255,0.1)]"
          style={{
            height: `${waterHeightPercent}%`,
            filter: isCritical ? "hue-rotate(-40deg) saturate(2)" : "none",
          }}
        >
          {/* Animated Wave Surface */}
          <div className="absolute top-0 left-0 w-[200%] h-8 -mt-4 opacity-80 overflow-hidden">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="fill-zinc-300 animate-[wave_3s_linear_infinite] w-full h-full"
            >
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
            </svg>
          </div>

          {/* Bubbles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div
                key={`bubble-${i}`}
                className="bubble"
                style={{
                  left: `${(i * 9) % 100}%`,
                  bottom: `-${(i * 10) % 30}%`,
                  animationDuration: `${2 + (i % 3) * 0.8}s`,
                  animationDelay: `${(i % 5) * 0.4}s`,
                }}
              />
            ))}
          </div>

          {/* Depth Readout Badge */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/15 text-center z-40 shadow-lg">
            <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Water Depth</div>
            <div className="text-xl font-bold text-white">{estimatedDepthCm} cm</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={fillTank}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600/60 font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowUpRight className="w-4 h-4 text-zinc-300" />
          <span>Add Water</span>
        </button>

        <button
          onClick={drainTank}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600/60 font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowDownRight className="w-4 h-4 text-zinc-300" />
          <span>Drain Water</span>
        </button>

        <button
          onClick={resetTank}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600/60 font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-zinc-300" />
          <span>Reset</span>
        </button>
      </div>

    </div>
  );
}
