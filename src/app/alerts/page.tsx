"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BellRing, ShieldCheck, RefreshCw } from "lucide-react";
import { CyberBackgroundCanvas } from "@/components/dashboard/CyberBackgroundCanvas";

interface AlertRecord {
  id: string;
  state: string;
  message: string;
  recipient: string;
  status: string;
  createdAt: string | Date;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  const fetchAlerts = () => {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data: AlertRecord[]) => setAlerts(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4 md:px-8 max-w-[1700px] mx-auto space-y-8 select-none">
      
      {/* Background Ambient Glow */}
      <CyberBackgroundCanvas state="IDLE" />

      {/* Standardized Header Bar - Same Position as All Pages */}
      <header className="relative z-20 glass-panel p-5 md:p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-zinc-800 text-white border border-zinc-700 shadow-md">
            <BellRing className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Emergency Alerts & Dispatch Log
            </h1>
            <p className="text-xs text-zinc-400 font-medium">Real-time log of automated SMS dispatches and facility notifications</p>
          </div>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-xl border border-zinc-600/60 text-xs font-semibold transition-all cursor-pointer shadow-md active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-zinc-300" />
          <span>Refresh Live Log</span>
        </button>
      </header>

      {/* Main Table Content */}
      <main className="relative z-20 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
        <div className="glass-panel p-6 md:p-8 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <Table>
              <TableHeader className="bg-zinc-950/90">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-zinc-300 font-bold uppercase text-xs">Timestamp</TableHead>
                  <TableHead className="text-zinc-300 font-bold uppercase text-xs">State Level</TableHead>
                  <TableHead className="text-zinc-300 font-bold uppercase text-xs">Dispatch Message</TableHead>
                  <TableHead className="text-zinc-300 font-bold uppercase text-xs">Recipient</TableHead>
                  <TableHead className="text-zinc-300 font-bold uppercase text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-400 py-16 font-medium">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <ShieldCheck className="w-10 h-10 text-emerald-400 opacity-70" />
                        <span>No emergency alerts triggered. System operating normally.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {alerts.map((alert) => (
                  <TableRow key={alert.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-zinc-200 font-mono text-xs font-semibold">
                      {new Date(alert.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          alert.state === "SOS"
                            ? "bg-red-500/20 text-red-300 border-red-500/40"
                            : alert.state === "WARNING"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }
                      >
                        {alert.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-200 text-xs font-medium">{alert.message}</TableCell>
                    <TableCell className="text-zinc-400 text-xs font-mono">{alert.recipient}</TableCell>
                    <TableCell>
                      <span className="text-xs text-emerald-300 border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 rounded-full font-semibold">
                        {alert.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

    </div>
  );
}
