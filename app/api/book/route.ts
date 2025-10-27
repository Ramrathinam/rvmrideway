// /app/api/book/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";

async function sendWhatsApp(to: string, text: string) {
  try {
    const token = process.env.WHATSAPP_TOKEN!;
    const id = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    const url = `https://graph.facebook.com/v22.0/${id}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(j));
    return j.messages?.[0]?.id ?? null;
  } catch (e) {
    console.warn("WA send failed:", e);
    return null; // don’t block booking
  }
}

async function sendEmail(to: string, subject: string, text: string) {
  try {
    // simplest: SMTP via Gmail/App Password OR use SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) return null;
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "no-reply@rvmrideways.com", name: "RVM Rideways" },
        subject,
        content: [{ type: "text/plain", value: text }],
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return "ok";
  } catch (e) {
    console.warn("Email send failed:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  // Basic validation (expand as needed)
  const required = ["name", "phone", "tripType", "pickupAt", "pickupAddress", "dropAddress"];
  for (const k of required) if (!body[k]) return Response.json({ error: `Missing ${k}` }, { status: 400 });

  const booking = new Booking({
    name: body.name,
    phone: body.phone,
    email: body.email || null,
    tripType: body.tripType,
    pickupAddress: body.pickupAddress,
    pickupLat: body.pickupLat,
    pickupLng: body.pickupLng,
    dropAddress: body.dropAddress,
    dropLat: body.dropLat,
    dropLng: body.dropLng,
    pickupAt: new Date(body.pickupAt),
    passengers: body.passengers || 1,
    vehicleType: body.vehicleType || "sedan",
    distanceKm: body.distanceKm || null,
    fare: body.fare || null,
  });
  await booking.save();

  const summary = `Booking #${booking._id}\n${booking.name} • ${booking.phone}\n${booking.pickupAddress} -> ${booking.dropAddress}\n${new Date(booking.pickupAt).toLocaleString()}`;

  // Non-blocking notifications
  const waId = booking.phone ? await sendWhatsApp(booking.phone, `Your booking is received.\n${summary}`) : null;
  if (booking.email) await sendEmail(booking.email, "Your RVM Rideways Booking", `Thanks! ${summary}`);

  if (waId) {
    booking.whatsappMessageId = waId;
    await booking.save();
  }

  return Response.json({ ok: true, bookingId: String(booking._id) });
}
