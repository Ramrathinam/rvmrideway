// /app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";              // ✅ use bcryptjs (not bcrypt)
import { connectDB } from "../../../../lib/db";  // ✅ fixed relative path
import User from "../../../../models/user";      // ✅ fixed relative path

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body || {};

    // --- Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email & password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // --- Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // --- Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // --- Create user
    const user = await User.create({
      name: name?.trim() || "",
      email: email.toLowerCase().trim(),
      phone: (phone || "").trim(),
      passwordHash,
    });

    return NextResponse.json({ ok: true, id: String(user._id) });
  } catch (err) {
    console.error("[POST /api/auth/signup] error:", err);
    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}
