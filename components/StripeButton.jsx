"use client";

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeButton({ bookingId }) {
  const handlePayment = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ Payment error: ${data.error || "try again"}`);
        return;
      }

      const stripe = await stripePromise;
      stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error("Stripe Button Error:", err);
      alert("❌ Payment failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      Pay with Stripe
    </button>
  );
}
