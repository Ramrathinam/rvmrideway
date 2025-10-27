// models/booking.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const DriverSnapshotSchema = new Schema(
  {
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    name: String,
    phone: String,
    vehicleType: { type: String, enum: ["sedan", "suv", "premium"] },
    carNumber: String,
    modelName: String,
  },
  { _id: false }
);

const BookingSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,

    tripType: {
      type: String,
      enum: ["airport_city", "city_airport", "city_city", "outstation", "rental", "local"],
      required: true,
    },

    pickup: { type: String, required: true },
    pickupLat: { type: Number, required: true },
    pickupLon: { type: Number, required: true },

    drop: { type: String, required: true },
    dropLat: { type: Number, required: true },
    dropLon: { type: Number, required: true },

    pickupTime: { type: String, required: true },

    passengers: { type: Number, default: 1, min: 1 },
    vehicleType: { type: String, enum: ["sedan", "suv", "premium"], default: "sedan" },

    distanceKm: Number,
    durationMin: Number,
    fare: Number,
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentOrderId: String,
    upiTransactionId: String,
    stripeSessionId: String,
    stripePaymentIntentId: String,
    invoiceId: String,

    whatsappMessageId: String,
    emailMessageId: String,

    // legacy id (kept for filters/compat)
    assignedDriverId: { type: String, default: null },

    // snapshot shown in UI
    driver: DriverSnapshotSchema,

    meta: Schema.Types.Mixed,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
