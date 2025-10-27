// lib/distance.js
import haversine from "haversine-distance";

const ORS_KEY = process.env.ORS_API_KEY;

/**
 * Get distance & duration between two coords using ORS Directions API.
 * Falls back to haversine (scaled) if ORS fails.
 *
 * @param {Object} origin - { lat, lon }
 * @param {Object} dest   - { lat, lon }
 * @returns {Promise<{ distanceKm: number, durationMin: number, mode: string }>}
 */
export async function getDistanceAndDuration(origin, dest) {
  try {
    if (!ORS_KEY) throw new Error("Missing ORS_API_KEY");

    // ✅ Use POST with coordinates array (recommended by ORS)
    const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": ORS_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [origin.lon, origin.lat],
          [dest.lon, dest.lat],
        ],
      }),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`ORS Directions failed: ${res.status} - ${errTxt}`);
    }

    const data = await res.json();
    const segment = data?.features?.[0]?.properties?.segments?.[0];

    if (!segment?.distance || !segment?.duration) {
      console.error("ORS response invalid:", JSON.stringify(data));
      throw new Error("ORS Directions response missing values");
    }

    return {
      distanceKm: Number((segment.distance / 1000).toFixed(2)), // meters → km
      durationMin: Math.round(segment.duration / 60),           // seconds → minutes
      mode: "ors",
    };
  } catch (err) {
    console.error("❌ ORS directions error:", err.message);

    // ✅ Fallback: haversine with scaling factor (to mimic roads)
    try {
      const hav = haversine(
        { lat: origin.lat, lon: origin.lon },
        { lat: dest.lat, lon: dest.lon }
      );
      const km = hav / 1000;
      return {
        distanceKm: Number((km * 1.25).toFixed(2)),  // +25% buffer for real roads
        durationMin: Math.round(((km * 1.25) / 35) * 60), // avg 35 km/h
        mode: "haversine-fallback",
      };
    } catch (fallbackErr) {
      console.error("❌ Fallback haversine error:", fallbackErr.message);
      return { distanceKm: 0, durationMin: 0, mode: "error" };
    }
  }
}
