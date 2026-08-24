"use client";

import { useState } from "react";
import { SystemState } from "@/lib/stateMachine";
import { MapPin, Navigation, CloudRain, Waves, Compass, Layers } from "lucide-react";

interface NodeSensor {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  value: string;
  status: "NORMAL" | "WARNING" | "CRITICAL";
}

export function InteractiveFloodMap({ state, sensors }: { state: SystemState; sensors: { distance: number; waterValue: number; rainAo: number } }) {
  const [selectedNode, setSelectedNode] = useState<string>("node-1");
  const [showRadarLayer, setShowRadarLayer] = useState<boolean>(true);

  const isRaining = sensors.rainAo <= 800;

  const nodes: NodeSensor[] = [
    {
      id: "node-1",
      name: "Main Spillway Gate",
      type: "Spillway",
      lat: 6.9271,
      lng: 79.8612,
      value: `${Math.round((sensors.waterValue / 1023) * 100)}% capacity`,
      status: state === "SOS" ? "CRITICAL" : state === "WARNING" ? "WARNING" : "NORMAL",
    },
    {
      id: "node-2",
      name: "Ultrasonic Sensor",
      type: "Distance",
      lat: 6.9315,
      lng: 79.8655,
      value: `${Math.round(sensors.distance)} cm`,
      status: sensors.distance <= 15 ? "CRITICAL" : sensors.distance <= 30 ? "WARNING" : "NORMAL",
    },
    {
      id: "node-3",
      name: "Water Probe",
      type: "Level",
      lat: 6.9240,
      lng: 79.8580,
      value: `${sensors.waterValue} / 1023`,
      status: sensors.waterValue >= 250 ? "CRITICAL" : "NORMAL",
    },
    {
      id: "node-4",
      name: "Rain Station",
      type: "Weather",
      lat: 6.9350,
      lng: 79.8700,
      value: isRaining ? "Rain detected" : "Clear",
      status: isRaining ? "WARNING" : "NORMAL",
    },
  ];

  const currentNode = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="app-card !p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-white">Sensor Map</span>
        </div>

        <button
          onClick={() => setShowRadarLayer(!showRadarLayer)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
            showRadarLayer
              ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
              : "bg-white/5 text-zinc-400 border-white/10"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showRadarLayer ? "Radar On" : "Radar Off"}</span>
        </button>
      </div>

      {/* Map */}
      <div className="relative w-full h-[260px] sm:h-[300px] bg-[#07070b] rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

        {/* River contour */}
        <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-80">
          <path
            d="M -50 200 Q 200 120 400 220 T 850 180"
            fill="none"
            stroke="#0284c7"
            strokeWidth="48"
            strokeLinecap="round"
            className="opacity-20"
          />
          <path
            d="M -50 200 Q 200 120 400 220 T 850 180"
            fill="none"
            stroke={state === "SOS" ? "#ef4444" : state === "WARNING" ? "#f59e0b" : "#38bdf8"}
            strokeWidth="32"
            strokeLinecap="round"
            className="transition-colors duration-700"
          />
          <ellipse
            cx="400"
            cy="220"
            rx="110"
            ry="75"
            fill={state === "SOS" ? "rgba(239,68,68,0.25)" : state === "WARNING" ? "rgba(245,158,11,0.25)" : "rgba(56,189,248,0.25)"}
            stroke={state === "SOS" ? "#ef4444" : state === "WARNING" ? "#f59e0b" : "#38bdf8"}
            strokeWidth="3"
            className="transition-colors duration-700"
          />
        </svg>

        {/* Radar sweep */}
        {showRadarLayer && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-sky-500/20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-sky-500/20"></div>
            {isRaining && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-r-2 border-sky-400/40 animate-radar-sweep pointer-events-none"></div>
            )}
          </div>
        )}

        {/* Location tag */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center space-x-1.5 text-[10px] text-zinc-300">
          <Navigation className="w-3 h-3 text-sky-400" />
          <span>06°55&apos;N 79°51&apos;E</span>
        </div>

        {/* Node markers */}
        <div className="absolute inset-0 pointer-events-auto">
          <button
            onClick={() => setSelectedNode("node-1")}
            className="absolute top-[52%] left-[48%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className={`absolute w-8 h-8 rounded-full animate-ping opacity-50 ${state === "SOS" ? "bg-rose-500" : state === "WARNING" ? "bg-amber-500" : "bg-sky-500"}`}></span>
              <div className={`p-2.5 rounded-full border-2 shadow-2xl transition-transform group-hover:scale-125 ${selectedNode === "node-1" ? "scale-110 ring-4 ring-white/20" : ""} ${state === "SOS" ? "bg-rose-500 border-rose-400 text-white" : state === "WARNING" ? "bg-amber-500 border-amber-400 text-white" : "bg-sky-500 border-sky-400 text-slate-950"}`}>
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedNode("node-2")}
            className="absolute top-[32%] left-[62%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <div className={`p-2 rounded-full border shadow-xl transition-transform group-hover:scale-125 ${selectedNode === "node-2" ? "scale-110 ring-4 ring-white/20 bg-sky-500 border-sky-400 text-slate-950" : "bg-zinc-800 border-zinc-700 text-zinc-300"}`}>
                <Waves className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedNode("node-3")}
            className="absolute top-[68%] left-[36%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <div className={`p-2 rounded-full border shadow-xl transition-transform group-hover:scale-125 ${selectedNode === "node-3" ? "scale-110 ring-4 ring-white/20 bg-cyan-500 border-cyan-400 text-slate-950" : "bg-zinc-800 border-zinc-700 text-zinc-300"}`}>
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedNode("node-4")}
            className="absolute top-[22%] left-[26%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <div className={`p-2 rounded-full border shadow-xl transition-transform group-hover:scale-125 ${selectedNode === "node-4" ? "scale-110 ring-4 ring-white/20 bg-indigo-500 border-indigo-400 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-300"}`}>
                <CloudRain className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>

        {/* Node info */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xl p-3 rounded-xl border border-white/10 max-w-[180px] shadow-2xl space-y-1 z-30 pointer-events-none">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-zinc-400">{currentNode.type}</span>
            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${
              currentNode.status === "CRITICAL" ? "bg-rose-500/20 text-rose-300" : currentNode.status === "WARNING" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
            }`}>
              {currentNode.status === "CRITICAL" ? "Critical" : currentNode.status === "WARNING" ? "Warning" : "Normal"}
            </span>
          </div>
          <h4 className="text-[11px] font-semibold text-white leading-tight">{currentNode.name}</h4>
          <div className="text-[10px] text-sky-300">{currentNode.value}</div>
        </div>
      </div>

      {/* Node switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedNode === node.id
                ? "bg-sky-500/10 border-sky-500/30 text-white shadow-sm"
                : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10"
            }`}
          >
            <div className="text-[11px] font-semibold text-white truncate">{node.name}</div>
            <div className="text-[9px] text-zinc-500 truncate mt-0.5">{node.type}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
