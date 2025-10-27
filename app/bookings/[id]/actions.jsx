"use server";

import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";
import { redirect } from "next/navigation";

export async function cancelRideAction(id) {
  await connectDB();
  await Booking.findByIdAndUpdate(id, { status: "cancelled" });
  redirect("/bookings"); // go back to list after cancelling
}
