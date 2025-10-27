// components/admin/AssignDriverModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function AssignDriverModal({ open, onClose, booking, onAssigned }) {
  const { data, isLoading } = useSWR(open ? "/api/admin/drivers" : null, fetcher);
  const drivers = data?.drivers || [];

  // Pre-select same vehicle type to reduce mistakes
  const defaultDriverId = useMemo(() => {
    const match = drivers.find((d) => d.vehicleType === booking?.vehicleType);
    return match?._id || "";
  }, [drivers, booking]);

  const [driverId, setDriverId] = useState("");
  useEffect(() => setDriverId(defaultDriverId), [defaultDriverId]);

  if (!open || !booking) return null;

  const handleAssign = async () => {
    if (!driverId) return;
    const res = await fetch(`/api/admin/bookings/${booking._id}/assign-driver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId }),
    });
    if (res.ok) {
      onAssigned?.();
      onClose();
    } else {
      alert("Failed to assign driver");
    }
  };

  const handleUnassign = async () => {
    const res = await fetch(`/api/admin/bookings/${booking._id}/assign-driver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId: null }),
    });
    if (res.ok) {
      onAssigned?.();
      onClose();
    } else {
      alert("Failed to unassign");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Assign Driver</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">✕</button>
        </div>

        {/* Ride details (read-only) */}
        <div className="p-4 grid gap-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-slate-500">Pickup</div>
              <div className="font-medium">{booking?.pickup}</div>
            </div>
            <div>
              <div className="text-slate-500">Drop</div>
              <div className="font-medium">{booking?.drop}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-slate-500">Pickup time</div>
              <div className="font-medium">{booking?.pickupTime}</div>
            </div>
            <div>
              <div className="text-slate-500">Vehicle</div>
              <div className="font-medium uppercase">{booking?.vehicleType || "-"}</div>
            </div>
            <div>
              <div className="text-slate-500">Fare</div>
              <div className="font-medium">₹{booking?.fare ?? "-"}</div>
            </div>
          </div>
        </div>

        {/* Assign block */}
        <div className="p-4 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex-1">
            <label className="block text-sm text-slate-600 mb-1">Choose driver</label>
            <select
              disabled={isLoading}
              className="w-full border rounded-lg px-3 py-2"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              <option value="">Select a driver</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} • {d.phone} • {d.vehicleType.toUpperCase()} • {d.modelName} • {d.carNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAssign}
              disabled={!driverId}
              className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
            >
              Assign
            </button>
            {!!booking.assignedDriverId && (
              <button
                onClick={handleUnassign}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Unassign
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">
              Close
            </button>
          </div>
        </div>

        {/* Current assignment */}
        <div className="p-4 border-t text-sm text-slate-600">
          {booking.assignedDriverPopulated ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-slate-500">Currently assigned</span>
                <span className="font-medium">
                  {booking.assignedDriverPopulated.name} • {booking.assignedDriverPopulated.phone} •{" "}
                  {booking.assignedDriverPopulated.modelName} ({booking.assignedDriverPopulated.carNumber})
                </span>
              </div>
              <span className="px-2 py-1 text-xs rounded-full border border-green-500 bg-green-50 text-green-700">
                Assigned
              </span>
            </div>
          ) : (
            <span className="px-2 py-1 text-xs rounded-full border border-slate-300 bg-slate-50">
              Not assigned
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
