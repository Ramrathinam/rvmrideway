"use client";

export default function UPIButton({ amount }) {
  const upiId = "yourupiid@upi"; // replace with your UPI ID
  const payeeName = "RVM Rideways";

  const handlePay = () => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      payeeName
    )}&am=${amount}&cu=INR&tn=Cab Ride Payment`;

    // Redirect to UPI app
    window.location.href = upiUrl;
  };

  return (
    <button
      onClick={handlePay}
      className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold"
    >
      Pay with UPI
    </button>
  );
}
