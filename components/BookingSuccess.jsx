"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Car, CheckCircle2 } from "lucide-react";

export default function BookingSuccess({ data }) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur"
        >
          <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-xl ring-1 ring-black/10">
            {/* Car + Check Icons */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-3 flex justify-center gap-3"
            >
              <Car className="h-10 w-10 text-blue-500" />
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-800">
              Booking Confirmed!
            </h3>

            {/* Booking Details */}
            <p className="text-gray-600">Ref: {data.bookingId}</p>
            <p className="text-green-700 font-semibold">
              Fare: ₹{data.fare} {data.currency}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
