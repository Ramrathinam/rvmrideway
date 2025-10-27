"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || searchParams.get("id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setBooking(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <p className="text-center p-6">⏳ Loading your booking...</p>;
  if (!booking) {
    return (
      <p className="text-center p-6 text-red-500">
        ❌ Booking not found. Please contact support.
      </p>
    );
  }

  const formattedTime = booking.pickupTime
    ? new Date(booking.pickupTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not Provided";

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md space-y-6 text-slate-800">
      <h1 className="text-2xl font-bold text-center text-green-600">
        ✅ Payment Successful!
      </h1>
      <p className="text-center text-gray-600">
        Thank you for booking with us. Here are your ride details:
      </p>

      <div className="space-y-2">
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

        <div className="flex gap-2 mt-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            booking.status === "confirmed"
              ? "bg-green-100 text-green-700"
              : booking.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-200 text-gray-700"
          }`}>
            Status: {booking.status}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            booking.paymentStatus === "paid"
              ? "bg-green-100 text-green-700"
              : booking.paymentStatus === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}>
            Payment: {booking.paymentStatus}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <a
          href={`/invoice/${booking._id}`}
          className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          View / Download Invoice
        </a>
        <a
          href="/"
          className="inline-block bg-[var(--brand)] px-6 py-3 rounded-lg font-semibold text-slate-900 hover:bg-yellow-500 transition"
        >
          Book Another Ride
        </a>
        <a
          className="inline-block underline text-blue-600"
          href={`/api/invoice/${booking._id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Invoice (JSON)
        </a>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<p className="text-center p-6">Loading booking...</p>}>
      <ThankYouContent />
    </Suspense>
  );
}
