export type SystemState = 'IDLE' | 'MONITORING' | 'WARNING' | 'SOS';

export interface Sensors {
  distance: number;       // Current filtered distance in cm (0-255)
  waterValue: number;     // Current filtered probe reading (0-1023)
  rainAo: number;         // Current filtered rain analog value (0-1023, <= 800 wet)
  rainDo?: boolean;       // Digital rain comparator (active LOW = true)
}

export interface Timers {
  lastRainTime: number;              // When rain was last detected or continuous dry started
  waterCritStartTime: number | null; // When water probe first exceeded WATER_CRIT_THRESH
  currentTime: number;               // Current execution timestamp in ms
  lastSmsTimes: {                    // Last sent time per state for cooldown policy
    IDLE: number;
    MONITORING: number;
    WARNING: number;
    SOS: number;
  };
}

export interface Config {
  distWarningCm: number;
  distCriticalCm: number;
  distHysteresisCm: number;
  waterCritThresh: number;
  waterHysteresis: number;
  rainAoThresh: number;
  probeDebounceMs: number;
  rainResumeMs: number;
  smsCooldownMs: number;
}

export interface StateMachineResult {
  nextState: SystemState;
  newTimers: Timers;
  reason: string;
  isRaining: boolean;
  uWarn: boolean;
  uCrit: boolean;
  uSafe: boolean;
  wCritRaw: boolean;
  wConfirmed: boolean;
  wSafe: boolean;
  rainSafe: boolean;
  rainDryRemainingSec: number;
}

/**
 * PDF Page 7: Analogue Median Filter (Insertion Sort)
 * Rejects isolated electrical spikes by sorting samples and picking the center.
 */
export function calculateMedian(samples: number[]): number {
  if (!samples.length) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Simulates median filtering with noisy raw jitter rejection for demonstration
 */
export function simulateMedianFiltering(centerVal: number, sampleCount: number = 7, noiseSpikes: boolean = true): {
  raw: number[];
  sorted: number[];
  median: number;
} {
  const raw: number[] = [];
  for (let i = 0; i < sampleCount; i++) {
    let jitter = (Math.random() - 0.5) * 6;
    // Add an isolated electrical spike to demonstrate median rejection
    if (noiseSpikes && i === 1 && Math.random() > 0.4) {
      jitter += (Math.random() > 0.5 ? 45 : -45);
    }
    raw.push(Math.max(0, Math.round(centerVal + jitter)));
  }
  const sorted = [...raw].sort((a, b) => a - b);
  const median = calculateMedian(sorted);
  return { raw, sorted, median };
}

/**
 * State Transition and Dual-Sensor Confirmation Evaluator (Pages 2, 18, 19 of PDF)
 */
export function computeNextState(
  currentState: SystemState,
  sensors: Sensors,
  timers: Timers,
  config: Config
): StateMachineResult {
  const isRaining = sensors.rainAo <= config.rainAoThresh || sensors.rainDo === true;
  const newTimers: Timers = {
    ...timers,
    lastSmsTimes: { ...timers.lastSmsTimes }
  };

  // Track rain timing
  if (isRaining) {
    newTimers.lastRainTime = timers.currentTime;
  }

  // 1. Dry duration computation
  const dryElapsedMs = isRaining ? 0 : (timers.currentTime - (newTimers.lastRainTime || timers.currentTime));
  const rainSafe = !isRaining && dryElapsedMs >= config.rainResumeMs;
  const rainDryRemainingSec = Math.max(0, Math.ceil((config.rainResumeMs - dryElapsedMs) / 1000));

  // 2. Sensor evaluations matching PDF rules:
  // uWarn: distance <= 30cm
  const uWarn = sensors.distance <= config.distWarningCm;
  // uCrit: distance <= 15cm
  const uCrit = sensors.distance <= config.distCriticalCm;
  // uSafe: distance > 35cm (30cm + 5cm hysteresis)
  const uSafe = sensors.distance > (config.distWarningCm + config.distHysteresisCm);

  // wCritRaw: water probe >= 250
  const wCritRaw = sensors.waterValue >= config.waterCritThresh;
  // wSafe: water probe < 170 (250 - 80 hysteresis)
  const wSafe = sensors.waterValue < (config.waterCritThresh - config.waterHysteresis);

  // 3. Debounce water probe reading (500 ms continuous contact confirmation)
  if (wCritRaw) {
    if (newTimers.waterCritStartTime === null) {
      newTimers.waterCritStartTime = timers.currentTime;
    }
  } else {
    newTimers.waterCritStartTime = null;
  }

  const wConfirmed = newTimers.waterCritStartTime !== null &&
    (timers.currentTime - newTimers.waterCritStartTime >= config.probeDebounceMs);

  // 4. Dual-Sensor SOS Rule (Agreement required from BOTH sensors)
  const dualSOS = uCrit && wConfirmed;

  let nextState: SystemState = currentState;
  let reason = "System stable";

  // State Transition Matrix
  if (currentState === 'IDLE') {
    if (isRaining) {
      nextState = 'MONITORING';
      reason = "Rain detected: Activated active flood sensor polling";
    } else {
      nextState = 'IDLE';
      reason = "Standby: Watching for rain every 5,000ms";
    }
  } else {
    // In active states (MONITORING, WARNING, SOS)
    if (dualSOS) {
      nextState = 'SOS';
      reason = "DUAL SOS TRIGGERED: Ultrasonic <= 15cm AND Probe >= 250 sustained for 500ms";
    } else if (uWarn) {
      nextState = 'WARNING';
      reason = "Water Warning: Ultrasonic distance <= 30cm (Rising water)";
    } else {
      // Distance is above warning (> 30cm)
      if (currentState === 'SOS' || currentState === 'WARNING') {
        nextState = 'MONITORING';
        reason = "De-escalating: Distance rose above 30cm; returning to Monitoring";
      } else {
        nextState = 'MONITORING';
        reason = "Monitoring: Rain detected, sensors active and within safe thresholds";
      }

      // Check for Full Recovery to IDLE
      // "Returns to IDLE only when ultrasonic and probe readings are safe and rain has been stopped for 30 seconds"
      if (uSafe && wSafe && rainSafe) {
        nextState = 'IDLE';
        reason = "Full Recovery: Distance > 35cm, Probe < 170, and 30s continuous dry weather";
      }
    }
  }

  return {
    nextState,
    newTimers,
    reason,
    isRaining,
    uWarn,
    uCrit,
    uSafe,
    wCritRaw,
    wConfirmed,
    wSafe,
    rainSafe,
    rainDryRemainingSec,
  };
}

