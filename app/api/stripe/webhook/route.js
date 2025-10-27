import { headers } from "next/headers";
import Stripe from "stripe";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/booking";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  let event;
  try {
    const buf = await req.arrayBuffer();
    const sig = headers().get("stripe-signature");
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, endpointSecret);
    console.log("✅ Webhook received:", event.type);
  } catch (err) {
    console.error("❌ [Stripe Webhook] Signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.warn("⚠️ [Stripe Webhook] Missing bookingId in metadata!");
        return new Response("Missing bookingId", { status: 400 });
      }

      await connectDB();
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.warn("⚠️ [Stripe Webhook] Booking not found:", bookingId);
        return new Response("Booking not found", { status: 404 });
      }

      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      booking.stripePaymentIntentId = session.payment_intent || "";

      if (!booking.invoiceId) {
        booking.invoiceId = `INV-${String(booking._id).slice(-6).toUpperCase()}`;
      }

      await booking.save();
      console.log("✅ [Stripe Webhook] Booking confirmed:", bookingId);
    } else {
      console.log(`ℹ️ [Stripe Webhook] Ignored event type: ${event.type}`);
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("❌ [Stripe Webhook] Handler error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
}
