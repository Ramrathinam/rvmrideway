// app/api/admin/bookings/[id]/assign-driver/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db.js";
import Booking from "../../../../../../models/booking.js";
import Driver from "../../../../../../models/driver.js";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    let driver = null;

    // Case 1: Assign existing driver by ID
    if (body.driverId) {
      driver = await Driver.findById(body.driverId).lean();
      if (!driver) {
        return NextResponse.json(
          { error: "Driver not found" },
          { status: 404 }
        );
      }
    }

    // Case 2: Manual driver entry (create new driver record)
    else if (
      body.name &&
      body.phone &&
      body.carNumber &&
      body.modelName &&
      body.vehicleType
    ) {
      const newDriver = await Driver.create({
        name: body.name,
        phone: body.phone,
        carNumber: body.carNumber,
        modelName: body.modelName,
        vehicleType: body.vehicleType,
      });
      driver = newDriver.toObject();
    }

    // Apply driver assignment or unassignment
    if (driver) {
      booking.assignedDriverId = String(driver._id);
      booking.driver = {
        driverId: driver._id,
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        carNumber: driver.carNumber,
        modelName: driver.modelName,
      };

      // Update status only if ride is not already completed/cancelled
      if (["pending", "confirmed"].includes(booking.status)) {
        booking.status = "assigned";
      }
    } else {
      // Unassign driver
      booking.assignedDriverId = null;
      booking.driver = null;

      if (booking.status === "assigned") {
        booking.status = "confirmed"; // roll back to confirmed
      }
    }

    await booking.save();

    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    console.error("[POST /admin/bookings/:id/assign-driver]", err);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
