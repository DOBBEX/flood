"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Activity, Download, RefreshCw, Layers, Gauge, Droplets, CloudRain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulationStore } from "@/store/simulationStore";
import { mockHistoricalData } from "@/data/mockHistoricalData";
import { motion, Variants } from "framer-motion";

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
  const { state } = useSimulationStore();
  const [readings, setReadings] = useState<ChartReading[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReadings = () => {
    setLoading(true);
    // Simulate network delay then load the massive fake dataset
    setTimeout(() => {
      setReadings(
        mockHistoricalData.map((r) => ({
          ...r,
          time: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rainStatus: r.isRaining ? 1 : 0,
        }))
      );
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.4, ease: "easeOut" } }
  };

  const handleExportCSV = () => {
    if (!readings.length) return;
    const headers = "ID,Timestamp,Distance_cm,Water_Probe_Raw,Is_Raining,State\n";
    const rows = readings.map(r => `${r.id},${r.createdAt},${r.distance},${r.waterValue},${r.isRaining},${r.state}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `telemetry_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#0a0c10] relative overflow-hidden py-6 px-4 max-w-5xl mx-auto space-y-6 select-none pb-28"
    >
      {/* Page Header */}
      <motion.header variants={itemVariants} className="app-card shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-inner">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Sensor History</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Distance & water level readings over time
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              disabled={readings.length === 0}
              className="flex items-center space-x-1.5 text-xs font-mono font-bold bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => { setLoading(true); fetchReadings(); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Metric Pills */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap text-xs font-mono">
        <span className="flex items-center gap-1.5 text-zinc-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          Ultrasonic Distance (cm)
        </span>
        <span className="flex items-center gap-1.5 text-zinc-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          Water Depth Probe (0-1023)
        </span>
        <span className="flex items-center gap-1.5 text-zinc-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
          Rain Active (0/1)
        </span>
      </motion.div>

      {/* Chart Card */}
      <motion.main variants={itemVariants} className="app-card !p-5 shadow-2xl">
        {loading ? (
          <Skeleton className="h-[360px] w-full rounded-2xl bg-white/5" />
        ) : readings.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
            <span>No historical telemetry records logged yet.</span>
          </div>
        ) : (
          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readings} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }} />
                <ReferenceLine yAxisId="left" y={30} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn 30cm', fill: '#f59e0b', fontSize: 9 }} />
                <ReferenceLine yAxisId="left" y={15} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SOS 15cm', fill: '#ef4444', fontSize: 9 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,16,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace', color: 'white' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="distance" name="Distance (cm)" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="waterValue" name="Probe Level" stroke="#22d3ee" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line yAxisId="left" type="stepAfter" dataKey="rainStatus" name="Rain" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.main>
    </motion.div>
  );
}
