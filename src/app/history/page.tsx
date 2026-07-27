"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, BarChart3 } from "lucide-react";
import { CyberBackgroundCanvas } from "@/components/dashboard/CyberBackgroundCanvas";

interface RawReading {
  id: string;
  distance: number;
  waterValue: number;
  isRaining: boolean;
  state: string;
  createdAt: string | Date;
}

interface ChartReading extends RawReading {
  time: string;
  rainStatus: number;
}

export default function HistoryPage() {
  const [readings, setReadings] = useState<ChartReading[]>([]);

  useEffect(() => {
    fetch("/api/readings")
      .then((res) => res.json())
      .then((data: RawReading[]) => {
        setReadings(
          data.reverse().map((r) => ({
            ...r,
            time: new Date(r.createdAt).toLocaleTimeString(),
            rainStatus: r.isRaining ? 1 : 0,
          }))
        );
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4 md:px-8 max-w-[1700px] mx-auto space-y-8 select-none">
      
      {/* Background Ambient Glow */}
      <CyberBackgroundCanvas state="IDLE" />

      {/* Standardized Header Bar - Same Position as All Pages */}
      <header className="relative z-20 glass-panel p-5 md:p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-zinc-800 text-white border border-zinc-700 shadow-md">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Telemetry Historical Analytics
            </h1>
            <p className="text-xs text-zinc-400 font-medium">Real-time trend analysis for surface distance, water depth, and rain events</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-950/80 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-300">
          <BarChart3 className="w-4 h-4 text-zinc-400" />
          <span>{readings.length} Historical Samples</span>
        </div>
      </header>

      {/* Main Chart Content */}
      <main className="relative z-20 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
        <div className="glass-panel p-6 md:p-8 rounded-3xl min-h-[460px] shadow-2xl">
          <ResponsiveContainer width="100%" height={430}>
            <LineChart data={readings} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#e4e4e7" tick={{ fill: "#e4e4e7", fontSize: 11 }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                }}
                itemStyle={{ color: "#fff", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ paddingTop: "15px", fontSize: "12px" }} />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="distance"
                name="Surface Distance (cm)"
                stroke="#a1a1aa"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: "#a1a1aa" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="waterValue"
                name="Water Probe Depth"
                stroke="#e4e4e7"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: "#e4e4e7" }}
              />
              <Line
                yAxisId="left"
                type="stepAfter"
                dataKey="rainStatus"
                name="Rain Active"
                stroke="#71717a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>

    </div>
  );
}
