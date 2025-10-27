import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/booking";

// GET /api/bookings/[id]
export async function GET(_req, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    await connectDB();
    const booking = await Booking.findById(id).lean();
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Flatten response (no nested booking object)
    const { _id, __v, ...rest } = booking;
    return NextResponse.json({ ...rest, id: String(_id), _id: String(_id) });
  } catch (err) {
    console.error("[GET /api/bookings/[id]] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id]
export async function PUT(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    let payload = {};
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Only allow safe updates
    const allowed = [
      "name",
      "phone",
      "email",
      "tripType",
      "pickup",
      "drop",
      "pickupTime",
      "pickupLat",
      "pickupLon",
      "dropLat",
      "dropLon",
      "passengers",
      "vehicleType",
      "status",
      "paymentStatus",
      "upiTransactionId",
      "assignedDriverId",
      "meta",
      "stripeSessionId",
      "stripePaymentIntentId",
      "invoiceId",
    ];

    await connectDB();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    for (const key of allowed) {
      if (key in payload && payload[key] !== undefined) {
        booking[key] = payload[key];
      }
    }

    await booking.save();
    const { _id, __v, ...rest } = booking.toObject();

    return NextResponse.json({ ...rest, id: String(_id), _id: String(_id) });
  } catch (err) {
    console.error("[PUT /api/bookings/[id]] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}
