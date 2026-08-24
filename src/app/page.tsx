"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { computeNextState } from "@/lib/stateMachine";
import { StateBanner } from "@/components/dashboard/StateBanner";
import { OledHardwareSimulator } from "@/components/dashboard/OledHardwareSimulator";
import { HardwareRack } from "@/components/dashboard/HardwareRack";
import { WaterTankVisualizer } from "@/components/dashboard/WaterTankVisualizer";
import { DistanceGauge } from "@/components/dashboard/DistanceGauge";
import { WaterLevelGauge } from "@/components/dashboard/WaterLevelGauge";
import { RainStatusWidget } from "@/components/dashboard/RainStatusWidget";
import { SensorControls } from "@/components/dashboard/SensorControls";
import { AutoDemoToggle } from "@/components/dashboard/AutoDemoToggle";
import { InteractiveFloodMap } from "@/components/dashboard/InteractiveFloodMap";
import { MedianFilterVisualizer } from "@/components/dashboard/MedianFilterVisualizer";
import { GsmConsoleTerminal } from "@/components/dashboard/GsmConsoleTerminal";
import { motion, Variants } from "framer-motion";
import {
  AlertOctagon,
  Clock,
  ShieldCheck,
  Gauge,
  Droplets,
  CloudRain,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
} from "lucide-react";

export default function DashboardPage() {
  const {
    state,
    sensors,
    timers,
    config,
    audioMuted,
    viewMode,
    setState,
    setTimers,
    setAudioMuted,
    setViewMode
  } = useSimulationStore();

  const lastState = useRef(state);
  const [timeString, setTimeString] = useState<string>("");
  const [stateReason, setStateReason] = useState<string>("System on standby");
  const [dryCountdown, setDryCountdown] = useState<number>(0);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  const isRaining = sensors.rainAo <= config.rainAoThresh || sensors.rainDo === true;
  const isCritical = state === "SOS";

  const rainDrops = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${(i * 1.66) % 100}%`,
      animationDuration: `${0.35 + (i % 5) * 0.07}s`,
      animationDelay: `${(i % 7) * 0.3}s`,
      opacity: 0.15 + (i % 4) * 0.1,
    }));
  }, []);

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    setTimeString(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    return () => clearInterval(clockTimer);
  }, []);

  // State Machine Evaluation Loop
  useEffect(() => {
    const pollInterval = state === "IDLE" ? config.idlePollMs : config.monitorPollMs;
    const loop = setInterval(() => {
      const currentTimers = { ...timers, currentTime: Date.now() };
      const result = computeNextState(state, sensors, currentTimers, config);

      setTimers(result.newTimers);
      setStateReason(result.reason);
      setDryCountdown(result.rainDryRemainingSec);

      if (result.nextState !== state) {
        setState(result.nextState);
      }

      if (result.nextState !== lastState.current) {
        fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: result.nextState, sensors }),
        }).catch(console.error);

        fetch("/api/readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            distance: sensors.distance,
            waterValue: sensors.waterValue,
            isRaining: sensors.rainAo <= config.rainAoThresh,
            state: result.nextState,
          }),
        }).catch(console.error);

        lastState.current = result.nextState;
      }
    }, pollInterval);

    return () => clearInterval(loop);
  }, [state, sensors, timers, config, setState, setTimers]);

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-100 pb-28 bg-[#0a0c10]">
      {/* Rain */}
      {isRaining && (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden opacity-60">
          {rainDrops.map((drop) => (
            <div
              key={`rain-${drop.id}`}
              className="rain-drop"
              style={{
                left: drop.left,
                animationDuration: drop.animationDuration,
                animationDelay: drop.animationDelay,
                opacity: drop.opacity,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Emergency Banner */}
      {isCritical && (
        <div className="sticky top-0 z-50 bg-rose-600/95 text-white py-3 px-4 shadow-[0_10px_30px_rgba(225,29,72,0.6)] backdrop-blur-xl border-b border-rose-400 animate-pulse">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto w-full">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-bold">Flood Emergency Detected</span>
              <p className="text-xs text-white/80 mt-0.5">
                Both sensors confirmed critical levels. SMS alert dispatched.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto px-3 sm:px-6 py-4 space-y-5 max-w-7xl"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="app-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">FLOOD GUARD</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Monitoring System</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{timeString}</span>
            </div>

            <button
              onClick={() => setAudioMuted(!audioMuted)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                !audioMuted
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
              }`}
              title="Toggle sound"
            >
              {!audioMuted ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>
          </div>
        </motion.header>

        {/* Status Banner */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
          <StateBanner state={state} reason={stateReason} />
        </motion.div>


        {/* 3 Metric Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
            <DistanceGauge distanceCm={sensors.distance} />
          </motion.div>
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
            <WaterLevelGauge waterValue={sensors.waterValue} />
          </motion.div>
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
            <RainStatusWidget isRaining={isRaining} dryCountdown={dryCountdown} />
          </motion.div>
        </motion.div>

        {/* Main Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-5 xl:col-span-5 space-y-5">
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <WaterTankVisualizer />
            </motion.div>
            <motion.div variants={itemVariants}>
              <OledHardwareSimulator state={state} sensors={sensors} isRaining={isRaining} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <HardwareRack state={state} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AutoDemoToggle />
            </motion.div>
          </div>

          <div className="col-span-12 lg:col-span-7 xl:col-span-7 space-y-5">
            <motion.div variants={itemVariants} className="app-card !p-5" whileHover={{ scale: 1.01 }}>
              <SensorControls />
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <InteractiveFloodMap state={state} sensors={sensors} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <MedianFilterVisualizer />
            </motion.div>
            <motion.div variants={itemVariants}>
              <GsmConsoleTerminal />
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
