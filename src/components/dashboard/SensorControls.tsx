"use client";

import { useSimulationStore } from "@/store/simulationStore";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sliders, Sun, CloudRain, AlertTriangle, AlertOctagon, Sparkles } from "lucide-react";

export function SensorControls() {
  const { sensors, setSensor, autoDemoMode, config, setState } = useSimulationStore();

  const isRaining = sensors.rainAo <= config.rainAoThresh;

  const applyPreset = (type: "DRY" | "RAIN" | "SURGE" | "EMERGENCY") => {
    switch (type) {
      case "DRY":
        setSensor("rainAo", 1000);
        setSensor("waterValue", 150);
        setSensor("distance", 150);
        setState("IDLE");
        break;
      case "RAIN":
        setSensor("rainAo", 300);
        setSensor("waterValue", 350);
        setSensor("distance", 100);
        setState("MONITORING");
        break;
      case "SURGE":
        setSensor("rainAo", 150);
        setSensor("waterValue", 650);
        setSensor("distance", 50);
        setState("WARNING");
        break;
      case "EMERGENCY":
        setSensor("rainAo", 50);
        setSensor("waterValue", 950);
        setSensor("distance", 15);
        setState("SOS");
        break;
    }
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-zinc-800 text-white border border-zinc-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Sensor Telemetry Controls</h2>
            <p className="text-xs text-zinc-400">Simulation overrides and manual controls</p>
          </div>
        </div>

        {autoDemoMode && (
          <span className="text-xs bg-zinc-800 text-white font-medium px-3 py-1 rounded-full border border-zinc-600 animate-pulse">
            Auto Demo Active
          </span>
        )}
      </div>

      {/* Quick Scenario Presets */}
      <div className="space-y-2.5">
        <Label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span>Quick Weather Scenarios</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => applyPreset("DRY")}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-600/60 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Clear Weather</span>
          </button>
          <button
            onClick={() => applyPreset("RAIN")}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-600/60 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <CloudRain className="w-4 h-4 text-slate-400" />
            <span>Light Rain</span>
          </button>
          <button
            onClick={() => applyPreset("SURGE")}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Water Surge</span>
          </button>
          <button
            onClick={() => applyPreset("EMERGENCY")}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Critical Emergency</span>
          </button>
        </div>
      </div>

      {/* Manual Sliders */}
      <div className={`space-y-5 ${autoDemoMode ? "opacity-40 pointer-events-none transition-opacity" : ""}`}>
        
        {/* Rain Sensor */}
        <div className="space-y-3 bg-zinc-950/80 p-4.5 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center">
            <Label className="text-zinc-200 text-xs font-bold">Rainfall Sensor</Label>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isRaining
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800"
              }`}
            >
              {isRaining ? "Raining" : "Dry"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-zinc-400 font-mono w-12">Wet</span>
            <Slider
              value={[sensors.rainAo]}
              min={0}
              max={1023}
              step={1}
              onValueChange={(v) => setSensor("rainAo", (v as number[])[0])}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs text-zinc-400 font-mono w-12 text-right">Dry</span>
          </div>
        </div>

        {/* Ultrasonic Water Surface Distance */}
        <div className="space-y-3 bg-zinc-950/80 p-4.5 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center">
            <Label className="text-zinc-200 text-xs font-bold">Surface Distance Sensor</Label>
            <span className="text-xs bg-zinc-800 text-white font-mono font-bold px-2.5 py-0.5 rounded-full border border-zinc-600">
              {sensors.distance} cm
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-zinc-400 font-mono w-12">0 cm</span>
            <Slider
              value={[sensors.distance]}
              min={0}
              max={255}
              step={1}
              onValueChange={(v) => setSensor("distance", (v as number[])[0])}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs text-zinc-400 font-mono w-12 text-right">255 cm</span>
          </div>
        </div>

        {/* Water Level Probe */}
        <div className="space-y-3 bg-zinc-950/80 p-4.5 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center">
            <Label className="text-zinc-200 text-xs font-bold">Reservoir Water Probe</Label>
            <span className="text-xs bg-zinc-800 text-white font-mono font-bold px-2.5 py-0.5 rounded-full border border-zinc-600">
              {sensors.waterValue} / 1023
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-zinc-400 font-mono w-12">Empty</span>
            <Slider
              value={[sensors.waterValue]}
              min={0}
              max={1023}
              step={1}
              onValueChange={(v) => setSensor("waterValue", (v as number[])[0])}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs text-zinc-400 font-mono w-12 text-right">Full</span>
          </div>
        </div>

      </div>
    </div>
  );
}
