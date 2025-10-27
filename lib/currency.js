// lib/currency.js
const MAP = {
  IN: { code: "INR", symbol: "₹", rate: 1 },
  US: { code: "USD", symbol: "$", rate: 0.012 },
  AE: { code: "AED", symbol: "د.إ", rate: 0.044 },
  SG: { code: "SGD", symbol: "S$", rate: 0.016 },
  GB: { code: "GBP", symbol: "£", rate: 0.0096 },
  EU: { code: "EUR", symbol: "€", rate: 0.011 },
};

export function detectCountry(headers) {
  return headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "IN";
}

export function pickCurrency(country) {
  return MAP[country] || MAP.IN;
}
