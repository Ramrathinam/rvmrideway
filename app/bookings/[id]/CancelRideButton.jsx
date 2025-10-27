"use client";

import { useState, useTransition } from "react";
import { cancelRideAction } from "./actions"; // ✅ import the server action here

export default function CancelRideButton({ bookingId }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(() => {
      // This calls the server action directly from the client component
      cancelRideAction(bookingId);
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full bg-red-600 text-white rounded py-2 hover:bg-red-700 transition"
      >
        Cancel Ride
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-3 text-lg font-semibold">Cancel Ride?</h2>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to cancel this ride? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                No, keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
