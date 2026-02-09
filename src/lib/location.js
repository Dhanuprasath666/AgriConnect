function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function pickFirstString(...values) {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function normalize({ city, country }) {
  const safeCountry = country || "India";
  const safeCity = city || "";
  const label = safeCity ? `${safeCity}, ${safeCountry}` : safeCountry;
  return { city: safeCity, country: safeCountry, label };
}

// Free, no-key reverse geocode. Used only to display a friendly label.
// Falls back to "India" when country is missing or API is unavailable.
export async function reverseGeocodeLatLng({ lat, lng, signal } = {}) {
  const latitude = toNumber(lat);
  const longitude = toNumber(lng);
  if (latitude == null || longitude == null) {
    return normalize({ city: "", country: "India" });
  }

  const cacheKey = `ac_reverse_geocode_${latitude.toFixed(3)}_${longitude.toFixed(
    3
  )}`;
  const now = Date.now();

  try {
    const cachedRaw =
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem(cacheKey)
        : null;
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (cached && typeof cached === "object" && now - cached.at < 7 * 864e5) {
        return normalize({ city: cached.city || "", country: cached.country || "" });
      }
    }
  } catch {
    // ignore cache errors
  }

  // BigDataCloud "reverse-geocode-client" is a simple no-key endpoint that usually works with CORS.
  // If it fails, we gracefully fall back to India.
  try {
    const url = new URL(
      "https://api.bigdatacloud.net/data/reverse-geocode-client"
    );
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("localityLanguage", "en");

    const res = await fetch(url.toString(), { signal });
    if (!res.ok) throw new Error(`Reverse geocode error (${res.status})`);
    const data = await res.json();

    const city = pickFirstString(
      data?.city,
      data?.locality,
      data?.principalSubdivision,
      data?.localityInfo?.administrative?.[0]?.name
    );
    const country = pickFirstString(data?.countryName, data?.countryCode);

    const normalized = normalize({ city, country });
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(
          cacheKey,
          JSON.stringify({ at: now, city: normalized.city, country: normalized.country })
        );
      }
    } catch {
      // ignore cache errors
    }
    return normalized;
  } catch {
    // Fallback: OpenStreetMap Nominatim reverse endpoint (may be blocked by CORS / rate limits).
    try {
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", String(latitude));
      url.searchParams.set("lon", String(longitude));
      url.searchParams.set("zoom", "10");
      url.searchParams.set("addressdetails", "1");

      const res = await fetch(url.toString(), { signal });
      if (!res.ok) throw new Error(`Reverse geocode error (${res.status})`);
      const data = await res.json();
      const addr = data?.address || {};

      const city = pickFirstString(
        addr?.city,
        addr?.town,
        addr?.village,
        addr?.municipality,
        addr?.county,
        addr?.state_district
      );
      const country = pickFirstString(addr?.country, addr?.country_code);
      const normalized = normalize({ city, country });

      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({
              at: now,
              city: normalized.city,
              country: normalized.country,
            })
          );
        }
      } catch {
        // ignore cache errors
      }

      return normalized;
    } catch {
      return normalize({ city: "", country: "India" });
    }
  }
}
