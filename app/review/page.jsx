"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ReviewContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setBooking(data);   // ✅ data is already flat
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookingId]);

  async function handlePay() {
    if (!bookingId) return;
    setPaying(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Payment failed to start.");
      }
    } catch {
      alert("Error starting payment");
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <p className="text-center p-6">Loading your booking...</p>;
  if (!booking) return <p className="text-center p-6 text-red-500">❌ Booking not found.</p>;

  const formattedTime = booking.pickupTime
    ? new Date(booking.pickupTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Not Provided";

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md space-y-6">
      <h1 className="text-xl font-bold text-slate-900 text-center">
        Review Your Booking
      </h1>
      <div className="space-y-2 text-slate-700">
        <p><strong>Name:</strong> {booking.name || "Not Provided"}</p>
        <p><strong>Phone:</strong> {booking.phone || "Not Provided"}</p>
        <p>
          <strong>Trip Type:</strong>{" "}
          {booking.tripType ? booking.tripType.replace("_", " ") : "Not Provided"}
        </p>
        <p><strong>Pickup:</strong> {booking.pickup || "Not Provided"}</p>
        <p><strong>Drop:</strong> {booking.drop || "Not Provided"}</p>
        <p><strong>Date & Time:</strong> {formattedTime}</p>
        <p><strong>Passengers:</strong> {booking.passengers ?? 1}</p>
        <p><strong>Fare:</strong> ₹{booking.fare ?? "0"}</p>
      </div>

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full py-3 rounded-lg bg-[var(--brand)] text-slate-900 font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
      >
        {paying ? "Redirecting to Payment..." : "Pay Now"}
      </button>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<p className="text-center p-6">Loading booking...</p>}>
      <ReviewContent />
    </Suspense>
  );
}
