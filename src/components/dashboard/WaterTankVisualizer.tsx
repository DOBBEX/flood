"use client";

import { useSimulationStore } from "@/store/simulationStore";
import { Droplets, ArrowUp, ArrowDown, RefreshCw, Waves, Gauge } from "lucide-react";

export function WaterTankVisualizer() {
  const { sensors, setSensor, state } = useSimulationStore();

  const isCritical = state === "SOS";
  const isWarning = state === "WARNING";

  const waterHeightPercent = Math.min(100, Math.max(5, (sensors.waterValue / 1023) * 100));

  const fillTank = () => {
    const newWater = Math.min(1023, sensors.waterValue + 250);
    const newDist = Math.max(5, Math.round(150 - (newWater / 1023) * 140));
    setSensor("waterValue", newWater);
    setSensor("distance", newDist);
  };

  const drainTank = () => {
    const newWater = Math.max(0, sensors.waterValue - 250);
    const newDist = Math.min(200, Math.round(150 - (newWater / 1023) * 140));
    setSensor("waterValue", newWater);
    setSensor("distance", newDist);
  };

  const resetTank = () => {
    setSensor("waterValue", 50);
    setSensor("distance", 120);
    setSensor("rainAo", 1023);
  };

  return (
    <div className="app-card relative overflow-hidden flex flex-col space-y-4 border-t-4 border-t-cyan-500">
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Waves className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-white">Live Reservoir Simulation</span>
        </div>

        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
            isCritical
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : isWarning
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          }`}
        >
          {Math.round(waterHeightPercent)}% Full
        </span>
      </div>

      {/* Reservoir Visual */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-[#0a0c10] rounded-2xl overflow-hidden flex flex-col justify-end border border-white/5 shadow-inner">
        {/* Dynamic ambient background glow inside tank */}
        <div 
          className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${
            isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-cyan-500"
          } mix-blend-screen blur-3xl`}
        />

        {/* Sensor head (Ultrasonic) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
          <div className="bg-[#1a1c23] border border-white/10 px-3 py-1 rounded-full flex items-center space-x-2 text-[10px] text-zinc-300 shadow-xl backdrop-blur-md">
            <Gauge className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span><strong>{Math.round(sensors.distance)} cm</strong></span>
          </div>
          {/* Sonar beam */}
          <div className="w-1 h-32 bg-gradient-to-b from-cyan-400/20 to-transparent mt-1 animate-pulse" />
        </div>

        {/* Level markers */}
        <div className="absolute inset-0 flex flex-col justify-between py-8 px-4 z-20 pointer-events-none">
          <div className="flex items-center justify-between w-full opacity-60">
            <div className="w-12 border-t-2 border-dashed border-rose-500/50"></div>
            <span className="text-[9px] font-bold text-rose-400 bg-rose-950/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-rose-500/20 shadow">
              Critical (15cm)
            </span>
            <div className="w-12 border-t-2 border-dashed border-rose-500/50"></div>
          </div>

          <div className="flex items-center justify-between w-full opacity-60">
            <div className="w-12 border-t-2 border-dashed border-amber-500/50"></div>
            <span className="text-[9px] font-bold text-amber-400 bg-amber-950/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-500/20 shadow">
              Warning (30cm)
            </span>
            <div className="w-12 border-t-2 border-dashed border-amber-500/50"></div>
          </div>

          <div className="flex items-center justify-between w-full opacity-60">
            <div className="w-12 border-t-2 border-dashed border-emerald-500/50"></div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-emerald-500/20 shadow">
              Safe Baseline
            </span>
            <div className="w-12 border-t-2 border-dashed border-emerald-500/50"></div>
          </div>
        </div>

        {/* Realistic Water Body */}
        <div
          className={`w-full relative transition-all duration-[1200ms] ease-in-out bg-gradient-to-b ${
            isCritical
              ? "from-rose-500/40 to-rose-900/90"
              : isWarning
              ? "from-amber-500/40 to-amber-900/90"
              : "from-cyan-400/40 to-cyan-900/90"
          } backdrop-blur-[2px] border-t border-white/20`}
          style={{ height: `${waterHeightPercent}%` }}
        >
          {/* Top surface highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Multiple overlapping animated waves for depth */}
          <div className="absolute top-0 left-0 w-[200%] h-12 -mt-6 opacity-60 overflow-hidden mix-blend-screen pointer-events-none">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`animate-[wave_5s_linear_infinite] w-full h-full ${isCritical ? "fill-rose-300" : isWarning ? "fill-amber-300" : "fill-cyan-200"}`}>
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
            </svg>
          </div>
          <div className="absolute top-0 left-0 w-[200%] h-16 -mt-8 opacity-40 overflow-hidden mix-blend-screen pointer-events-none" style={{ animationDirection: 'reverse' }}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`animate-[wave_7s_linear_infinite] w-full h-full ${isCritical ? "fill-rose-100" : isWarning ? "fill-amber-100" : "fill-cyan-100"}`}>
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
            </svg>
          </div>

          {/* Dynamic rising bubbles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={`bubble-${i}`}
                className="absolute bg-white/20 rounded-full border border-white/10"
                style={{
                  left: `${(i * 13) % 100}%`,
                  bottom: `-20px`,
                  width: `${4 + (i % 6)}px`,
                  height: `${4 + (i % 6)}px`,
                  animation: `float ${2.5 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${(i % 5) * 0.7}s`,
                }}
              />
            ))}
          </div>

          {/* Underwater Probe Marker */}
          <div className="absolute bottom-4 left-4 bg-[#1a1c23]/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 text-[10px] text-zinc-200 flex items-center space-x-2 shadow-xl">
            <Droplets className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span>Probe: <strong className="text-white">{sensors.waterValue}</strong></span>
          </div>
        </div>

        {/* Interactive Controls overlaying the tank */}
        <div className="absolute bottom-4 right-4 z-30 flex items-center space-x-2">
          <button
            onClick={drainTank}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xl border border-white/10 shadow-2xl transition-all active:scale-90 cursor-pointer"
            title="Simulate Drain"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={fillTank}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-400 text-black shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all active:scale-90 cursor-pointer"
            title="Simulate Flood"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={resetTank}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-zinc-300 backdrop-blur-xl border border-white/10 shadow-2xl transition-all active:scale-90 cursor-pointer"
            title="Reset Simulation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
