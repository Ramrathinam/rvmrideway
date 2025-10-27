// components/AuthButtons.jsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthButtons() {
  const { data } = useSession();
  const user = data?.user;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="btn btn-ghost nav-link">Login</Link>
        <Link href="/register" className="btn btn-primary">Sign up</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/bookings" className="nav-link">My rides</Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="btn btn-ghost nav-link"
      >
        Logout
      </button>
    </div>
  );
}
