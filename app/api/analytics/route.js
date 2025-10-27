import { NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";
export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // fetch all bookings for this month
    const snap = await db
      .collection("bookings")
      .where("createdAt", ">=", startOfMonth)
      .get();

    let totalRevenue = 0;
    let totalRides = 0;
    const daily = {};

    snap.forEach((doc) => {
      const b = doc.data();
      const d = b.createdAt?.toDate();
      if (!d) return;

      const day = d.toISOString().slice(0, 10); // yyyy-mm-dd

      if (b.status === "completed") {
        totalRides++;
      }

      if (b.payment_status === "paid") {
        totalRevenue += b.fare || 0;
      }

      daily[day] = (daily[day] || 0) + 1;
    });

    return NextResponse.json({
      totalRevenue,
      totalRides,
      daily,
    });
  } catch (e) {
    console.error("❌ Analytics error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
