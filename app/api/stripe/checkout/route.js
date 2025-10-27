import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(req) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    await connectDB();
    const booking = await Booking.findById(bookingId);

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (!Number.isFinite(booking.fare)) {
      return NextResponse.json({ error: "Fare is missing" }, { status: 400 });
    }

    const successURL = `${process.env.STRIPE_SUCCESS_URL}?bookingId=${booking._id}`;
    const cancelURL = `${process.env.STRIPE_CANCEL_URL}?bookingId=${booking._id}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: booking.currency?.toLowerCase() || "inr",
            unit_amount: Math.round(Number(booking.fare) * 100),
            product_data: {
              name: `Cab Ride - ${booking.tripType}`,
              description: `${booking.pickup} → ${booking.drop}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: successURL,
      cancel_url: cancelURL,
      metadata: {
        bookingId: booking._id.toString(),
        passengers: String(booking.passengers || 1),
        pickupTime: booking.pickupTime || "",
      },
    });

    booking.stripeSessionId = session.id;
    booking.paymentStatus = "pending"; // ✅ consistent with schema
    booking.status = "pending";
    await booking.save();

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("❌ [Stripe Checkout] Error:", err);
    return NextResponse.json(
      { error: err.message || "Stripe session creation failed" },
      { status: 500 }
    );
  }
}
