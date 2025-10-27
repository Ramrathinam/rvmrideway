import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, currency = "INR", receipt } = await req.json();
  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency, receipt, payment_capture: 1 }),
  });

  const j = await res.json();
  if (!res.ok) return Response.json(j, { status: res.status });
  return Response.json(j);
}
