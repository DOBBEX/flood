"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save, CheckCircle2, CircuitBoard, Radio, Droplet, Cpu } from "lucide-react";

interface ConfigData {
  distWarningCm?: number;
  distCriticalCm?: number;
  distHysteresisCm?: number;
  waterCritThresh?: number;
  waterHysteresis?: number;
  rainAoThresh?: number;
  smsCooldownMs?: number;
  probeDebounceMs?: number;
  rainResumeMs?: number;
  recipientPhone?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ConfigData>({});
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"config" | "architecture">("config");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: ConfigData) => {
        setFormData(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "recipientPhone" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Configuration saved successfully.");
      } else {
        setMessage("Failed to update configuration.");
      }
    } catch {
      setMessage("Error updating configuration.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4 md:px-8 max-w-[1700px] mx-auto space-y-8 select-none">
      
      {/* Standardized Header Bar - Same Position as All Pages */}
      <header className="relative z-20 glass-panel p-5 md:p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-zinc-800 text-white border border-zinc-700 shadow-md">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              System Settings & Architecture
            </h1>
            <p className="text-xs text-zinc-400 font-medium">Global simulation thresholds, SMS emergency dispatches, and hardware specs</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-zinc-950/80 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "config"
                ? "bg-zinc-800 text-white border border-zinc-600/60 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Threshold Settings
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "architecture"
                ? "bg-zinc-800 text-white border border-zinc-600/60 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Hardware Specs
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        
        {loading ? (
          <div className="text-zinc-400 text-center py-20 animate-pulse font-semibold text-sm">
            Loading system configuration parameters...
          </div>
        ) : activeTab === "config" ? (
          
          /* Configuration Settings Form */
          <div className="glass-panel p-8 md:p-10 space-y-6">
            {message && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-center font-semibold text-sm flex items-center justify-center space-x-2 animate-fade-in-up">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <Label htmlFor="distWarningCm" className="text-zinc-300 font-bold text-xs uppercase tracking-wider">
                    Distance Warning Limit (cm)
                  </Label>
                  <Input
                    id="distWarningCm"
                    name="distWarningCm"
                    type="number"
                    value={formData.distWarningCm || ""}
                    onChange={handleChange}
                    className="bg-zinc-950/80 border-white/10 text-white focus:border-zinc-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distCriticalCm" className="text-zinc-300 font-bold text-xs uppercase tracking-wider">
                    Distance Critical Limit (cm)
                  </Label>
                  <Input
                    id="distCriticalCm"
                    name="distCriticalCm"
                    type="number"
                    value={formData.distCriticalCm || ""}
                    onChange={handleChange}
                    className="bg-zinc-950/80 border-white/10 text-white focus:border-zinc-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waterCritThresh" className="text-zinc-300 font-bold text-xs uppercase tracking-wider">
                    Water Probe Critical Value (0-1023)
                  </Label>
                  <Input
                    id="waterCritThresh"
                    name="waterCritThresh"
                    type="number"
                    value={formData.waterCritThresh || ""}
                    onChange={handleChange}
                    className="bg-zinc-950/80 border-white/10 text-white focus:border-zinc-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rainAoThresh" className="text-zinc-300 font-bold text-xs uppercase tracking-wider">
                    Rainfall Sensor Sensitivity Threshold
                  </Label>
                  <Input
                    id="rainAoThresh"
                    name="rainAoThresh"
                    type="number"
                    value={formData.rainAoThresh || ""}
                    onChange={handleChange}
                    className="bg-zinc-950/80 border-white/10 text-white focus:border-zinc-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="recipientPhone" className="text-zinc-300 font-bold text-xs uppercase tracking-wider">
                    Emergency SMS Alert Recipient Contact
                  </Label>
                  <Input
                    id="recipientPhone"
                    name="recipientPhone"
                    type="text"
                    value={formData.recipientPhone || ""}
                    onChange={handleChange}
                    className="bg-zinc-950/80 border-white/10 text-white focus:border-zinc-500 rounded-xl font-mono text-sm"
                  />
                </div>

              </div>

              <Button
                type="submit"
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600/60 shadow-lg transition-all py-6 text-sm font-bold uppercase tracking-wider mt-6 rounded-xl cursor-pointer flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save System Parameters</span>
              </Button>
            </form>
          </div>

        ) : (
          
          /* System Architecture & Hardware Specs */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="glass-panel p-8 space-y-4 hover:scale-[1.01] transition-transform">
              <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
                <div className="p-3 bg-zinc-800 text-white rounded-2xl border border-zinc-700">
                  <CircuitBoard className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Arduino Microcontroller Core</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed text-xs md:text-sm">
                Processes real-time telemetry across 4 operational states (Normal Idle, Active Monitoring, Flood Warning, and Critical SOS Emergency).
              </p>
            </div>

            <div className="glass-panel p-8 space-y-4 hover:scale-[1.01] transition-transform">
              <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
                <div className="p-3 bg-zinc-800 text-white rounded-2xl border border-zinc-700">
                  <Radio className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Ultrasonic Distance Sensor</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed text-xs md:text-sm">
                Mounted above the reservoir surface to measure real-time water distance via high-frequency sonar pulses.
              </p>
            </div>

            <div className="glass-panel p-8 space-y-4 hover:scale-[1.01] transition-transform">
              <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
                <div className="p-3 bg-zinc-800 text-white rounded-2xl border border-zinc-700">
                  <Droplet className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Rain Sensor Matrix</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed text-xs md:text-sm">
                Detects active precipitation to gatekeeper polling rates and accelerate telemetry frequency during storm events.
              </p>
            </div>

            <div className="glass-panel p-8 space-y-4 hover:scale-[1.01] transition-transform">
              <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
                <div className="p-3 bg-zinc-800 text-white rounded-2xl border border-zinc-700">
                  <Cpu className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Dual Verification Logic</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed text-xs md:text-sm">
                Requires simultaneous verification from ultrasonic distance and depth probe sensors before triggering emergency dispatches.
              </p>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
