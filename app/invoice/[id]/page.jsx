"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";

function formatIST(when) {
  if (!when) return "Not Provided";
  return new Date(when).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function InvoiceContent() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setBooking(data?.error ? null : data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center p-6">Loading invoice…</p>;
  if (!booking) return <p className="text-center p-6 text-red-500">Booking not found.</p>;

  const invoiceNo = `RVM-${String(booking.id || booking._id).slice(-6).toUpperCase()}`;
  const dateStr = formatIST(booking.createdAt || booking.pickupTime);

  return (
    <div className="mx-auto max-w-3xl bg-white shadow-sm rounded-xl my-8 p-6 print:shadow-none print:rounded-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">RVM Rideways</h1>
          <p className="text-sm text-slate-600">Safe. Secure. Reliable.</p>
          <p className="text-sm text-slate-600">Chennai, Tamil Nadu</p>
          <p className="text-sm text-slate-600">support@rvmrideways.com</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Invoice</p>
          <p className="text-lg font-semibold">{invoiceNo}</p>
          <p className="text-xs text-slate-500">Date: {dateStr}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="grid sm:grid-cols-2 gap-6 mt-6">
        <div>
          <h2 className="font-semibold text-slate-800 mb-1">Bill To</h2>
          <p className="text-sm text-slate-700">{booking.name}</p>
          <p className="text-sm text-slate-700">{booking.phone}</p>
          {booking.email ? <p className="text-sm text-slate-700">{booking.email}</p> : null}
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 mb-1">Ride Details</h2>
          <p className="text-sm text-slate-700"><strong>Trip:</strong> {booking.tripType}</p>
          <p className="text-sm text-slate-700"><strong>Pickup:</strong> {booking.pickup}</p>
          <p className="text-sm text-slate-700"><strong>Drop:</strong> {booking.drop}</p>
          <p className="text-sm text-slate-700"><strong>Pickup Time:</strong> {formatIST(booking.pickupTime)}</p>
          <p className="text-sm text-slate-700"><strong>Passengers:</strong> {booking.passengers ?? 1}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Qty</th>
              <th className="text-right p-3">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">Cab Ride – {booking.tripType}</td>
              <td className="p-3 text-right">1</td>
              <td className="p-3 text-right">{Number(booking.fare || 0).toFixed(2)}</td>
            </tr>
            {Number(booking.distanceKm) > 0 && (
              <tr className="border-t">
                <td className="p-3 text-slate-500">Distance</td>
                <td className="p-3 text-right" colSpan={2}>
                  {Number(booking.distanceKm).toFixed(1)} km
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td className="p-3 font-semibold" colSpan={2}>Total</td>
              <td className="p-3 text-right font-semibold">
                ₹{Number(booking.fare || 0).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="p-3 text-slate-600" colSpan={2}>Payment Status</td>
              <td className="p-3 text-right text-slate-700">{booking.paymentStatus || "created"}</td>
            </tr>
            <tr>
              <td className="p-3 text-slate-600" colSpan={2}>Booking ID</td>
              <td className="p-3 text-right text-slate-700">{booking.id || booking._id}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Thank you for choosing RVM Rideways. For support, contact support@rvmrideways.com
        </p>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:opacity-90 print:hidden"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<p className="text-center p-6">Loading invoice…</p>}>
      <InvoiceContent />
    </Suspense>
  );
}
