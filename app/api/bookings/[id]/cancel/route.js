import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Booking from "../../../../../models/booking";


export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return NextResponse.json(
      { success: false, message: "Error cancelling booking" },
      { status: 500 }
    );
  }
}
