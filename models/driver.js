// models/driver.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const DriverSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String, enum: ["sedan", "suv", "premium"], required: true },
    carNumber: { type: String, required: true },     // e.g., TN-01-AB-1234
    modelName: { type: String, required: true },     // e.g., Etios, Dzire, Innova
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema);
