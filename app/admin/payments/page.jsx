// app/admin/payments/page.jsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function PaymentsPage() {
  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    provider: "all",
    startDate: "",
    endDate: "",
  });

  const query = new URLSearchParams(filters).toString();
  const { data, isLoading } = useSWR(`/api/admin/payments?${query}`, fetcher);
  const rows = data?.payments || [];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h2 className="text-xl font-semibold">Payments</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start mb-4">
        {/* Search */}
        <div className="flex flex-col flex-1">
          <label className="text-xs text-gray-500 mb-1">Search</label>
          <input
            type="text"
            name="q"
            placeholder="Name, Phone, Payment ID..."
            value={filters.q}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col flex-1 sm:flex-none">
          <label className="text-xs text-gray-500 mb-1">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="created">Created</option>
          </select>
        </div>

        {/* Provider */}
        <div className="flex flex-col flex-1 sm:flex-none">
          <label className="text-xs text-gray-500 mb-1">Provider</label>
          <select
            name="provider"
            value={filters.provider}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="Stripe">Stripe</option>
            <option value="Razorpay">Razorpay</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col flex-1 sm:flex-none">
          <label className="text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col flex-1 sm:flex-none">
          <label className="text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b bg-gray-50">
              <th className="p-3">#</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment ID</th>
              <th className="p-3">Booking</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.paymentId + idx} className="border-b">
                <td className="p-3">{idx + 1}</td>
                <td className="p-3">{r.customer}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">
                  ₹{r.amount?.toFixed(2)} {r.currency}
                </td>
                <td className="p-3">{r.provider}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      r.status === "paid"
                        ? "bg-green-500/10 border-green-500 text-green-700"
                        : r.status === "failed"
                        ? "bg-red-500/10 border-red-500 text-red-700"
                        : "bg-yellow-500/10 border-yellow-500 text-yellow-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">{r.paymentId}</td>
                <td className="p-3">
                  {r.booking ? (
                    <Link
                      href={`/admin/bookings?search=${r.booking}`}
                      className="text-blue-500 hover:underline font-mono text-xs"
                    >
                      {r.booking}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3">
                  {r.date ? new Date(r.date).toLocaleString() : "-"}
                </td>
              </tr>
            ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={9}>
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {rows.map((r, idx) => (
          <div
            key={r.paymentId + idx}
            className="p-4 border rounded-lg shadow-sm bg-gray-50"
          >
            <p className="text-sm font-medium">
              {idx + 1}. {r.customer || "—"}
            </p>
            <p className="text-xs text-gray-600">Phone: {r.phone || "—"}</p>
            <p className="text-xs mt-1">
              Amount: ₹{r.amount?.toFixed(2)} {r.currency}
            </p>
            <p className="text-xs">Provider: {r.provider}</p>
            <p className="text-xs mt-1">
              Status:{" "}
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  r.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : r.status === "failed"
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {r.status}
              </span>
            </p>
            <p className="text-xs mt-1 font-mono">Payment ID: {r.paymentId}</p>
            <p className="text-xs mt-1">
              Booking:{" "}
              {r.booking ? (
                <Link
                  href={`/admin/bookings?search=${r.booking}`}
                  className="text-blue-500 underline font-mono"
                >
                  {r.booking}
                </Link>
              ) : (
                "-"
              )}
            </p>
            <p className="text-xs mt-1">
              Date: {r.date ? new Date(r.date).toLocaleString() : "-"}
            </p>
          </div>
        ))}

        {!isLoading && rows.length === 0 && (
          <p className="text-center text-gray-500">No payments found.</p>
        )}
      </div>
    </div>
  );
}
