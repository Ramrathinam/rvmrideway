// app/api/payments/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(req) {
  try {
    const { bookingId, amount, currency = "INR", customer_email } =
      await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "bookingId & amount required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // ✅ test-mode safe; no UPI here
      line_items: [
        {
          price_data: {
            currency: String(currency).toLowerCase(),
            product_data: { name: `RVM Booking ${bookingId}` },
            unit_amount: Number(amount),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customer_email || undefined,
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: { bookingId },
    });

    return NextResponse.json({
      ok: true,
      provider: "stripe",
      id: session.id,
      url: session.url,
    });
  } catch (e) {
    console.error("🔥 Payment init error:", e);
    return NextResponse.json(
      { error: "Failed to create payment", detail: e.message },
      { status: 500 }
    );
  }
}
