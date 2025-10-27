// lib/location.js

// Hardcoded overrides for major landmarks (street/terminal entry points)
export function getFixedCoords(address) {
  if (!address) return null;
  const txt = address.toLowerCase();

  // Chennai Airport – catch all common variants
  if (
    txt.includes("chennai airport") ||
    txt.includes("meenambakkam") ||
    txt.includes("chennai international") ||
    txt.includes("chennai domestic") ||
    txt.includes("maa terminal")
  ) {
    // International terminal road point (inside campus, routable)
    return { lat: 12.9814, lon: 80.1631 };
  }

  // TODO: add more if you want perfect accuracy for big landmarks:
  // if (txt.includes("chennai central")) return { lat: 13.0833, lon: 80.2713 };
  // if (txt.includes("egmore")) return { lat: 13.0737, lon: 80.2607 };
  // if (txt.includes("cmbt")) return { lat: 13.0673, lon: 80.2125 };

  return null;
}

export async function geocodeAddress(address) {
  const key = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;
  const url =
    `https://us1.locationiq.com/v1/search?` +
    new URLSearchParams({
      key,
      q: address,
      format: "json",
      addressdetails: "1",
      limit: "1",
      countrycodes: "in", // India bias
    });

  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const arr = await res.json();
  const first = Array.isArray(arr) ? arr[0] : null;
  if (!first?.lat || !first?.lon) throw new Error("No geocode result");
  return { lat: Number(first.lat), lon: Number(first.lon) };
}
