"use client";

import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { Play, Square } from "lucide-react";

export function AutoDemoToggle() {
  const { autoDemoMode, setAutoDemoMode, setSensor } = useSimulationStore();
  const demoInterval = useRef<NodeJS.Timeout | null>(null);
  const demoStep = useRef(0);

  useEffect(() => {
    if (autoDemoMode) {
      demoStep.current = 0;
      demoInterval.current = setInterval(() => {
        demoStep.current++;
        const step = demoStep.current;

        if (step === 1) {
          setSensor("rainAo", 400);
        } else if (step > 2 && step <= 15) {
          setSensor("distance", Math.max(10, 100 - (step - 2) * 6));
          setSensor("waterValue", Math.min(800, (step - 2) * 60));
        } else if (step > 25 && step <= 35) {
          setSensor("rainAo", 1023);
          setSensor("distance", Math.min(100, 10 + (step - 25) * 9));
          setSensor("waterValue", Math.max(0, 800 - (step - 25) * 80));
        } else if (step > 45) {
          demoStep.current = 0;
        }
      }, 1000);
    } else {
      if (demoInterval.current) {
        clearInterval(demoInterval.current);
      }
    }

    return () => {
      if (demoInterval.current) {
        clearInterval(demoInterval.current);
      }
    };
  }, [autoDemoMode, setSensor]);

  return (
    <div className="flex items-center justify-between w-full">
      <Button
        className={`w-full py-5 text-sm font-bold tracking-wide transition-all rounded-xl cursor-pointer flex items-center justify-center space-x-2 ${
          autoDemoMode
            ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
            : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600/60 shadow-md"
        }`}
        onClick={() => setAutoDemoMode(!autoDemoMode)}
      >
        {autoDemoMode ? (
          <>
            <Square className="w-4 h-4 text-red-400" />
            <span>Stop Auto Simulation</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 text-zinc-300" />
            <span>Start Auto Simulation Demo</span>
          </>
        )}
      </Button>
    </div>
  );
}
