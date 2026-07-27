// lib/config.ts — defaults, mirrors the Arduino firmware exactly
export const DEFAULTS = {
  distWarningCm: 50,
  distCriticalCm: 25,
  distHysteresisCm: 8,
  waterCritThresh: 600,     // 0-1023 scale
  waterHysteresis: 80,
  rainAoThresh: 800,        // inverted board: dry=1020-1023, wet=450-500
  smsCooldownMs: 120000,
  probeDebounceMs: 500,
  rainResumeMs: 30000,      // rain must clear this long before recovery
  idlePollMs: 5000,
  monitorPollMs: 2000,
};
