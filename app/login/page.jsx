// /app/login/page.jsx
"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // After login, when session is available, route by role
  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role === "admin") router.replace("/admin/dashboard");
      else if (role === "customer") router.replace("/bookings");
    }
  }, [status, session, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false, // manual redirect using session effect
      });

      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        // force re-check of session so the effect above runs immediately
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center">Sign in</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-[var(--brand)] text-slate-900 font-semibold rounded py-2 hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <p className="text-sm mt-4 text-gray-600 text-center">
        Don’t have an account?{" "}
        <Link href="/register" className="underline text-[var(--brand)]">
          Create one
        </Link>
      </p>
      <p className="text-xs mt-2 text-center">
        <Link href="/">← Back to Home</Link>
      </p>
    </div>
  );
}
