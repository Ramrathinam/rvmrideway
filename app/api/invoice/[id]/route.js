// /app/api/invoice/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/booking";

export async function GET(_req, { params }) {
  try {
    const { id } = params || {};
    if (!id) return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });

    await connectDB();
    const booking = await Booking.findById(id).lean();
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const invoiceId = booking.invoiceId || `INV-${String(booking._id).slice(-6).toUpperCase()}`;

    // Format date in IST for display
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

    const invoice = {
      invoiceId,
      issuedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      paymentStatus: booking.paymentStatus,
      customer: {
        name: booking.name,
        phone: booking.phone,
        email: booking.email || "Not Provided",
      },
      trip: {
        type: booking.tripType,
        pickup: booking.pickup,
        drop: booking.drop,
        dateTime: formattedTime,
        passengers: booking.passengers || 1,
        vehicleType: booking.vehicleType || "sedan",
        distanceKm: booking.distanceKm,
        durationMin: booking.durationMin,
      },
      fare: {
        amount: booking.fare,
        currency: booking.currency || "INR",
      },
      links: {
        booking: `/api/bookings/${id}`,
      },
    };

    return NextResponse.json(invoice);
  } catch (err) {
    console.error("[GET /api/invoice/[id]] error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate invoice" }, { status: 500 });
  }
}
