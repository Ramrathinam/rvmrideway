// app/api/admin/bookings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import Booking from "../../../../models/booking.js";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const payment = searchParams.get("payment");
    const driver = searchParams.get("driver"); // "all" | "assigned" | "unassigned"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const q = searchParams.get("q");

    const filter = {};

    if (status && status !== "all") filter.status = status;
    if (payment && payment !== "all") filter.paymentStatus = payment;

    if (driver && driver !== "all") {
      if (driver === "assigned") {
        filter.$or = [
          { assignedDriverId: { $ne: null } },
          { driver: { $exists: true, $ne: null } },
        ];
      }
      if (driver === "unassigned") {
        filter.assignedDriverId = null;
        filter.$or = [
          { driver: { $exists: false } },
          { "driver.driverId": { $exists: false } },
        ];
      }
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = e;
      }
    }

    if (q) {
      const rx = new RegExp(q, "i");
      filter.$or = [
        ...(filter.$or || []),
        { name: rx },
        { phone: rx },
        { pickup: rx },
        { drop: rx },
      ];
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .select("+driver")
      .lean();

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("[GET /api/admin/bookings] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
