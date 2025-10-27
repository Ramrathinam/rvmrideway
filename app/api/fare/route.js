import { computeFare } from "../../../lib/fare";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await computeFare(body); // ✅ now async

    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[/api/fare] error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 400 }
    );
  }
}
