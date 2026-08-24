"use client";

import { useEffect, useState } from "react";
import { SystemState, Sensors } from "@/lib/stateMachine";
import { Cpu, RefreshCw } from "lucide-react";

interface OledHardwareSimulatorProps {
  state: SystemState;
  sensors: Sensors;
  isRaining: boolean;
}

export function OledHardwareSimulator({ state, sensors, isRaining }: OledHardwareSimulatorProps) {
  const [booting, setBooting] = useState<boolean>(false);
  const [splashVisible, setSplashVisible] = useState<boolean>(false);

  const handleReboot = () => {
    setBooting(true);
    setSplashVisible(true);
    setTimeout(() => {
      setSplashVisible(false);
      setBooting(false);
    }, 2000);
  };

  const getOledHeading = () => {
    switch (state) {
      case "IDLE": return "STANDBY";
      case "MONITORING": return "MONITOR";
      case "WARNING": return "WARNING";
      case "SOS": return "SOS";
    }
  };

  const distanceText = sensors.distance > 0 ? `${Math.round(sensors.distance)}cm` : "--cm";
  const waterText = `W:${Math.round(sensors.waterValue)}`;
  const rainText = `R:${isRaining ? "Y" : "N"}`;

  return (
    <div className="app-card !p-4 flex flex-col space-y-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-white">OLED Display</span>
        </div>
        <button
          onClick={handleReboot}
          className="flex items-center space-x-1 text-[10px] font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/10 transition-all cursor-pointer active:scale-95"
          title="Simulate reboot"
        >
          <RefreshCw className={`w-3 h-3 ${booting ? "animate-spin text-sky-400" : ""}`} />
          <span>Reboot</span>
        </button>
      </div>

      {/* Screen */}
      <div className="oled-screen rounded-xl p-3 min-h-[90px] flex flex-col justify-between select-none shadow-2xl relative overflow-hidden border border-zinc-700/80">
        {splashVisible ? (
          <div className="flex flex-col items-center justify-center h-full my-auto text-center space-y-1 animate-pulse">
            <span className="oled-text-white text-sm font-black tracking-widest uppercase">
              Flood Detection v3
            </span>
            <span className="oled-text-white text-[11px] font-mono tracking-wider opacity-80">
              Initialising...
            </span>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between border-b border-cyan-950/60 pb-1">
              <span className="oled-text-white text-xl font-black uppercase tracking-wider">
                {getOledHeading()}
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80 px-1.5 py-0.5 rounded bg-cyan-950/40">
                0x3C
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs oled-text-white tracking-wide pt-0.5">
              {state === "IDLE" ? (
                <span className="oled-text-white text-[11px] italic tracking-wider animate-pulse">
                  Watching for rain...
                </span>
              ) : (
                <>
                  <span className="font-bold">{distanceText}</span>
                  <span className="font-bold">{waterText}</span>
                  <span className={`font-bold ${isRaining ? "text-cyan-300" : "text-zinc-400"}`}>{rainText}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
