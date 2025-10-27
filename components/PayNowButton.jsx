"use client";

import { useState } from "react";

export default function PayNowButton({
  bookingId,
  amount,               // in paise
  currency = "INR",
  email,
}) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    try {
      setLoading(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: Number(amount),
          currency,
          customer_email: email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.detail || data?.error || "Failed to create payment");
      }
      window.location.href = data.url; // Redirect to Stripe Checkout
    } catch (err) {
      alert(err.message || "Failed to create payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? "Redirecting..." : "Pay Now"}
    </button>
  );
}
