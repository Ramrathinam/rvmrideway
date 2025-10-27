// /app/bookings/[id]/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";
import CancelRideButton from "./CancelRideButton";

export default async function BookingDetails({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const booking = await Booking.findById(params.id).lean();

  if (!booking || booking.userId.toString() !== session.user.id) {
    redirect("/bookings");
  }

  const formattedTime = booking.pickupTime
    ? new Date(booking.pickupTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not Provided";

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 text-center">
        Ride Details
      </h1>

      {/* Main info card */}
      <div className="mb-6 rounded-lg border bg-slate-50 p-5 space-y-3">
        <p>
          <strong>Pickup:</strong>{" "}
          <span className="text-slate-900">{booking.pickup}</span>
        </p>
        <p>
          <strong>Drop:</strong>{" "}
          <span className="text-slate-900">{booking.drop}</span>
        </p>
        <p>
          <strong>Pickup Date & Time:</strong>{" "}
          <span className="text-slate-800">{formattedTime}</span>
        </p>
        <p className="text-base font-medium text-slate-800">
          <strong>Fare:</strong> ₹{booking.fare}
        </p>

        {/* Status & Payment badges */}
        <div className="flex gap-2 mt-3">
          <span
            className={`px-3 py-1 rounded text-xs font-medium ${
              booking.status === "confirmed"
                ? "bg-green-100 text-green-700"
                : booking.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Status: {booking.status}
          </span>
          <span
            className={`px-3 py-1 rounded text-xs font-medium ${
              booking.paymentStatus === "paid"
                ? "bg-green-100 text-green-700"
                : booking.paymentStatus === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Payment: {booking.paymentStatus}
          </span>
        </div>
      </div>

      {/* Extra details */}
      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <strong>Passengers:</strong> {booking.passengers}
        </p>
        <p>
          <strong>Trip Type:</strong>{" "}
          {booking.tripType ? booking.tripType.replace("_", " ") : "N/A"}
        </p>
        {booking.phone && (
          <p>
            <strong>Phone:</strong> {booking.phone}
          </p>
        )}
        {booking.email && (
          <p>
            <strong>Email:</strong> {booking.email}
          </p>
        )}
      </div>

      {/* Cancel button */}
      {booking.status !== "cancelled" && (
        <div className="mt-6">
          <CancelRideButton bookingId={params.id} />
        </div>
      )}
    </div>
  );
}
