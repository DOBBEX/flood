"use client";

import { SystemState } from "@/lib/stateMachine";

export function CyberBackgroundCanvas({ state }: { state: SystemState }) {
  // If we're IDLE (dry), we want a warm, dry vibe.
  // If we're in WARNING/MONITORING/SOS (wet), we want a fluid, deep water vibe.
  
  const isWet = state !== "IDLE";

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-all duration-1000 ease-in-out">
      {/* Base Background */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 ${
          isWet ? "bg-[#080d14]" : "bg-[#0f1115]"
        }`} 
      />

      {/* Dry Vibe Ambient Glows */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          !isWet ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] mix-blend-screen translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] mix-blend-screen -translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Water Vibe Ambient Glows & Waves */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isWet ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[120px] mix-blend-screen translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen -translate-x-1/3 translate-y-1/3" />
        
        {/* Soft fluid waves at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-30 mix-blend-screen">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-[200%] h-full fill-sky-500/20 animate-wave"
          >
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
          </svg>
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-[200%] h-[80%] fill-cyan-500/20 animate-wave"
            style={{ animationDirection: "reverse", animationDuration: "12s" }}
          >
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
          </svg>
        </div>
      </div>
      
      {/* Subtle Noise Texture overlay to make it look premium and matte */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
