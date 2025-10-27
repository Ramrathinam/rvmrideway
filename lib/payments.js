// lib/payments.js
import Stripe from "stripe";

export const COMPANY = {
  name: "RVM Rideways",
  email: "rvmrideway@gmail.com",
  phoneDisplay: "90034 09690",
  phoneE164: "+919003409690",
};
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("⚠️ Missing STRIPE_SECRET_KEY in .env.local");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

/**
 * ✅ Create Stripe Checkout Session (Card only in test mode)
 */
export async function createStripeCheckout({
  bookingId,
  amount,
  currency,
  customer_email,
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // ✅ only card in test mode
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `RVM Booking ${bookingId}`,
            },
            unit_amount: amount, // amount in smallest unit (paise, cents, etc.)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email,
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: {
        bookingId,
      },
    });

    return session;
  } catch (err) {
    console.error("🔥 Stripe Checkout Error:", err.message);
    throw err;
  }
}

/**
 * 🚧 Razorpay Placeholder (UPI for India)
 */
export async function createRazorpayOrder({ bookingId, amount, currency }) {
  console.log("⚠️ Razorpay is disabled in test mode.");
  throw new Error("Razorpay integration not active in test mode");
}
