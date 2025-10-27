"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md border text-gray-700 hover:bg-gray-100"
      >
        ☰
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border flex flex-col text-sm z-50">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/bookings"
            className="px-4 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Bookings
          </Link>
          <Link
            href="/admin/payments"
            className="px-4 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Payments
          </Link>
        </div>
      )}
    </div>
  );
}
