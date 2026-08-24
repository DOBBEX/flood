"use client";

import { CloudRain, Sun } from "lucide-react";

export function RainStatusWidget({ isRaining, dryCountdown }: { isRaining: boolean, dryCountdown: number }) {
  
  return (
    <div className={`app-card !p-3 sm:!p-4 flex flex-col items-center justify-between border-t-4 ${isRaining ? "border-sky-500" : "border-amber-500"} overflow-hidden relative`}>
      <div className="w-full flex items-center justify-between z-10 mb-4">
        <span className="text-[10px] sm:text-xs font-semibold text-zinc-400">Rain Status</span>
        {isRaining ? (
          <CloudRain className="w-4 h-4 text-sky-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </div>
      
      {/* Dynamic Weather Icon */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-2">
        {isRaining ? (
          // Raining State
          <div className="relative flex flex-col items-center justify-center mt-2">
            {/* Animated Cloud */}
            <div className="relative z-20 animate-[float_4s_ease-in-out_infinite]">
              <svg width="60" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5 40C8.28273 40 0 31.7173 0 21.5C0 12.0125 7.1592 4.19528 16.3267 3.14915C19.7891 -1.41624 25.4208 -1.41624 28.8833 3.14915C33.1558 -1.2587 39.8668 -0.49089 43.1458 4.70823C51.6565 2.19321 60 8.52841 60 17.5C60 21.1494 58.749 24.5126 56.634 27.1857C58.6853 28.5146 60 30.8548 60 33.5C60 37.0899 57.0899 40 53.5 40H18.5Z" fill="url(#paint0_linear)"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="30" y1="0" x2="30" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#94A3B8"/>
                    <stop offset="1" stopColor="#475569"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Rain Drops */}
            <div className="absolute top-10 left-0 right-0 h-10 overflow-hidden flex justify-between px-2 z-10">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={`drop-${i}`}
                  className="w-1 h-3 bg-sky-400 rounded-full animate-bounce opacity-60"
                  style={{ animationDelay: `${i * 0.2}s`, animationDuration: '0.8s' }}
                />
              ))}
            </div>
          </div>
        ) : (
          // Sunny State
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
            <svg className="w-14 h-14 text-amber-500 animate-[spin_20s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path>
              <path d="M17.66 17.66l1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="M4.93 19.07l1.41-1.41"></path>
              <path d="M17.66 6.34l1.41-1.41"></path>
            </svg>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-center mt-1">
        <span className="text-xl font-bold text-white">{isRaining ? "Wet" : "Dry"}</span>
        {dryCountdown > 0 && (
          <span className="text-[10px] text-zinc-500 mt-0.5 animate-pulse">
            Clearing in {dryCountdown}s
          </span>
        )}
      </div>
    </div>
  );
}
