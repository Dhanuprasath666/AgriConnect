function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateRuleBasedAlerts({
  weather,
  crop,
  soilMoisturePercent,
  now = new Date(),
}) {
  const alerts = [];

  const rainProb = weather?.rainProbabilityPercent ?? null;
  const tempC = weather?.temperatureC ?? null;
  const humidity = weather?.humidityPercent ?? null;
  const windKmh = weather?.windSpeedKmh ?? null;

  const sowingDate = crop?.sowingDate || null;
  const expectedHarvestDays =
    typeof crop?.expectedHarvestDays === "number" && crop.expectedHarvestDays > 0
      ? crop.expectedHarvestDays
      : 60;

  const daysSinceSowing =
    sowingDate != null ? daysBetween(sowingDate, now) : null;

  if (typeof rainProb === "number" && rainProb >= 60) {
    alerts.push({
      ruleId: "weather_rain_soon",
      severity: "warning",
      message: `Rain probability is ${Math.round(
        rainProb
      )}% in the current hour. Consider pausing irrigation and securing harvested produce.`,
    });
  }

  if (typeof tempC === "number" && tempC >= 35) {
    alerts.push({
      ruleId: "weather_high_temp",
      severity: "info",
      message: `High temperature (${tempC.toFixed(
        1
      )}°C). Consider early-morning irrigation and shade where possible.`,
    });
  }

  if (typeof humidity === "number" && humidity >= 85) {
    alerts.push({
      ruleId: "weather_high_humidity_fungal",
      severity: "warning",
      message: `High humidity (${Math.round(
        humidity
      )}%). Increased fungal risk — improve airflow and monitor leaf spots.`,
    });
  }

  if (
    typeof soilMoisturePercent === "number" &&
    soilMoisturePercent < 30 &&
    typeof tempC === "number" &&
    tempC >= 30
  ) {
    alerts.push({
      ruleId: "soil_low_moisture_heat",
      severity: "danger",
      message: `Soil moisture is low (${Math.round(
        soilMoisturePercent
      )}%) with warm weather. Irrigation recommended to avoid stress.`,
    });
  }

  if (typeof windKmh === "number" && windKmh >= 35) {
    alerts.push({
      ruleId: "weather_high_wind",
      severity: "info",
      message: `High wind (${Math.round(
        windKmh
      )} km/h). Support young plants and avoid spraying during strong winds.`,
    });
  }

  if (typeof daysSinceSowing === "number" && daysSinceSowing >= 0) {
    const remaining = expectedHarvestDays - daysSinceSowing;
    if (remaining <= 7 && remaining >= 0) {
      alerts.push({
        ruleId: "crop_near_harvest_logistics",
        severity: "info",
        message: `Crop is nearing harvest (about ${remaining} day${
          remaining === 1 ? "" : "s"
        } left). Prepare packaging, labor, and transport planning.`,
      });
    }
  }

  return alerts;
}

