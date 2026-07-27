export type SystemState = 'IDLE' | 'MONITORING' | 'WARNING' | 'SOS';

export interface Sensors {
  distance: number;
  waterValue: number;
  rainAo: number;
}

export interface Timers {
  lastRainTime: number;
  waterCritStartTime: number | null;
  currentTime: number; // to allow pure function testing without Date.now()
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
}

export interface StateMachineResult {
  nextState: SystemState;
  newTimers: Timers;
}

export function computeNextState(
  currentState: SystemState,
  sensors: Sensors,
  timers: Timers,
  config: Config
): StateMachineResult {
  const isRaining = sensors.rainAo <= config.rainAoThresh;
  
  // Create a copy of timers to return
  const newTimers = { ...timers };

  if (isRaining) {
    newTimers.lastRainTime = timers.currentTime;
  }

  // 1. If IDLE and no rain → stay IDLE.
  if (currentState === 'IDLE' && !isRaining) {
    // Reset water timer just in case
    newTimers.waterCritStartTime = null;
    return { nextState: 'IDLE', newTimers };
  }

  // 2. If rain detected while IDLE → MONITORING.
  let targetState = currentState;
  if (currentState === 'IDLE' && isRaining) {
    targetState = 'MONITORING';
  }

  // Read sensors
  // Hysteresis logic:
  // Once critical/warning, needs to go above threshold + hysteresis to be considered safe
  
  const isDistCritical = sensors.distance <= config.distCriticalCm;
  const isDistWarning = sensors.distance <= config.distWarningCm;
  
  // Safe logic for distance (to recover)
  const isDistSafe = sensors.distance > (config.distWarningCm + config.distHysteresisCm);

  const isWaterCritical = sensors.waterValue >= config.waterCritThresh;
  const isWaterSafe = sensors.waterValue < (config.waterCritThresh - config.waterHysteresis);

  // 4. Debounce water-critical reading
  if (isWaterCritical) {
    if (newTimers.waterCritStartTime === null) {
      newTimers.waterCritStartTime = timers.currentTime;
    }
  } else {
    newTimers.waterCritStartTime = null;
  }

  const waterConfirmed = newTimers.waterCritStartTime !== null && 
    (timers.currentTime - newTimers.waterCritStartTime >= config.probeDebounceMs);

  // 5. dualSOS
  const dualSOS = isDistCritical && waterConfirmed;

  if (dualSOS) {
    targetState = 'SOS';
  } else if (isDistWarning || (currentState === 'SOS' && !isDistSafe)) { // keep warning if not safe yet
    targetState = 'WARNING';
    // Even if it was SOS, if dualSOS is false now, we can downgrade to WARNING?
    // The prompt says "One-directional escalation with explicit recovery conditions".
    // "Recovery to IDLE only if both sensors safe... and rain has been clear".
    // "Else step back to MONITORING (never straight to IDLE)."
    // So SOS can downgrade to WARNING or MONITORING if sensors become safer.
  } else {
    // 7. Else step back to MONITORING (never straight to IDLE)
    targetState = 'MONITORING';
  }

  // 8. Recovery to IDLE
  // Only if both sensors safe (with hysteresis) and rain clear for grace period
  const rainClearedForGrace = (timers.currentTime - newTimers.lastRainTime) >= config.rainResumeMs;
  
  // But wait, if target is MONITORING and we are safe, we can recover to IDLE
  if (targetState === 'MONITORING' && isDistSafe && isWaterSafe && rainClearedForGrace && !isRaining) {
    targetState = 'IDLE';
  }

  return { nextState: targetState, newTimers };
}
