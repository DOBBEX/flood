import { create } from 'zustand';
import { SystemState, Timers, Sensors } from '@/lib/stateMachine';
import { DEFAULTS } from '@/lib/config';

interface SimulationState {
  state: SystemState;
  sensors: Sensors;
  timers: Timers;
  config: typeof DEFAULTS;
  autoDemoMode: boolean;
  
  // Actions
  setSensor: (key: keyof Sensors, value: number) => void;
  setState: (newState: SystemState) => void;
  setTimers: (newTimers: Timers) => void;
  setAutoDemoMode: (enabled: boolean) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  state: 'IDLE',
  sensors: {
    distance: 100, // Safe distance in cm
    waterValue: 0,
    rainAo: 1023, // 1023 = dry
  },
  timers: {
    lastRainTime: 0,
    waterCritStartTime: null,
    currentTime: Date.now(),
  },
  config: DEFAULTS,
  autoDemoMode: false,
  
  setSensor: (key, value) => set((state) => ({
    sensors: { ...state.sensors, [key]: value }
  })),
  setState: (newState) => set({ state: newState }),
  setTimers: (newTimers) => set({ timers: newTimers }),
  setAutoDemoMode: (enabled) => set({ autoDemoMode: enabled }),
}));
