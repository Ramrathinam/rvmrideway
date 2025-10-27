// /lib/fare.js
// Professional Fare Calculator with LocationIQ integration

const toNum = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// ========================
// ENV defaults (editable in .env.local)
// ========================
const DEFAULT_CURRENCY   = process.env.DEFAULT_CURRENCY || "INR";
const BASE_FARE          = toNum(process.env.BASE_FARE, 60);     // booking fee
const PER_KM             = toNum(process.env.PER_KM, 19);        // distance fare
const PER_MIN            = toNum(process.env.PER_MIN, 2);        // time fare
const MIN_FARE           = toNum(process.env.MIN_FARE, 150);     // lower bound
const AIRPORT_SURCHARGE  = toNum(process.env.AIRPORT_SURCHARGE, 50);
const DYNAMIC_MULTIPLIER = toNum(process.env.DYNAMIC_MULTIPLIER, 1); // surge factor
const MAX_FARE           = toNum(process.env.MAX_FARE, 2000);    // optional upper cap

const LOCATIONIQ_API_KEY =
  process.env.LOCATIONIQ_API_KEY || process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

// ========================
// Distance & Duration via LocationIQ
// ========================
export async function getRoadDistance(pickupLat, pickupLon, dropLat, dropLon) {
  try {
    const valid = [pickupLat, pickupLon, dropLat, dropLon].every((v) =>
      Number.isFinite(Number(v))
    );
    if (!valid) throw new Error("Invalid coordinates");

    const url = new URL(
      `https://us1.locationiq.com/v1/directions/driving/${pickupLon},${pickupLat};${dropLon},${dropLat}`
    );
    url.searchParams.set("key", LOCATIONIQ_API_KEY);
    url.searchParams.set("overview", "false");
    url.searchParams.set("alternatives", "false");
    url.searchParams.set("steps", "false");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`Directions API failed (${res.status})`);

    const data = await res.json();
    const route = data?.routes?.[0];
    const distance = route?.distance ?? route?.legs?.[0]?.distance;
    const duration = route?.duration ?? route?.legs?.[0]?.duration;

    return {
      distanceKm: (distance || 0) / 1000,          // meters → km
      durationMin: Math.round((duration || 0) / 60), // seconds → minutes
    };
  } catch (err) {
    console.error("[getRoadDistance] error:", err);
    return { distanceKm: 0, durationMin: 0 };
  }
}

// ========================
// Fare Computation
// ========================
export function computeFare({ tripType, distanceKm, durationMin, vehicleType, rideTime }) {
  const dKm = Number(distanceKm) || 0;
  const dMin = Number(durationMin) || 0;

  // Base values
  let base = BASE_FARE;
  let perKm = PER_KM;
  let perMin = PER_MIN;

  // Vehicle multipliers
  if (vehicleType === "suv") {
    base *= 1.3; perKm *= 1.3; perMin *= 1.2;
  } else if (vehicleType === "premium") {
    base *= 1.6; perKm *= 1.5; perMin *= 1.4;
  }

  // Core calculation
  let fare = base + (dKm * perKm) + (dMin * perMin);

  // Airport surcharge
  if (String(tripType || "").includes("airport")) {
    fare += AIRPORT_SURCHARGE;
  }

  // Night surcharge (10 PM – 6 AM)
  const hour = rideTime ? new Date(rideTime).getHours() : new Date().getHours();
  if (hour >= 22 || hour < 6) {
    fare *= 1.2; // 20% extra at night
  }

  // Surge pricing
  fare *= DYNAMIC_MULTIPLIER;

  // Safety: clamp between min & max
  if (!Number.isFinite(fare)) fare = MIN_FARE;
  fare = Math.max(MIN_FARE, Math.min(Math.round(fare), MAX_FARE));

  return { fare, currency: DEFAULT_CURRENCY };
}

// ========================
// Wrapper: Fare directly from coordinates
// ========================
export async function computeFareWithCoords({
  tripType,
  pickupLat, pickupLon,
  dropLat, dropLon,
  vehicleType,
  rideTime,
}) {
  const { distanceKm, durationMin } = await getRoadDistance(
    pickupLat, pickupLon, dropLat, dropLon
  );

  const result = computeFare({ tripType, distanceKm, durationMin, vehicleType, rideTime });
  return {
    ...result,
    distanceKm: Math.round(distanceKm * 100) / 100, // round to 2 decimals
    durationMin,
  };
}
