"use client";

import { useState } from "react";
import { ShieldAlert, FileCheck, CheckCircle2 } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { motion, AnimatePresence, Variants } from "framer-motion";

export function ProtocolsPage() {
  const [activeTab, setActiveTab] = useState<"stages" | "truthTable" | "recovery">("stages");
  const { state } = useSimulationStore();

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
      className="min-h-screen relative overflow-hidden py-6 px-4 max-w-4xl mx-auto space-y-6 select-none pb-28 bg-[#0a0c10]"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="app-card shadow-2xl" whileHover={{ scale: 1.01 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Safety Protocols</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Flood detection thresholds & dual-sensor confirmation rules
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-500/30 text-xs font-semibold text-emerald-300 shadow">
            <FileCheck className="w-4 h-4" />
            <span>Active</span>
          </div>
        </div>

        {/* Tab Controls */}
        <motion.div variants={itemVariants} className="flex bg-black/40 rounded-xl p-1 border border-white/5 mt-4">
          <button
            onClick={() => setActiveTab("stages")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "stages" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow" : "text-zinc-500 hover:text-white"
            }`}
          >
            Alert Levels
          </button>
          <button
            onClick={() => setActiveTab("truthTable")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "truthTable" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow" : "text-zinc-500 hover:text-white"
            }`}
          >
            SOS Logic
          </button>
          <button
            onClick={() => setActiveTab("recovery")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "recovery" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow" : "text-zinc-500 hover:text-white"
            }`}
          >
            Recovery Rules
          </button>
        </motion.div>
      </motion.header>

      {/* Tabs Content Container */}
      <motion.main variants={itemVariants} className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {/* Tab 1: 4 Escalation Tiers */}
          {activeTab === "stages" && (
            <motion.div 
              key="stages"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
              className="space-y-4"
            >
              {[
                { 
                  id: "01", 
                  title: "Tier 1: Standby (IDLE)", 
                  desc: "Green LED Steady ON | Poll Interval: 5.0s", 
                  rule: "RAIN > 800 (DRY)", 
                  text: "No precipitation detected. The Arduino runs in a low-frequency polling loop (checking rain sensor every 5,000ms). Ultrasonic and water-probe readings are dormant to conserve power and reduce electrical wear.",
                  color: "emerald"
                },
                { 
                  id: "02", 
                  title: "Tier 2: Active Monitoring (MONITORING)", 
                  desc: "Green LED Blinks 400ms | Poll Interval: 2.0s", 
                  rule: "RAIN <= 800 OR DO LOW", 
                  text: "Rainfall is detected on the analogue plate (reading <= 800) or digital comparator pin. The system immediately arms all telemetry sensors, speeding up polling to 2,000ms intervals and transmitting an initial SMS advisory.",
                  color: "sky"
                },
                { 
                  id: "03", 
                  title: "Tier 3: Flood Advisory (WARNING)", 
                  desc: "Yellow LED Steady ON | Buzzer Silent", 
                  rule: "DIST <= 30cm", 
                  text: "Water surface is rising and has reached within 30cm of the ultrasonic sensor head. The steady yellow warning LED illuminates. GSM modem transmits a rising water alert to the operations center.",
                  color: "amber"
                },
                { 
                  id: "04", 
                  title: "Tier 4: Critical Breach (SOS)", 
                  desc: "Red LED Blinks 200ms + 2,200 Hz Siren", 
                  rule: "DIST <= 15cm & PROBE >= 250", 
                  text: "Emergency evacuation condition! Both the HC-SR04 ultrasonic sensor (clearance <= 15cm) and conductive water probe (>= 250 confirmed for >= 500 continuous milliseconds) agree. 2,200 Hz piezo siren sounds and critical SMS alerts are dispatched immediately.",
                  color: "rose"
                }
              ].map((tier, i) => (
                <motion.div 
                  key={tier.id}
                  variants={floatVariants}
                  initial="hidden"
                  animate="animate"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  whileHover={{ scale: 1.02 }}
                  className={`app-card !p-0 overflow-hidden border-l-4 border-l-${tier.color}-500 shadow-xl`}
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl bg-${tier.color}-500/15 text-${tier.color}-400 flex items-center justify-center text-sm font-black font-mono`}>
                          {tier.id}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-white">{tier.title}</h2>
                          <span className="text-[10px] font-mono text-zinc-400">{tier.desc}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-${tier.color}-500/20 text-${tier.color}-300 ${tier.id === "04" ? "animate-pulse" : ""}`}>
                        {tier.rule}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed pl-12">
                      {tier.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Tab 2: Dual-Sensor Truth Table */}
          {activeTab === "truthTable" && (
            <motion.div 
              key="truthTable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="app-card !p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase font-mono">Dual-Sensor Agreement Truth Table (Page 2 & 19)</h3>
                  <span className="text-[10px] font-mono text-zinc-400">Zero False Alarms Policy</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400">
                        <th className="py-2.5 px-3">Rain A0 / DO</th>
                        <th className="py-2.5 px-3">Ultrasonic Dist</th>
                        <th className="py-2.5 px-3">Water Probe A1</th>
                        <th className="py-2.5 px-3">Probe Debounce</th>
                        <th className="py-2.5 px-3">Resulting State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { rain: "> 800 (Dry)", dist: "> 35 cm", probe: "< 170", bounce: "N/A", result: "IDLE (Standby)", color: "emerald", rainCol: "text-emerald-400", distCol: "text-zinc-300", probeCol: "text-zinc-300", bounceCol: "text-zinc-500", bg: "hover:bg-white/5" },
                        { rain: "<= 800 (Rain)", dist: "> 30 cm", probe: "< 250", bounce: "N/A", result: "MONITORING", color: "sky", rainCol: "text-sky-400", distCol: "text-zinc-300", probeCol: "text-zinc-300", bounceCol: "text-zinc-500", bg: "hover:bg-white/5" },
                        { rain: "<= 800 (Rain)", dist: "<= 30 cm", probe: "< 250", bounce: "Unconfirmed", result: "WARNING", color: "amber", rainCol: "text-sky-400", distCol: "text-amber-400", probeCol: "text-zinc-300", bounceCol: "text-zinc-500", bg: "hover:bg-white/5" },
                        { rain: "<= 800 (Rain)", dist: "<= 15 cm", probe: ">= 250", bounce: "< 500ms (Debouncing)", result: "WARNING (Guarded)", color: "amber", rainCol: "text-sky-400", distCol: "text-rose-400", probeCol: "text-amber-400", bounceCol: "text-amber-400", bg: "hover:bg-white/5" },
                        { rain: "<= 800 (Rain)", dist: "<= 15 cm", probe: ">= 250", bounce: ">= 500ms CONFIRMED", result: "SOS (EMERGENCY)", color: "rose", rainCol: "text-sky-400", distCol: "text-rose-400 font-bold", probeCol: "text-rose-400 font-bold", bounceCol: "text-emerald-400 font-bold", bg: "hover:bg-rose-500/10 bg-rose-500/5" },
                      ].map((row, i) => (
                        <motion.tr 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: i * 0.1 }}
                          className={`${row.bg} transition-colors`}
                        >
                          <td className={`py-2 px-3 ${row.rainCol}`}>{row.rain}</td>
                          <td className={`py-2 px-3 ${row.distCol}`}>{row.dist}</td>
                          <td className={`py-2 px-3 ${row.probeCol}`}>{row.probe}</td>
                          <td className={`py-2 px-3 ${row.bounceCol}`}>{row.bounce}</td>
                          <td className={`py-2 px-3 font-bold text-${row.color}-400`}>{row.result}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-white/5">
                  Notice: Even if distance drops below 15cm due to an obstruction, SOS will NOT trigger unless the conductive water probe confirms immersion for at least 500 uninterrupted milliseconds.
                </p>
              </div>
            </motion.div>
          )}

          {/* Tab 3: 30s Recovery Hysteresis */}
          {activeTab === "recovery" && (
            <motion.div 
              key="recovery"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="app-card !p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-white/5 pb-3">
                  De-escalation & Hysteresis Recovery Mechanics (Page 19)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { num: "1. Ultrasonic Hysteresis", val: "> 35 cm Clearance", desc: "Adds 5cm buffer above the 30cm warning limit to stop rapid state toggling during wind waves.", color: "text-emerald-400" },
                    { num: "2. Probe Hysteresis", val: "< 170 Raw Value", desc: "Requires probe to drop 80 units below 250 to ensure conductive water film has drained.", color: "text-cyan-400" },
                    { num: "3. Rain Grace Timer", val: "30.0s Continuous Dry", desc: "Rain must remain continuously stopped for 30s before system will return to Standby.", color: "text-sky-400" },
                  ].map((hys, i) => (
                    <motion.div 
                      key={i}
                      variants={floatVariants}
                      initial="hidden"
                      animate="animate"
                      style={{ animationDelay: `${i * 0.15}s` }}
                      whileHover={{ scale: 1.05 }}
                      className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 shadow"
                    >
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">{hys.num}</span>
                      <div className={`text-sm font-bold ${hys.color} font-mono`}>{hys.val}</div>
                      <p className="text-[11px] text-zinc-400">
                        {hys.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </motion.div>
  );
}

export default ProtocolsPage;
