// components/PayButton.jsx
"use client";
import { useState } from "react";

export default function PayButton({ booking }) {
  const [loading, setLoading] = useState(false);

  async function startPayment(provider) {
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        bookingId: booking.id,
        amount: booking.amount,
        currency: booking.currency,
        customer_email: booking.email,
      }),
    });

    const data = await res.json();

    if (provider === "stripe" && data.session?.url) {
      window.location.assign(data.session.url);
    }

    if (provider === "razorpay" && data.order) {
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "RVM Rideway",
        order_id: data.order.id,
        notes: { bookingId: booking.id },
        handler: function (response) {
          alert("Payment success: " + response.razorpay_payment_id);
        },
      });
      rzp.open();
    }

    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => startPayment("razorpay")}
        className="px-4 py-2 rounded-xl border"
      >
        Pay with Razorpay
      </button>
      <button
        disabled={loading}
        onClick={() => startPayment("stripe")}
        className="px-4 py-2 rounded-xl border"
      >
        Pay with Stripe
      </button>
    </div>
  );
}
