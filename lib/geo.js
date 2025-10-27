// lib/geo.js

// Detect country from request headers (server) or fallback to IN on client
export function detectCountryFromHeaders(headers) {
  // Works on Vercel/Next with Edge/Node runtimes
  const c1 = headers?.get?.("x-vercel-ip-country");
  const c2 = headers?.get?.("x-forwarded-country");
  const c3 = headers?.get?.("x-country");
  const lang = headers?.get?.("accept-language");
  if (c1) return c1;
  if (c2) return c2;
  if (c3) return c3;
  if (lang?.startsWith("en-GB")) return "GB";
  if (lang?.startsWith("en-US")) return "US";
  return "IN";
}

// Client-side fallback (if you ever need it)
export function detectCountry() {
  try {
    const lang = typeof navigator !== "undefined" ? navigator.language : "";
    if (lang.startsWith("en-GB")) return "GB";
    if (lang.startsWith("en-US")) return "US";
    return "IN";
  } catch {
    return "IN";
  }
}

// Map country -> currency
export function currencyForCountry(code) {
  switch ((code || "IN").toUpperCase()) {
    case "IN": return "INR";
    case "US": return "USD";
    case "GB": return "GBP";
    case "AE": return "AED";
    default:   return "INR";
  }
}
