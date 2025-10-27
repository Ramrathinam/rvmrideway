// /app/api/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import User from "../../../models/user";

export async function POST(req) {
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    await connectDB();

    const exists = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase().trim(), phone, role: "customer", passwordHash });

    return NextResponse.json({ ok: true, id: String(user._id) });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Registration failed" }, { status: 500 });
  }
}
