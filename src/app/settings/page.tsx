"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save, CheckCircle2, CircuitBoard, Radio, Droplet, Cpu, RotateCcw, Zap, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULTS } from "@/lib/config";
import { useSimulationStore } from "@/store/simulationStore";
import { motion, AnimatePresence, Variants } from "framer-motion";

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
  const [formData, setFormData] = useState<ConfigData>(DEFAULTS);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"config" | "hardware" | "selfTest">("config");
  const [selfTestRunning, setSelfTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const { config, state } = useSimulationStore();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: any) => {
        if (!data.error && Object.keys(data).length > 0) {
          setFormData(data);
        } else {
          setFormData(DEFAULTS);
        }
        setLoading(false);
      })
      .catch(() => {
        setFormData(DEFAULTS);
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

  const handleResetDefaults = () => {
    setFormData(DEFAULTS);
    setMessage("Restored defaults. Click save to apply.");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      useSimulationStore.setState({ config: { ...config, ...formData } as any });
      setMessage("Configuration saved successfully");
    } catch (error) {
      setMessage("Error saving configuration");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const runHardwareSelfTest = () => {
    setSelfTestRunning(true);
    setTestResults([]);
    
    const sequence = [
      { msg: "INIT: Commencing core diagnostic...", delay: 500 },
      { msg: "SYS: Checking AT+CMGF GSM configuration... [OK]", delay: 1500 },
      { msg: "MEM: Verifying NVRAM parameter integrity... [OK]", delay: 2500 },
      { msg: "SENS: Pinging HC-SR04 interface... [ECHO RECEIVED]", delay: 3500 },
      { msg: "SENS: Analog reading from Water Level Probe... [VAL: 42]", delay: 4500 },
      { msg: "NET: Signal strength... CSQ: 21 (Good)", delay: 5500 },
      { msg: "SUCCESS: All systems nominal.", delay: 6500 },
    ];

    sequence.forEach((step) => {
      setTimeout(() => {
        setTestResults(prev => [...prev, step.msg]);
        if (step === sequence[sequence.length - 1]) setSelfTestRunning(false);
      }, step.delay);
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "tween", duration: 0.4, ease: "easeOut" } }
  };

  const floatVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen relative overflow-hidden py-6 px-4 max-w-5xl mx-auto space-y-6 pb-28 bg-[#0a0c10]"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="app-card shadow-2xl" whileHover={{ scale: 1.01 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-zinc-500/15 text-zinc-300 border border-zinc-500/20 shadow-inner">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">System Settings</h1>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                Hardware parameters & alert thresholds
              </p>
            </div>
          </div>

          <motion.div variants={itemVariants} className="flex bg-black/40 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("config")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "config" ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow" : "text-zinc-500 hover:text-white"
              }`}
            >
              Thresholds
            </button>
            <button
              onClick={() => setActiveTab("selfTest")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "selfTest" ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow" : "text-zinc-500 hover:text-white"
              }`}
            >
              Diagnostics
            </button>
            <button
              onClick={() => setActiveTab("hardware")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "hardware" ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow" : "text-zinc-500 hover:text-white"
              }`}
            >
              Hardware Map
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Content */}
      <motion.main variants={itemVariants} className="relative min-h-[400px]">
        {loading ? (
          <Skeleton className="h-[400px] w-full rounded-2xl bg-white/5" />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "config" && (
              <motion.div
                key="config"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
                className="space-y-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form fields with float hover effect */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Repeated Input Component with animation */}
                    {[
                      { label: "DIST_WARNING_CM (cm)", name: "distWarningCm", desc: "Enters WARNING state when water surface gets this close" },
                      { label: "DIST_CRITICAL_CM (cm)", name: "distCriticalCm", desc: "Ultrasonic trigger half of dualSOS rule" },
                      { label: "WATER_CRIT_THRESH (0-1023)", name: "waterCritThresh", desc: "Conductive probe reading for critical water contact" },
                      { label: "PROBE_DEBOUNCE_MS (ms)", name: "probeDebounceMs", desc: "Continuous contact duration required before SOS" },
                      { label: "RAIN_AO_THRESH (0-1023)", name: "rainAoThresh", desc: "Analogue reading <= threshold declared as active rain" },
                      { label: "RAIN_RESUME_MS (ms)", name: "rainResumeMs", desc: "Continuous dry duration before returning to IDLE" },
                      { label: "SMS_COOLDOWN_MS (ms)", name: "smsCooldownMs", desc: "Minimum cooldown between repeated alerts" },
                    ].map((field, i) => (
                      <motion.div 
                        key={field.name}
                        variants={floatVariants}
                        initial="hidden"
                        animate="animate"
                        style={{ animationDelay: `${i * 0.1}s` }}
                        whileHover={{ scale: 1.02 }}
                        className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/5 shadow hover:border-sky-500/30 transition-colors"
                      >
                        <Label className="text-white font-bold text-xs font-mono">{field.label}</Label>
                        <p className="text-[10px] text-zinc-500 font-mono">{field.desc}</p>
                        <Input
                          name={field.name}
                          type="number"
                          value={(formData as any)[field.name] ?? 0}
                          onChange={handleChange}
                          className="bg-black/50 border-white/10 text-white font-mono text-sm h-10 rounded-lg focus:border-sky-500"
                        />
                      </motion.div>
                    ))}
                    
                    <motion.div 
                      variants={floatVariants}
                      initial="hidden"
                      animate="animate"
                      style={{ animationDelay: '0.8s' }}
                      whileHover={{ scale: 1.02 }}
                      className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/5 shadow hover:border-sky-500/30 transition-colors"
                    >
                      <Label className="text-white font-bold text-xs font-mono">SOS_PHONE (Recipient)</Label>
                      <p className="text-[10px] text-zinc-500 font-mono">Target emergency dispatch telephone number</p>
                      <Input
                        name="recipientPhone"
                        type="text"
                        value={formData.recipientPhone ?? ""}
                        onChange={handleChange}
                        className="bg-black/50 border-white/10 text-white font-mono text-sm h-10 rounded-lg tracking-wider focus:border-sky-500"
                      />
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResetDefaults}
                      className="flex items-center space-x-1 text-xs font-mono text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Firmware Defaults</span>
                    </motion.button>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        <span>Save Configuration</span>
                      </Button>
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {message && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}

            {activeTab === "hardware" && (
              <motion.div 
                key="hardware"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "Microcontroller Core", sub: "Arduino Uno R3 (ATmega328P)", desc: "16 MHz Clock, 32 KB Flash, 2 KB SRAM, 5V Logic.", color: "border-l-sky-500" },
                    { title: "Ultrasonic Transducer", sub: "HC-SR04 Sonar Array", desc: "TRIG Pin 5, ECHO Pin 6, 7-sample median noise filter.", color: "border-l-emerald-500" },
                    { title: "Subsurface Water Probe", sub: "Conductive Analogue Sensor", desc: "Analogue Pin A1, 5-sample median, 500ms continuous debounce.", color: "border-l-cyan-500" },
                    { title: "GSM Cellular Engine", sub: "SIMCom SIM800L GPRS / SMS", desc: "SoftwareSerial RX:Pin7, TX:Pin8 @ 9600 baud. 4.0V Regulated Rail.", color: "border-l-amber-500" },
                    { title: "Piezoelectric Buzzer", sub: "Active Buzzer Module", desc: "Digital Pin 9, High frequency modulated tone for SOS.", color: "border-l-rose-500" },
                    { title: "Precipitation Detector", sub: "Rain Sensor Module (FC-37)", desc: "Analogue Pin A0 (0-1023), Digital Pin 2 (Interrupt).", color: "border-l-indigo-500" },
                  ].map((hw, i) => (
                    <motion.div 
                      key={i}
                      variants={floatVariants}
                      initial="hidden"
                      animate="animate"
                      style={{ animationDelay: `${i * 0.15}s` }}
                      whileHover={{ scale: 1.03 }}
                      className={`app-card !p-4 space-y-1.5 border-l-4 ${hw.color} shadow-lg`}
                    >
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">{hw.title}</span>
                      <h4 className="text-sm font-bold text-white">{hw.sub}</h4>
                      <p className="text-xs text-zinc-400">{hw.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "selfTest" && (
              <motion.div 
                key="selfTest"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
                className="app-card !p-6 space-y-6 min-h-[400px] border-t-4 border-t-sky-500"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono">Automated Hardware POST Diagnostic</h3>
                    <p className="text-xs text-zinc-400 font-mono">Simulates power-on self-test across all transducers</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runHardwareSelfTest}
                    disabled={selfTestRunning}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{selfTestRunning ? "Testing..." : "Execute Self-Test"}</span>
                  </motion.button>
                </div>

                <div className="rounded-xl bg-[#040407] border border-zinc-800 p-4 font-mono text-xs text-emerald-400 min-h-[220px] space-y-2 select-text shadow-inner">
                  {testResults.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-zinc-600 italic py-12 text-center"
                    >
                      Click Execute Self-Test to run full microcontroller POST verification.
                    </motion.div>
                  ) : (
                    testResults.map((res, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start space-x-2 leading-relaxed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{res}</span>
                      </motion.div>
                    ))
                  )}
                  {selfTestRunning && (
                    <motion.div 
                      animate={{ opacity: [0, 1] }} 
                      transition={{ duration: 0.8 }} 
                      className="py-1 text-sky-400"
                    >
                      _
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.main>
    </motion.div>
  );
}
