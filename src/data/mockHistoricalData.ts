// Fake JSON data representing a realistic historical flood event

export const mockHistoricalData = Array.from({ length: 60 }).map((_, i) => {
  // Generate 60 data points (e.g., last 60 minutes)
  const now = new Date();
  now.setMinutes(now.getMinutes() - (60 - i));
  
  // Baseline
  let waterValue = 50 + Math.random() * 20; // 50-70
  let distance = 140 - Math.random() * 5;
  let isRaining = false;
  let state = "IDLE";
  
  // A storm begins at i = 15
  if (i > 15 && i <= 45) {
    isRaining = true;
    // Water level rises rapidly between 20 and 35
    if (i > 20) {
      const floodFactor = Math.min(1, (i - 20) / 15); // 0 to 1
      waterValue = 50 + floodFactor * 800 + Math.random() * 50;
      distance = 140 - floodFactor * 120 + Math.random() * 5;
    }
  }
  
  // After i = 45, the rain stops and the water begins to drain
  if (i > 45) {
    isRaining = false;
    const drainFactor = Math.max(0, 1 - (i - 45) / 15); // 1 down to 0
    waterValue = 50 + drainFactor * 800 + Math.random() * 30;
    distance = 140 - drainFactor * 120 + Math.random() * 5;
  }
  
  // Determine states based on water value
  if (waterValue > 700) {
    state = "SOS";
  } else if (waterValue > 400) {
    state = "WARNING";
  } else if (waterValue > 200) {
    state = "MONITORING";
  }

  return {
    id: `mock-${i}`,
    distance: Math.max(10, Math.round(distance)),
    waterValue: Math.round(waterValue),
    isRaining,
    state,
    createdAt: now.toISOString(),
  };
});
