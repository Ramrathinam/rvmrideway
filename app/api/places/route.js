// app/api/places/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    if (!q) return Response.json({ suggestions: [] });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const url = new URL("https://us1.locationiq.com/v1/autocomplete");
    url.searchParams.set("key", process.env.NEXT_PUBLIC_LOCATIONIQ_KEY);
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "6");
    url.searchParams.set("countrycodes", "in");
    url.searchParams.set("normalizecity", "1");
    url.searchParams.set("accept-language", "en");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error("LocationIQ error:", await res.text());
      return Response.json({ suggestions: [] });
    }

    const data = await res.json();

    // ✅ Restrict to Chennai & Tamil Nadu
    const suggestions = (data || [])
      .filter(
        (d) =>
          d.address?.state?.toLowerCase().includes("tamil nadu") ||
          d.address?.city?.toLowerCase().includes("chennai")
      )
      .map((d) => ({
        label: d.display_name, // ✅ full detailed address
        shortLabel: d.display_place || d.address?.name || "",
        address: d.display_name || "",
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon),
      }));

    return Response.json({ suggestions });
  } catch (err) {
    console.error("[/api/places] error:", err.message);
    return Response.json({ suggestions: [] });
  }
}
