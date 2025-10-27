"use client";

import { useEffect, useState } from "react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data || []);
        setLoading(false);
      });
  }, []);

  async function assignDriver(bookingId, driverName, carType) {
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignedDriverId: driverName,
        vehicleType: carType,
        status: "assigned",
      }),
    });
    location.reload();
  }

  if (loading) return <p className="text-center p-6">Loading bookings...</p>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6">📋 Manage Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Pickup</th>
              <th className="p-2 border">Drop</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Fare</th>
              <th className="p-2 border">Driver</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="text-center">
                <td className="p-2 border">{b.name}</td>
                <td className="p-2 border">{b.phone}</td>
                <td className="p-2 border">{b.pickup}</td>
                <td className="p-2 border">{b.drop}</td>
                <td className="p-2 border">{new Date(b.pickupTime).toLocaleString()}</td>
                <td className="p-2 border">₹{b.fare}</td>
                <td className="p-2 border">{b.assignedDriverId || "-"}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => assignDriver(b._id, "Driver1", "sedan")}
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                  >
                    Assign Driver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
