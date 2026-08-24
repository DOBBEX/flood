// lib/config.ts — Exact defaults matching the repaired Arduino Flood_detector.ino firmware
export const DEFAULTS = {
  // Ultrasonic Distance Thresholds (in cm)
  distWarningCm: 30,         // DIST_WARNING_CM: Enter WARNING at <= 30cm
  distCriticalCm: 15,        // DIST_CRITICAL_CM: Ultrasonic half of dualSOS at <= 15cm
  distHysteresisCm: 5,       // DIST_HYSTERESIS_CM: Recovery requires > 35cm (30 + 5)
  
  // Analogue Water Level Probe Thresholds (0-1023)
  waterCritThresh: 250,      // WATER_CRIT_THRESH: >= 250 is critical water contact
  waterHysteresis: 80,       // WATER_HYSTERESIS: Recovery requires < 170 (250 - 80)
  probeDebounceMs: 500,      // PROBE_DEBOUNCE_MS: Must remain critical for >= 500ms
  
  // Rain Sensor Thresholds
  rainAoThresh: 800,         // RAIN_AO_THRESH: <= 800 analogue is wet (or digital DO LOW)
  rainResumeMs: 30000,       // RAIN_RESUME_MS: 30 seconds continuous dry conditions for standby
  
  // GSM Alert & Timing Configuration
  smsCooldownMs: 120000,     // SMS_COOLDOWN_MS: 120,000ms (2 minutes) between repeated alerts
  smsMaxRetries: 3,          // SMS_MAX_RETRIES: 3 attempts per SMS
  smsRetryMs: 6000,          // SMS_RETRY_MS: 6,000ms delay between failed attempts
  recipientPhone: "+94771234567", // Tested destination phone
  
  // Hardware Timing & Polling
  idlePollMs: 5000,          // IDLE_POLL_MS: Check rain every 5,000ms while IDLE
  monitorPollMs: 2000,       // MONITOR_POLL_MS: Check flood sensors every 2,000ms when active
  oledRefreshMs: 800,        // OLED_REFRESH_MS: Redraw OLED screen every 800ms
  ledBlinkNormalMs: 400,     // LED_BLINK_MS: 400ms toggle for MONITORING green LED
  ledBlinkFastMs: 200,       // SOS red LED 200ms blink & 2,200 Hz tone toggle
  buzzerFrequencyHz: 2200,   // Active piezo buzzer frequency in Hz
};

