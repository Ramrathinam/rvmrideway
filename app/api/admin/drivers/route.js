// app/api/admin/drivers/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import Driver from "../../../../models/driver.js";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const filter = {};
    if (active === "1") filter.isActive = true;

    const drivers = await Driver.find(filter)
      .select("name phone vehicleType carNumber modelName isActive")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ drivers });
  } catch (e) {
    console.error("drivers list error:", e);
    return NextResponse.json({ drivers: [] });
  }
}
