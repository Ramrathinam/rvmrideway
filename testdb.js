import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
console.log("🔎 Using URI:", uri ? "Loaded" : "Missing");

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  });
