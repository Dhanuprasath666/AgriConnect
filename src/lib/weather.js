const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function fetchOpenMeteoWeather({ lat, lng }) {
  const latitude = toNumber(lat);
  const longitude = toNumber(lng);
  if (latitude == null || longitude == null) {
    throw new Error("Missing latitude/longitude for weather.");
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: ["temperature_2m", "wind_speed_10m", "relative_humidity_2m"].join(
      ","
    ),
    hourly: ["precipitation_probability"].join(","),
    timezone: "auto",
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Weather API error (${res.status}).`);
  }

  const data = await res.json();

  const current = data?.current || {};
  const hourly = data?.hourly || {};

  const nowTime = current?.time || null;
  const hourlyTimes = Array.isArray(hourly?.time) ? hourly.time : [];
  const hourlyRain = Array.isArray(hourly?.precipitation_probability)
    ? hourly.precipitation_probability
    : [];

  let rainProb = null;
  if (nowTime && hourlyTimes.length && hourlyRain.length) {
    const idx = hourlyTimes.indexOf(nowTime);
    if (idx >= 0) rainProb = toNumber(hourlyRain[idx]);
  }

  return {
    fetchedAt: new Date().toISOString(),
    time: nowTime,
    temperatureC: toNumber(current?.temperature_2m),
    windSpeedKmh: toNumber(current?.wind_speed_10m),
    humidityPercent: toNumber(current?.relative_humidity_2m),
    rainProbabilityPercent: rainProb,
  };
}

