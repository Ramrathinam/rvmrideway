"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LocationInput from "./LocationInput"; // ✅ new component

export default function BookingForm() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  // ---------------- STATE ----------------
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tripType, setTripType] = useState("airport_city");

  const [pickup, setPickup] = useState("");
  const [pickupLat, setPickupLat] = useState(null);
  const [pickupLon, setPickupLon] = useState(null);

  const [drop, setDrop] = useState("");
  const [dropLat, setDropLat] = useState(null);
  const [dropLon, setDropLon] = useState(null);

  const [pickupTime, setPickupTime] = useState("");
  const [minDateTime, setMinDateTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setMinDateTime(local);
  }, []);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setName(data.name || "");
        setPhone(data.phone || "");
        setTripType(data.tripType || "airport_city");
        setPickup(data.pickup || "");
        setPickupLat(data.pickupLat ?? null);
        setPickupLon(data.pickupLon ?? null);
        setDrop(data.drop || "");
        setDropLat(data.dropLat ?? null);
        setDropLon(data.dropLon ?? null);
        setPickupTime(data.pickupTime || "");
        setPassengers(data.passengers ?? 1);
      });
  }, [bookingId]);

  // ---------------- SUBMIT ----------------
  async function onSubmit(e) {
    e.preventDefault();

    if (!session?.user) {
      window.location.href = "/login";
      return;
    }

    if (!pickupLat || !pickupLon || !dropLat || !dropLon) {
      alert("Please select valid pickup & drop locations.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        phone,
        tripType,
        pickup,
        drop,
        pickupLat,
        pickupLon,
        dropLat,
        dropLon,
        pickupTime,
        passengers: Number(passengers) || 1,
      };

      let res;
      if (bookingId) {
        res = await fetch(`/api/bookings/${bookingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "Failed to save booking");
      }
      window.location.href = `/review?id=${data.id}`;
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- LOGGED-OUT VIEW ----------------
  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xl">
        <h3 className="text-lg sm:text-xl font-semibold text-[var(--ink)]">
          Start your booking
        </h3>
        <p className="mt-1 text-slate-600">
          Please sign in or create an account to continue.
        </p>

        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login" className="btn btn-primary w-full sm:w-auto">
            Login
          </Link>
          <Link href="/register" className="btn btn-outline w-full sm:w-auto">
            Create account
          </Link>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          You’ll be able to review and manage your rides after signing in.
        </p>
      </div>
    );
  }

  // ---------------- BOOKING FORM ----------------
  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-8 w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6"
    >
      <h2 className="text-xl font-semibold text-slate-900 text-center">
        🚖 {bookingId ? "Edit Your Booking" : "Book Your Ride"}
      </h2>

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          pattern="[0-9]{10,}"
          className="form-input"
        />
      </div>

      {/* Trip Type + Passengers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
          className="form-select"
        >
          <option value="airport_city">Airport → City</option>
          <option value="city_airport">City → Airport</option>
          <option value="outstation">Outstation</option>
          <option value="rental">Rental</option>
          <option value="local">Local</option>
        </select>

        <input
          type="number"
          min={1}
          max={8}
          step={1}
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
          className="form-input"
          placeholder="Passengers"
          aria-label="Passengers"
        />
      </div>

      {/* Pickup */}
      <LocationInput
        placeholder="Pickup location"
        onSelect={(loc) => {
          setPickup(loc.label);
          setPickupLat(loc.lat);
          setPickupLon(loc.lon);
        }}
      />

      {/* Drop */}
      <LocationInput
        placeholder="Drop location"
        onSelect={(loc) => {
          setDrop(loc.label);
          setDropLat(loc.lat);
          setDropLon(loc.lon);
        }}
      />

      {/* Pickup Time */}
      <input
        type="datetime-local"
        value={pickupTime}
        min={minDateTime}
        step="60"
        onChange={(e) => setPickupTime(e.target.value)}
        required
        className="form-input"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--brand)] py-3 font-semibold text-slate-900 shadow-md hover:bg-yellow-500 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : bookingId ? "Update Booking" : "Book Now"}
      </button>
    </form>
  );
}
