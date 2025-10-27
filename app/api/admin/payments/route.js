// app/api/admin/payments/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import Booking from "../../../../models/booking.js";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const provider = searchParams.get("provider") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const q = searchParams.get("q") || "";

    // Base query
    let query = {};

    // Status filter
    if (status !== "all") {
      query.paymentStatus = status;
    }

    // Search filter
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { stripePaymentIntentId: { $regex: q, $options: "i" } },
        { upiTransactionId: { $regex: q, $options: "i" } },
        { paymentOrderId: { $regex: q, $options: "i" } },
      ];
    }

    // Date filter (createdAt from Booking)
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch bookings with filter
    const bookings = await Booking.find(query).select(
      "name phone fare currency paymentStatus stripeSessionId stripePaymentIntentId upiTransactionId paymentOrderId createdAt"
    );

    // Transform into payments
    const payments = bookings
      .map((b) => {
        const providerName = b.stripeSessionId
          ? "Stripe"
          : b.paymentOrderId
          ? "Razorpay"
          : b.upiTransactionId
          ? "UPI"
          : "N/A";

        if (provider !== "all" && provider !== providerName) return null;

        return {
          customer: b.name || "N/A",
          phone: b.phone || "N/A",
          amount: b.fare || 0,
          currency: b.currency || "INR",
          provider: providerName,
          status: b.paymentStatus || "pending",
          paymentId:
            b.stripePaymentIntentId ||
            b.stripeSessionId ||
            b.paymentOrderId ||
            b.upiTransactionId ||
            "N/A",
          booking: b._id?.toString(),
          date: b.createdAt,
        };
      })
      .filter(Boolean); // remove nulls

    return NextResponse.json({ payments });
  } catch (err) {
    console.error("Payments API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch payments", details: err.message },
      { status: 500 }
    );
  }
}
