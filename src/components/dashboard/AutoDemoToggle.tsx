"use client";

import { useSimulationStore } from "@/store/simulationStore";
import { useEffect, useRef, useState } from "react";
import { Play, Square, Sparkles } from "lucide-react";

export function AutoDemoToggle() {
  const { autoDemoMode, setAutoDemoMode, setSensor, setState } = useSimulationStore();
  const demoInterval = useRef<NodeJS.Timeout | null>(null);
  const demoStep = useRef(0);
  const [currentLabel, setCurrentLabel] = useState<string>("Ready");

  useEffect(() => {
    if (autoDemoMode) {
      demoStep.current = 0;
      demoInterval.current = setInterval(() => {
        demoStep.current++;
        const step = demoStep.current;

        if (step === 1) {
          setCurrentLabel("Rain starting...");
          setSensor("rainAo", 350);
          setSensor("distance", 110);
          setSensor("waterValue", 100);
        }
        else if (step === 7) {
          setCurrentLabel("Water rising...");
          setSensor("distance", 28);
          setSensor("waterValue", 180);
        }
        else if (step === 15) {
          setCurrentLabel("Emergency triggered!");
          setSensor("distance", 12);
          setSensor("waterValue", 520);
        }
        else if (step === 25) {
          setCurrentLabel("Water receding...");
          setSensor("rainAo", 1023);
          setSensor("distance", 60);
          setSensor("waterValue", 120);
        }
        else if (step === 36) {
          setCurrentLabel("Returning to normal");
          setSensor("distance", 130);
          setSensor("waterValue", 40);
        }
        else if (step > 42) {
          demoStep.current = 0;
        }
      }, 1000);
    } else {
      if (demoInterval.current) {
        clearInterval(demoInterval.current);
      }
      setCurrentLabel("Ready");
    }

    return () => {
      if (demoInterval.current) {
        clearInterval(demoInterval.current);
      }
    };
  }, [autoDemoMode, setSensor, setState]);

  return (
    <div className={`app-card overflow-hidden relative transition-all duration-300 ${
      autoDemoMode
        ? "bg-sky-950/20 border-sky-500/30 shadow-[0_0_24px_rgba(56,189,248,0.15)]"
        : ""
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col flex-1 pr-4 space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-white">Auto Demo</span>
            {autoDemoMode && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[9px] font-semibold border border-sky-500/30 animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Running</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            {currentLabel}
          </p>
        </div>

        <button
          onClick={() => setAutoDemoMode(!autoDemoMode)}
          className={`shrink-0 px-4 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            autoDemoMode
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
              : "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg"
          }`}
        >
          {autoDemoMode ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Demo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
