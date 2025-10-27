// scripts/migrate-pickupTime.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "../models/booking.js";

// Load env
dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function migratePickupTime() {
  try {
    if (!MONGO_URI) throw new Error("❌ Missing MONGO_URI or MONGODB_URI in .env.local");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const bookings = await Booking.find({ pickupTime: { $type: "date" } });
    console.log(`Found ${bookings.length} bookings with Date pickupTime`);

    for (const booking of bookings) {
      const local = new Date(booking.pickupTime).toLocaleString("sv-SE", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      });

      const formatted = local.replace(" ", "T").slice(0, 16);

      // ⚡ Update directly without triggering schema validation
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { pickupTime: formatted } },
        { strict: false }
      );

      console.log(`✅ Updated booking ${booking._id}: pickupTime → ${formatted}`);
    }

    console.log("🎉 Migration complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed", err);
    process.exit(1);
  }
}

migratePickupTime();
