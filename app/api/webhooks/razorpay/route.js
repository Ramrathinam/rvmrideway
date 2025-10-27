// app/api/webhooks/razorpay/route.js
import crypto from "crypto";
import { NextResponse } from "next/server";
import { db, FieldValue } from "../../../../lib/firebaseAdmin";

/**
 * Razorpay sends JSON and a signature in header: `x-razorpay-signature`
 * Signature = HMAC_SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)
 */
export async function POST(req) {
  console.log("🔥 Razorpay webhook hit");

  // 1) Read raw body (important for signature verification)
  const rawBody = await req.text();
  const sig = req.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("❌ Missing RAZORPAY_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // 2) Verify signature
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected !== sig) {
    console.error("❌ Invalid Razorpay webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3) Parse event
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    console.error("❌ Failed to parse Razorpay webhook JSON:", e);
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const type = event?.event;
  console.log("✅ Razorpay webhook verified:", type);

  // Helpers to extract common fields
  const getBookingIdFromNotes = (notes) =>
    notes?.bookingId || notes?.booking_id || null;

  const nowTs = FieldValue.serverTimestamp();

  try {
    // === SUCCESSFUL flows ===
    if (type === "payment.captured" || type === "order.paid") {
      // Prefer payment entity if present
      const payment = event?.payload?.payment?.entity;
      const order = event?.payload?.order?.entity;

      const payment_id = payment?.id || null;
      const order_id = payment?.order_id || order?.id || null;
      const amount = payment?.amount || order?.amount_paid || 0;
      const currency = (payment?.currency || order?.currency || "INR").toUpperCase();
      const bookingId =
        getBookingIdFromNotes(payment?.notes) ||
        getBookingIdFromNotes(order?.notes) ||
        null;

      // Save payment record (idempotent by doc id)
      const id = payment_id || order_id;
      await db.collection("payments").doc(id).set(
        {
          id,
          provider: "razorpay",
          status: "paid",
          amount,
          currency,
          bookingId,
          order_id,
          payment_id,
          created_at: nowTs,
        },
        { merge: true }
      );

      // Link to booking
      if (bookingId) {
        await db.collection("bookings").doc(bookingId).set(
          {
            payment_status: "paid",
            payment_provider: "razorpay",
            payment_id: payment_id || order_id,
            updatedAt: nowTs,
          },
          { merge: true }
        );
        console.log(`✅ Razorpay payment saved & booking updated: ${bookingId}`);
      } else {
        console.warn("⚠️ Razorpay success event without bookingId in notes");
      }
    }

    // === FAILED payment ===
    else if (type === "payment.failed") {
      const payment = event?.payload?.payment?.entity;
      const bookingId = getBookingIdFromNotes(payment?.notes);
      const payment_id = payment?.id;

      await db.collection("payments").doc(payment_id).set(
        {
          id: payment_id,
          provider: "razorpay",
          status: "failed",
          amount: payment?.amount || 0,
          currency: (payment?.currency || "INR").toUpperCase(),
          bookingId,
          failure_reason:
            payment?.error_description || payment?.error_reason || null,
          created_at: nowTs,
        },
        { merge: true }
      );

      if (bookingId) {
        await db.collection("bookings").doc(bookingId).set(
          {
            payment_status: "failed",
            payment_provider: "razorpay",
            payment_id,
            updatedAt: nowTs,
          },
          { merge: true }
        );
        console.log(`❌ Razorpay payment failed for booking: ${bookingId}`);
      } else {
        console.warn("⚠️ payment.failed without bookingId");
      }
    }

    // === Ignore other types ===
    else {
      console.log("ℹ️ Ignored Razorpay event:", type);
    }
  } catch (err) {
    console.error("🔥 Error handling Razorpay webhook:", err);
    // Let Razorpay retry by returning 500
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
