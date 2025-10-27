import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 WhatsApp webhook received:", body);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ WhatsApp webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
