// app/api/razorpay/route.js
import { NextResponse } from "next/server";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(req) {
  try {
    const { bookingId, amount, currency = "INR" } = await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "bookingId & amount required" },
        { status: 400 }
      );
    }

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 400 }
      );
    }

    // Razorpay order create
    const orderBody = {
      amount: Number(amount), // in paise
      currency: String(currency).toUpperCase(),
      receipt: `rvm_${bookingId}`,
      notes: { bookingId },
    };

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify(orderBody),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Razorpay order error:", data);
      return NextResponse.json(
        { error: "Failed to create Razorpay order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: "razorpay",
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      key: keyId, // public key for Checkout
    });
  } catch (e) {
    console.error("🔥 Razorpay init error:", e);
    return NextResponse.json(
      { error: "Failed to create Razorpay order", detail: e.message },
      { status: 500 }
    );
  }
}
