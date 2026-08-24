"use client";

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { RefreshCw, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export function MedianFilterVisualizer() {
  const { medianDiagnostics, refreshMedianSamples } = useSimulationStore();
  const [activeSensor, setActiveSensor] = useState<"ultrasonic" | "waterProbe">("ultrasonic");

  const diag = activeSensor === "ultrasonic" ? medianDiagnostics.ultrasonic : medianDiagnostics.waterProbe;
  const unit = activeSensor === "ultrasonic" ? "cm" : "";
  const sampleCount = activeSensor === "ultrasonic" ? 7 : 5;

  // Prepare data for recharts
  const chartData = diag.raw.map((rawVal, index) => ({
    name: `t-${diag.raw.length - index}`,
    raw: rawVal,
    median: diag.median,
  }));

  // Find min/max for chart domain to keep it dynamic but centered
  const allValues = [...diag.raw, diag.median];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.2 || 10;
  
  return (
    <div className="app-card !p-4 space-y-4 border-t-4 border-t-indigo-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-white">Live Noise Filter</span>
        </div>

        <button
          onClick={refreshMedianSamples}
          className="flex items-center space-x-1 text-[10px] font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/10 transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Resample</span>
        </button>
      </div>

      {/* Sensor tabs */}
      <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
        <button
          onClick={() => setActiveSensor("ultrasonic")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSensor === "ultrasonic"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Ultrasonic
        </button>
        <button
          onClick={() => setActiveSensor("waterProbe")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSensor === "waterProbe"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Water Probe
        </button>
      </div>

      {/* Graphical Live Chart */}
      <div className="h-48 w-full bg-[#0a0c10] rounded-xl border border-white/5 p-2 overflow-hidden shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickMargin={8} />
            <YAxis stroke="#ffffff30" fontSize={10} domain={[Math.max(0, minVal - padding), maxVal + padding]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1c23', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            {/* The stable median line */}
            <ReferenceLine y={diag.median} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
            
            {/* The noisy raw data */}
            <Line 
              type="monotone" 
              dataKey="raw" 
              stroke="#f43f5e" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} 
              activeDot={{ r: 6 }} 
              isAnimationActive={true}
              animationDuration={300}
            />
            
            {/* The smoothed median line */}
            <Line 
              type="step" 
              dataKey="median" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={false}
              isAnimationActive={true}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Result Footer */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-rose-500 rounded-full" />
          <span className="text-[10px] text-zinc-400">Raw Signal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-1 bg-emerald-500 rounded-full" />
          <span className="text-[10px] text-zinc-400">Cleaned Median</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <span className="text-xs font-bold text-emerald-400">{diag.median}</span>
          <span className="text-[10px] text-emerald-500/70">{unit}</span>
        </div>
      </div>
    </div>
  );
}
