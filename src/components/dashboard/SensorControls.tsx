"use client";

import { useSimulationStore } from "@/store/simulationStore";
import { Slider } from "@/components/ui/slider";
import { Sun, CloudRain, AlertTriangle, AlertOctagon, Droplets, Gauge } from "lucide-react";
import { motion } from "framer-motion";

export function SensorControls() {
  const { sensors, setSensor, autoDemoMode, config, setState } = useSimulationStore();

  const isRaining = sensors.rainAo <= config.rainAoThresh || sensors.rainDo === true;

  const applyPreset = (type: "DRY" | "RAIN" | "SURGE" | "EMERGENCY") => {
    switch (type) {
      case "DRY":
        setSensor("rainAo", 1023);
        setSensor("rainDo", false);
        setSensor("waterValue", 50);
        setSensor("distance", 120);
        setState("IDLE");
        break;
      case "RAIN":
        setSensor("rainAo", 350);
        setSensor("rainDo", true);
        setSensor("waterValue", 180);
        setSensor("distance", 80);
        setState("MONITORING");
        break;
      case "SURGE":
        setSensor("rainAo", 200);
        setSensor("rainDo", true);
        setSensor("waterValue", 180);
        setSensor("distance", 28);
        setState("WARNING");
        break;
      case "EMERGENCY":
        setSensor("rainAo", 50);
        setSensor("rainDo", true);
        setSensor("waterValue", 450);
        setSensor("distance", 12);
        setState("SOS");
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Scenario Presets */}
      <div>
        <span className="text-xs font-semibold text-zinc-400 mb-2.5 block">Quick Scenarios</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyPreset("DRY")}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 transition-colors cursor-pointer shadow"
          >
            <Sun className="w-5 h-5 mb-1" />
            <span className="text-xs font-bold">Dry Day</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">All clear</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyPreset("RAIN")}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 text-sky-400 transition-colors cursor-pointer shadow"
          >
            <CloudRain className="w-5 h-5 mb-1" />
            <span className="text-xs font-bold">Rain Storm</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">Sensors active</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyPreset("SURGE")}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 transition-colors cursor-pointer shadow"
          >
            <AlertTriangle className="w-5 h-5 mb-1" />
            <span className="text-xs font-bold">Water Surge</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">Level rising</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyPreset("EMERGENCY")}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 transition-colors cursor-pointer shadow"
          >
            <AlertOctagon className="w-5 h-5 mb-1" />
            <span className="text-xs font-bold">Emergency</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">SOS triggered</span>
          </motion.button>
        </div>
      </div>

      {/* Sensor Sliders */}
      <div className={`space-y-3 pt-2 ${autoDemoMode ? "opacity-40 pointer-events-none" : ""}`}>
        <span className="text-xs font-semibold text-zinc-400">Sensor Adjustment</span>

        {/* Rain Sensor */}
        <motion.div whileHover={{ scale: 1.01 }} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2.5 shadow">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <CloudRain className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">Rain Sensor</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-zinc-300 font-semibold">{sensors.rainAo}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                isRaining ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-zinc-500"
              }`}>
                {isRaining ? "Wet" : "Dry"}
              </span>
            </div>
          </div>
          <Slider
            value={[sensors.rainAo]}
            min={0}
            max={1023}
            step={1}
            onValueChange={(v) => setSensor("rainAo", (v as number[])[0])}
            className="cursor-pointer"
          />
        </motion.div>

        {/* Distance */}
        <motion.div whileHover={{ scale: 1.01 }} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2.5 shadow">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold text-white">Distance (Ultrasonic)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-zinc-300 font-semibold">{Math.round(sensors.distance)} cm</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                sensors.distance <= config.distCriticalCm
                  ? "bg-rose-500/20 text-rose-300"
                  : sensors.distance <= config.distWarningCm
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-emerald-500/20 text-emerald-300"
              }`}>
                {sensors.distance <= 15 ? "Critical" : sensors.distance <= 30 ? "Warning" : "Safe"}
              </span>
            </div>
          </div>
          <Slider
            value={[sensors.distance]}
            min={0}
            max={200}
            step={1}
            onValueChange={(v) => setSensor("distance", (v as number[])[0])}
            className="cursor-pointer"
          />
        </motion.div>

        {/* Water Probe */}
        <motion.div whileHover={{ scale: 1.01 }} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2.5 shadow">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">Water Probe</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-zinc-300 font-semibold">{sensors.waterValue}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                sensors.waterValue >= config.waterCritThresh
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-emerald-500/20 text-emerald-300"
              }`}>
                {sensors.waterValue >= 250 ? "High" : "Normal"}
              </span>
            </div>
          </div>
          <Slider
            value={[sensors.waterValue]}
            min={0}
            max={1023}
            step={1}
            onValueChange={(v) => setSensor("waterValue", (v as number[])[0])}
            className="cursor-pointer"
          />
        </motion.div>
      </div>
    </div>
  );
}
