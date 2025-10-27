"use client";

export default function RazorpayButton({ amount, receipt }) {
  const pay = async () => {
    const res = await fetch("/api/pay/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, receipt }),
    });
    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "RVM Rideways",
      order_id: order.id,
      handler: async (resp) => {
        const v = await fetch("/api/pay/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resp),
        });
        const { valid } = await v.json();
        if (valid) alert("✅ Payment successful");
        else alert("❌ Payment failed");
      },
      theme: { color: "#fcbf00" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return <button onClick={pay} className="btn-primary">Pay Now</button>;
}
