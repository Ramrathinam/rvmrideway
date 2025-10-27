"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.ridesPerDay) {
          const ridesArray = resData.ridesPerDay.map((d) => ({
            date: d.date,
            count: d.count,
          }));
          setData({ ...resData, ridesPerDay: ridesArray });
        } else {
          setData(resData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center p-6">Loading dashboard...</p>;
  if (!data || data.error)
    return (
      <p className="text-center p-6 text-red-500">
        {data?.error || "Failed to load dashboard data."}
      </p>
    );

  const latest = data.latestBookings || [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">
        📊 Admin Dashboard
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 text-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-600">
            Total Revenue (This Month)
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-2">
            ₹{data.totalRevenue || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 text-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-600">
            Completed Rides (This Month)
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-2">
            {data.completedRides || 0}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">
            Rides per Day
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-[var(--brand)] underline"
          >
            View bookings →
          </Link>
        </div>

        {data.ridesPerDay?.length ? (
          <div className="w-full h-64 sm:h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ridesPerDay}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">
            No rides this month yet.
          </p>
        )}
      </div>

      {/* Latest bookings */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">
            Latest Bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-[var(--brand)] underline"
          >
            See all →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="text-center text-gray-500">No recent bookings.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Route</th>
                    <th className="py-2 pr-4">Pickup Time</th>
                    <th className="py-2 pr-4">Fare</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {latest.map((b) => {
                    const shortPickup =
                      (b.pickup || "").split(",")[0] || b.pickup;
                    const shortDrop = (b.drop || "").split(",")[0] || b.drop;
                    const time = b.pickupTime
                      ? new Date(b.pickupTime).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "-";

                    return (
                      <tr key={b._id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          {b.customer?.name || "—"}
                        </td>
                        <td className="py-2 pr-4">
                          {b.customer?.phone || "—"}
                        </td>
                        <td className="py-2 pr-4">
                          {shortPickup} → {shortDrop}
                        </td>
                        <td className="py-2 pr-4">{time}</td>
                        <td className="py-2 pr-4">₹{b.fare}</td>
                        <td className="py-2 pr-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              b.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : b.status === "cancelled"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              b.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {b.paymentStatus || "unpaid"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-4 md:hidden">
              {latest.map((b) => {
                const shortPickup =
                  (b.pickup || "").split(",")[0] || b.pickup;
                const shortDrop = (b.drop || "").split(",")[0] || b.drop;
                const time = b.pickupTime
                  ? new Date(b.pickupTime).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "-";

                return (
                  <div
                    key={b._id}
                    className="p-4 border rounded-lg shadow-sm bg-gray-50"
                  >
                    <p className="text-sm font-medium">
                      {b.customer?.name || "—"} · {b.customer?.phone || "—"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {shortPickup} → {shortDrop}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{time}</p>
                    <p className="text-xs mt-1">Fare: ₹{b.fare}</p>
                    <p className="text-xs mt-1">
                      Status:{" "}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          b.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : b.status === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </p>
                    <p className="text-xs mt-1">
                      Payment:{" "}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          b.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.paymentStatus || "unpaid"}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
