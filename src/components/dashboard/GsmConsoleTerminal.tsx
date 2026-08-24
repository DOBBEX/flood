"use client";

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { Terminal, Send, Trash2, Radio, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GsmConsoleTerminal() {
  const { gsmLogs, gsmTransmitting, gsmSignalStrength, config, timers, state, clearGsmLogs, dispatchGsmSms } = useSimulationStore();
  const [customMsg, setCustomMsg] = useState("");
  const [isSending, setIsSending] = useState(false);

  const lastSend = timers.lastSmsTimes[state];
  const now = Date.now();
  const isFirst = lastSend === 0;
  const remainingSec = isFirst ? 0 : Math.max(0, Math.ceil((config.smsCooldownMs - (now - lastSend)) / 1000));

  const handleSendTest = async () => {
    if (isSending || gsmTransmitting) return;
    setIsSending(true);
    await dispatchGsmSms(customMsg ? customMsg : undefined);
    setCustomMsg("");
    setIsSending(false);
  };

  return (
    <motion.div whileHover={{ scale: 1.01 }} className="app-card !p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-white">SMS Console</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-[10px] text-zinc-300 bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <Radio className={`w-3 h-3 ${gsmTransmitting ? "text-sky-400 animate-spin" : "text-emerald-400"}`} />
            <span>{gsmSignalStrength}%</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearGsmLogs}
            className="p-1.5 rounded-md text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/40 border border-white/5 text-[11px]">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400">To: <strong className="text-white">{config.recipientPhone}</strong></span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
          remainingSec > 0
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
        }`}>
          {remainingSec > 0 ? `Wait ${remainingSec}s` : "Ready"}
        </span>
      </div>

      {/* Log window */}
      <div className="bg-[#050505] rounded-xl border border-zinc-800 p-3 h-[180px] overflow-y-auto font-mono text-[11px] space-y-1.5 shadow-inner select-text">
        <AnimatePresence initial={false}>
          {gsmLogs.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-600 italic py-8 text-center">
              No activity yet.
            </motion.div>
          ) : (
            [...gsmLogs].reverse().map((log) => {
              let color = "text-zinc-300";
              let prefix = ">>";
              if (log.type === "TX") {
                color = "text-sky-400";
                prefix = "TX >>";
              } else if (log.type === "RX") {
                color = "text-emerald-400";
                prefix = "RX <<";
              } else if (log.type === "SUCCESS") {
                color = "text-teal-300 font-bold";
                prefix = "OK [✓]";
              } else if (log.type === "WARN") {
                color = "text-amber-400";
                prefix = "WARN";
              } else if (log.type === "INFO") {
                color = "text-zinc-400";
                prefix = "SYS";
              }

              return (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
                  className="leading-relaxed flex items-start space-x-2"
                >
                  <span className="text-zinc-600 text-[10px] shrink-0">[{log.time}]</span>
                  <span className={`shrink-0 font-bold ${color}`}>{prefix}</span>
                  <span className={`${color} break-all`}>{log.message}</span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex items-center space-x-2 pt-1">
        <input
          type="text"
          placeholder="Type a message..."
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendTest}
          disabled={gsmTransmitting || isSending}
          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{gsmTransmitting ? "Sending..." : "Send"}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
