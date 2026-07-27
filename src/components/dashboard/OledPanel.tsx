"use client";

import { Sensors, Config } from "@/lib/stateMachine";
import { CloudRain, Gauge, Droplets } from "lucide-react";

export function OledPanel({ sensors, config }: { sensors: Sensors; config: Config }) {
  const isRaining = sensors.rainAo <= config.rainAoThresh;

  return (
    <div className="grid grid-cols-3 gap-3 w-full h-full items-center">
      {/* Metric 1: Distance to Surface */}
      <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1">
        <div className="flex items-center space-x-1 text-zinc-400 text-xs font-medium">
          <Gauge className="w-3.5 h-3.5 text-zinc-300" />
          <span>Distance</span>
        </div>
        <div className="text-xl md:text-2xl font-bold text-white">
          {Math.round(sensors.distance)} <span className="text-xs text-zinc-400 font-normal">cm</span>
        </div>
      </div>

      {/* Metric 2: Water Sensor Raw Depth */}
      <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1">
        <div className="flex items-center space-x-1 text-zinc-400 text-xs font-medium">
          <Droplets className="w-3.5 h-3.5 text-zinc-300" />
          <span>Water Level</span>
        </div>
        <div className="text-xl md:text-2xl font-bold text-white">
          {sensors.waterValue} <span className="text-xs text-zinc-400 font-normal">/ 1023</span>
        </div>
      </div>

      {/* Metric 3: Rain Indicator */}
      <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1">
        <div className="flex items-center space-x-1 text-zinc-400 text-xs font-medium">
          <CloudRain className="w-3.5 h-3.5 text-zinc-300" />
          <span>Rain Status</span>
        </div>
        <div className={`text-xs md:text-sm font-bold px-2.5 py-0.5 rounded-full border ${isRaining ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
          {isRaining ? 'Active Rain' : 'No Rain'}
        </div>
      </div>
    </div>
  );
}
