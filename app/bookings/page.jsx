// app/bookings/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "../../lib/db";
import Booking from "../../models/booking";
import Link from "next/link";

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectDB();

  // ✅ Fetch rides but exclude cancelled
  const bookings = await Booking.find({
    userId: session.user.id,
    status: { $ne: "cancelled" },
  })
    .sort({ pickupTime: 1 })
    .lean();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Rides</h1>

      {bookings.length === 0 && (
        <p className="text-gray-600">No confirmed rides yet.</p>
      )}

      <ul className="space-y-3">
        {bookings.map((b) => {
          // ✅ shorten pickup/drop for cleaner display
          const shortPickup = b.pickup?.split(",")[0] || b.pickup;
          const shortDrop = b.drop?.split(",")[0] || b.drop;

          return (
            <li
              key={b._id}
              className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <Link href={`/bookings/${b._id}`} className="block">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {shortPickup} → {shortDrop}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(b.pickupTime).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    ₹{b.fare}
                  </span>
                </div>

                {/* ✅ status badges */}
                <div className="mt-2 flex gap-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded font-medium ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Status: {b.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded font-medium ${
                      b.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Payment: {b.paymentStatus}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
