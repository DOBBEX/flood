"use client";

import { useEffect, useState } from "react";
import { Gauge } from "lucide-react";

export function DistanceGauge({ distanceCm }: { distanceCm: number }) {
  const [pulse, setPulse] = useState(false);
  
  // Calculate a "danger" level based on distance (closer = more dangerous)
  // Distance max is ~200cm, critical is ~15cm.
  const dangerRatio = Math.max(0, Math.min(1, (200 - distanceCm) / 185));
  
  // Faster pulse when closer
  const pulseDuration = 2 - dangerRatio * 1.5; // 2s down to 0.5s

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }, pulseDuration * 1000);
    return () => clearInterval(interval);
  }, [pulseDuration]);

  // Determine color based on distance
  let ringColor = "border-zinc-500/30";
  let textColor = "text-white";
  if (distanceCm <= 15) {
    ringColor = "border-rose-500/50";
    textColor = "text-rose-400";
  } else if (distanceCm <= 30) {
    ringColor = "border-amber-500/50";
    textColor = "text-amber-400";
  } else if (distanceCm <= 100) {
    ringColor = "border-sky-500/30";
    textColor = "text-sky-400";
  }

  return (
    <div className="app-card !p-3 sm:!p-4 flex flex-col items-center justify-between border-t-4 border-t-zinc-500 overflow-hidden relative">
      <div className="w-full flex items-center justify-between z-10 mb-4">
        <span className="text-[10px] sm:text-xs font-semibold text-zinc-400">Distance</span>
        <Gauge className="w-4 h-4 text-zinc-500" />
      </div>
      
      {/* Animated Sonar Radar */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-2">
        {/* Static center dot */}
        <div className="absolute w-2 h-2 rounded-full bg-white z-20 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        
        {/* Inner ring */}
        <div className={`absolute w-8 h-8 rounded-full border-2 ${ringColor} opacity-50`} />
        
        {/* Middle ring */}
        <div className={`absolute w-16 h-16 rounded-full border-2 border-dashed ${ringColor} opacity-30 animate-[spin_10s_linear_infinite]`} />
        
        {/* Outer ring */}
        <div className={`absolute w-full h-full rounded-full border ${ringColor} opacity-20`} />
        
        {/* Ping Animation */}
        <div 
          className={`absolute inset-0 rounded-full bg-zinc-500/10 border ${ringColor} transition-transform duration-1000 ease-out`}
          style={{
            transform: pulse ? 'scale(1)' : 'scale(0.1)',
            opacity: pulse ? 0 : 0.8,
            transition: pulse ? 'none' : `all ${pulseDuration}s ease-out`
          }}
        />
        
        {/* The Value in the center overlay */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center translate-y-12 bg-gradient-to-t from-black/80 to-transparent pb-1">
          <div className="flex items-baseline space-x-1 mt-6">
            <span className={`text-xl font-bold tracking-tight ${textColor}`}>{Math.round(distanceCm)}</span>
            <span className="text-[10px] text-zinc-500 font-semibold">cm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
