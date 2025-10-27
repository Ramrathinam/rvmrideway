"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setBusy(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to register");
      setBusy(false);
      return;
    }

    // auto login, then go to booking section
    const loginRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (loginRes?.error) {
      setBusy(false);
      setError("Account created, but automatic login failed. Please login.");
      return;
    }

    window.location.href = "/#book";
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Full name"
               value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email"
               value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Phone (optional)"
               value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password"
               value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required />
        <button disabled={busy}
          className="w-full bg-yellow-600 text-white rounded py-2 hover:bg-yellow-700 transition disabled:opacity-50">
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <p className="text-xs mt-3 text-gray-600">
        Already have an account? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </div>
  );
}
