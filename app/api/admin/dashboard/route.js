// /app/api/admin/dashboard/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/booking";
import User from "../../../../models/user";

// Utility: get month range in local time (IST friendly default via Date)
function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end   = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
  return { start, end };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { start, end } = monthRange();

    // 1) Total revenue this month (sum of fares where paid)
    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: "paid", pickupTime: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$fare" } } },
      { $project: { _id: 0, total: 1 } },
    ]);

    const totalRevenue = revenueAgg?.[0]?.total || 0;

    // 2) Completed rides this month
    const completedRides = await Booking.countDocuments({
      status: "completed",
      pickupTime: { $gte: start, $lt: end },
    });

    // 3) Rides per day (this month)
    const ridesPerDayAgg = await Booking.aggregate([
      { $match: { pickupTime: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: {
            y: { $year: "$pickupTime" },
            m: { $month: "$pickupTime" },
            d: { $dayOfMonth: "$pickupTime" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    const ridesPerDay = ridesPerDayAgg.map(({ _id, count }) => ({
      date: `${String(_id.d).padStart(2, "0")}/${String(_id.m).padStart(2, "0")}`,
      count,
    }));

    // 4) Latest bookings (for a small table on dashboard)
    const latestBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // attach lightweight customer info
    const userIds = [...new Set(latestBookings.map(b => String(b.userId)).filter(Boolean))];
    const users = userIds.length
      ? await User.find({ _id: { $in: userIds } }, { name: 1, phone: 1 }).lean()
      : [];
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const bookingsWithUser = latestBookings.map(b => ({
      _id: String(b._id),
      pickup: b.pickup,
      drop: b.drop,
      pickupTime: b.pickupTime,
      fare: b.fare,
      status: b.status,
      paymentStatus: b.paymentStatus,
      customer: b.userId ? userMap.get(String(b.userId)) || null : null,
    }));

    return NextResponse.json({
      totalRevenue,
      completedRides,
      ridesPerDay,
      latestBookings: bookingsWithUser,
    });
  } catch (err) {
    console.error("[GET /api/admin/dashboard] error:", err);
    return NextResponse.json({ error: "Failed to load admin dashboard" }, { status: 500 });
  }
}
