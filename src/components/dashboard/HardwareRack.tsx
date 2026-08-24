"use client";

import { useEffect, useState } from "react";
import { SystemState } from "@/lib/stateMachine";
import { useSimulationStore } from "@/store/simulationStore";
import { Volume2, VolumeX, Radio, Cpu, Activity } from "lucide-react";

interface HardwareRackProps {
  state: SystemState;
}

export function HardwareRack({ state }: HardwareRackProps) {
  const { audioMuted, setAudioMuted, gsmTransmitting, gsmSignalStrength } = useSimulationStore();
  const [blinkPhase, setBlinkPhase] = useState<boolean>(true);

  useEffect(() => {
    const intervalMs = state === "SOS" ? 200 : 400;
    const timer = setInterval(() => {
      setBlinkPhase((prev) => !prev);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [state]);

  const isGreenOn = state === "IDLE" ? true : state === "MONITORING" ? blinkPhase : false;
  const isYellowOn = state === "WARNING";
  const isRedOn = state === "SOS" ? blinkPhase : false;
  const isBuzzerActive = state === "SOS" && !gsmTransmitting;

  return (
    <div className="app-card !p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-white">Hardware Status</span>
        </div>

        <button
          onClick={() => setAudioMuted(!audioMuted)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
            !audioMuted
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
          }`}
        >
          {!audioMuted ? <Volume2 className="w-3.5 h-3.5 animate-pulse text-rose-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
          <span>{audioMuted ? "Muted" : "Sound On"}</span>
        </button>
      </div>

      {/* LED Indicators */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 shadow-inner">
        <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
          <div className={`led-lamp mb-1.5 ${isGreenOn ? "led-green-on" : "led-off"}`}></div>
          <span className="text-[11px] font-semibold text-emerald-400">Green</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">
            {state === "IDLE" ? "On" : state === "MONITORING" ? "Blinking" : "Off"}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
          <div className={`led-lamp mb-1.5 ${isYellowOn ? "led-yellow-on" : "led-off"}`}></div>
          <span className="text-[11px] font-semibold text-amber-400">Yellow</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">
            {state === "WARNING" ? "On" : "Off"}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
          <div className={`led-lamp mb-1.5 ${isRedOn ? "led-red-on" : "led-off"}`}></div>
          <span className="text-[11px] font-semibold text-rose-400">Red</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">
            {state === "SOS" ? "Flashing" : "Off"}
          </span>
        </div>
      </div>

      {/* Buzzer & GSM */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
          isBuzzerActive
            ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
            : "bg-white/5 border-white/5 text-zinc-400"
        }`}>
          <div className="flex items-center space-x-2">
            <Activity className={`w-3.5 h-3.5 ${isBuzzerActive ? "text-rose-400 animate-spin" : "text-zinc-600"}`} />
            <span className="text-[11px] font-semibold">Buzzer</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/40">
            {isBuzzerActive ? "Active" : "Silent"}
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
          gsmTransmitting
            ? "bg-sky-500/15 border-sky-500/30 text-sky-300 animate-pulse"
            : "bg-white/5 border-white/5 text-zinc-400"
        }`}>
          <div className="flex items-center space-x-2">
            <Radio className={`w-3.5 h-3.5 ${gsmTransmitting ? "text-sky-400" : "text-zinc-500"}`} />
            <span className="text-[11px] font-semibold">GSM</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/40">
            {gsmTransmitting ? "Sending" : `${gsmSignalStrength}%`}
          </span>
        </div>
      </div>
    </div>
  );
}
