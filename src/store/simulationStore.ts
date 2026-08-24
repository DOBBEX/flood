import { create } from 'zustand';
import { SystemState, Timers, Sensors, simulateMedianFiltering } from '@/lib/stateMachine';
import { DEFAULTS } from '@/lib/config';
import { buzzerAudio } from '@/lib/buzzerAudio';

export interface GsmLogEntry {
  id: string;
  time: string;
  type: 'TX' | 'RX' | 'INFO' | 'SUCCESS' | 'WARN';
  message: string;
}

interface SimulationState {
  state: SystemState;
  sensors: Sensors;
  timers: Timers;
  config: typeof DEFAULTS;
  autoDemoMode: boolean;
  audioMuted: boolean;
  viewMode: 'responsive' | 'mobile-frame';
  
  // Hardware status
  ledBlinkState: boolean;
  gsmTransmitting: boolean;
  gsmSignalStrength: number; // 0-100%
  gsmLogs: GsmLogEntry[];
  
  // Median filter live samples for debugger
  medianDiagnostics: {
    ultrasonic: { raw: number[]; sorted: number[]; median: number };
    waterProbe: { raw: number[]; sorted: number[]; median: number };
  };
  
  // Actions
  setSensor: (key: keyof Sensors, value: number | boolean) => void;
  setState: (newState: SystemState) => void;
  setTimers: (newTimers: Timers) => void;
  setAutoDemoMode: (enabled: boolean) => void;
  setAudioMuted: (muted: boolean) => void;
  setViewMode: (mode: 'responsive' | 'mobile-frame') => void;
  toggleLedBlink: () => void;
  addGsmLog: (type: GsmLogEntry['type'], message: string) => void;
  clearGsmLogs: () => void;
  dispatchGsmSms: (customMsg?: string) => Promise<boolean>;
  refreshMedianSamples: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  state: 'IDLE',
  sensors: {
    distance: 120, // 120cm = safely clear
    waterValue: 50, // 50 / 1023 = low baseline
    rainAo: 1023,  // 1023 = dry
    rainDo: false,
  },
  timers: {
    lastRainTime: 0,
    waterCritStartTime: null,
    currentTime: Date.now(),
    lastSmsTimes: {
      IDLE: 0,
      MONITORING: 0,
      WARNING: 0,
      SOS: 0,
    },
  },
  config: DEFAULTS,
  autoDemoMode: false,
  audioMuted: true,
  viewMode: 'responsive',
  ledBlinkState: true,
  gsmTransmitting: false,
  gsmSignalStrength: 92,
  gsmLogs: [
    {
      id: 'boot-1',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'INFO',
      message: 'SIM800L Module initialised @ 9600 baud (RX:Pin7, TX:Pin8)',
    },
    {
      id: 'boot-2',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'RX',
      message: 'AT -> OK (Network Registered: CELLULAR 4G/2G)',
    },
  ],
  medianDiagnostics: {
    ultrasonic: simulateMedianFiltering(120, 7, false),
    waterProbe: simulateMedianFiltering(50, 5, false),
  },
  
  setSensor: (key, value) => {
    set((state) => {
      const updatedSensors = { ...state.sensors, [key]: value };
      const centerDist = typeof updatedSensors.distance === 'number' ? updatedSensors.distance : 100;
      const centerWater = typeof updatedSensors.waterValue === 'number' ? updatedSensors.waterValue : 100;
      
      return {
        sensors: updatedSensors,
        medianDiagnostics: {
          ultrasonic: simulateMedianFiltering(centerDist, 7, true),
          waterProbe: simulateMedianFiltering(centerWater, 5, true),
        }
      };
    });
  },
  
  setState: (newState) => {
    const prevState = get().state;
    set({ state: newState });
    
    // Audio trigger handling
    if (newState === 'SOS') {
      buzzerAudio.startSosPulse(get().config.buzzerFrequencyHz);
    } else {
      buzzerAudio.stop();
    }
    
    // Auto SMS dispatch on state escalation (as programmed on PDF page 14 & 15)
    if (newState !== prevState && newState !== 'IDLE') {
      get().dispatchGsmSms();
    }
  },
  
  setTimers: (newTimers) => set({ timers: newTimers }),
  setAutoDemoMode: (enabled) => set({ autoDemoMode: enabled }),
  
  setAudioMuted: (muted) => {
    buzzerAudio.setMuted(muted);
    set({ audioMuted: muted });
    if (!muted && get().state === 'SOS') {
      buzzerAudio.startSosPulse(get().config.buzzerFrequencyHz);
    }
  },
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  toggleLedBlink: () => set((s) => ({ ledBlinkState: !s.ledBlinkState })),
  
  addGsmLog: (type, message) => {
    const newEntry: GsmLogEntry = {
      id: `gsm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
    };
    set((s) => ({
      gsmLogs: [newEntry, ...s.gsmLogs].slice(0, 50),
    }));
  },
  
  clearGsmLogs: () => set({ gsmLogs: [] }),
  
  dispatchGsmSms: async (customMsg) => {
    const { state, sensors, config, timers, addGsmLog } = get();
    const phone = config.recipientPhone;
    
    // Check cooldown for current state (Page 5 & 14 of PDF)
    const lastSend = timers.lastSmsTimes[state];
    const now = Date.now();
    const isFirstSend = lastSend === 0;
    const cooldownElapsed = now - lastSend >= config.smsCooldownMs;
    
    if (!isFirstSend && !cooldownElapsed && !customMsg) {
      const waitSec = Math.ceil((config.smsCooldownMs - (now - lastSend)) / 1000);
      addGsmLog('WARN', `SMS Cooldown active for state ${state}: ${waitSec}s remaining.`);
      return false;
    }
    
    let defaultMsg = '';
    if (state === 'MONITORING') {
      defaultMsg = `[FLOOD ALERT] RAIN DETECTED at Station 01. Sensors armed. Water=${sensors.waterValue}/1023, Dist=${sensors.distance}cm.`;
    } else if (state === 'WARNING') {
      defaultMsg = `[FLOOD WARNING] WATER RISING! Distance <= 30cm (${sensors.distance}cm). Spillway monitoring active.`;
    } else if (state === 'SOS') {
      defaultMsg = `[CRITICAL SOS] FLOOD EMERGENCY! Ultrasonic=${sensors.distance}cm & Water Probe=${sensors.waterValue}/1023. EVACUATE IMMEDIATELY!`;
    } else {
      defaultMsg = `[RECOVERY] Water returned to safe levels (>35cm). Rain stopped. System back on Standby.`;
    }
    
    const messageToSend = customMsg || defaultMsg;
    
    // Mark GSM Transmitting & pause buzzer (PDF Page 14)
    set({ gsmTransmitting: true });
    buzzerAudio.setGsmActive(true);
    
    addGsmLog('INFO', `TX Begin: SoftwareSerial Active on Pins 7/8`);
    addGsmLog('TX', `AT -> [4000ms timeout]`);
    
    await new Promise((r) => setTimeout(r, 250));
    addGsmLog('RX', `OK`);
    
    addGsmLog('TX', `AT+CMGF=1 (Set SMS Text Mode)`);
    await new Promise((r) => setTimeout(r, 200));
    addGsmLog('RX', `OK`);
    
    addGsmLog('TX', `AT+CMGS="${phone}"`);
    await new Promise((r) => setTimeout(r, 350));
    addGsmLog('RX', `> (Ready for prompt body)`);
    
    addGsmLog('TX', `"${messageToSend}" + [Ctrl+Z / ASCII 26]`);
    await new Promise((r) => setTimeout(r, 600));
    
    const msgId = Math.floor(Math.random() * 80 + 10);
    addGsmLog('SUCCESS', `+CMGS: ${msgId} OK (Dispatched to ${phone})`);
    
    // Update cooldown timestamp
    set((s) => ({
      gsmTransmitting: false,
      timers: {
        ...s.timers,
        lastSmsTimes: {
          ...s.timers.lastSmsTimes,
          [state]: Date.now(),
        },
      },
    }));
    
    buzzerAudio.setGsmActive(false);
    
    // Log to API / Supabase
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, message: messageToSend, recipient: phone }),
    }).catch(console.error);
    
    return true;
  },
  
  refreshMedianSamples: () => {
    const { sensors } = get();
    set({
      medianDiagnostics: {
        ultrasonic: simulateMedianFiltering(sensors.distance, 7, true),
        waterProbe: simulateMedianFiltering(sensors.waterValue, 5, true),
      },
    });
  },
}));

