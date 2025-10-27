import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions"; // ensure path is correct
import { redirect } from "next/navigation";
import MobileMenu from "./MobileMenu"; // client component

export const metadata = { title: "RVM Admin" };

export default async function AdminLayout({ children }) {
  // Server-side session check
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Fixed Navbar */}
      <header className="w-full border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Title */}
          <h1 className="font-bold text-lg sm:text-xl">RVM Admin Panel</h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/admin/dashboard" className="hover:text-[var(--brand)]">
              Dashboard
            </Link>
            <Link href="/admin/bookings" className="hover:text-[var(--brand)]">
              Bookings
            </Link>
            <Link href="/admin/payments" className="hover:text-[var(--brand)]">
              Payments
            </Link>
          </nav>

          {/* Mobile Nav */}
          <MobileMenu />
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
