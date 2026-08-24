"use client";

import { Droplets } from "lucide-react";

export function WaterLevelGauge({ waterValue }: { waterValue: number }) {
  // Convert 0-1023 to percentage
  const percentage = Math.min(100, Math.max(0, (waterValue / 1023) * 100));
  
  // Color based on level
  let liquidColor = "fill-cyan-400";
  let ringColor = "border-cyan-500";
  if (waterValue >= 700) {
    liquidColor = "fill-rose-400";
    ringColor = "border-rose-500";
  } else if (waterValue >= 400) {
    liquidColor = "fill-amber-400";
    ringColor = "border-amber-500";
  }

  return (
    <div className={`app-card !p-3 sm:!p-4 flex flex-col items-center justify-between border-t-4 ${ringColor} overflow-hidden`}>
      <div className="w-full flex items-center justify-between z-10 mb-4">
        <span className="text-[10px] sm:text-xs font-semibold text-zinc-400">Water Level</span>
        <Droplets className="w-4 h-4 text-cyan-400" />
      </div>
      
      {/* Circular Fluid Gauge */}
      <div className="relative w-24 h-24 rounded-full border-4 border-[#1a1c23] shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] overflow-hidden bg-black/50 mb-2">
        {/* The liquid background */}
        <div 
          className="absolute inset-0 transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateY(${100 - percentage}%)` }}
        >
          {/* Wave SVG */}
          <div className="absolute top-0 left-0 w-[200%] h-8 -translate-y-full opacity-80 mix-blend-screen">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className={`animate-[wave_3s_linear_infinite] w-full h-full ${liquidColor}`}
            >
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
            </svg>
          </div>
          
          <div className={`absolute inset-0 top-0 bg-gradient-to-t from-black/20 ${liquidColor} opacity-80`} />
          
          {/* Bubbles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={`bubble-${i}`}
                className="absolute bg-white/20 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: `-10px`,
                  width: `${3 + (i % 3)}px`,
                  height: `${3 + (i % 3)}px`,
                  animation: `float ${1.5 + i % 2}s infinite ease-in ${i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Overlay Value */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none drop-shadow-md">
          <span className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {waterValue}
          </span>
        </div>
      </div>
    </div>
  );
}
