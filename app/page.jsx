import { Suspense } from "react";
import BookingForm from "../components/BookingForm";

export default function Page() {
  return (
    <main>
      <Suspense fallback={<p className="text-center p-6">Loading...</p>}>
        {/* HERO */}
        <section className="hero-gradient text-center py-16 sm:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-snug">
            RVM{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Rideways
            </span>
          </h1>

          <p className="mt-2 text-sm sm:text-base font-medium tracking-wide text-slate-600 uppercase">
            Safe. Secure. Reliable.
          </p>

          <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-xl mx-auto">
            Airport transfers & outstation rides across Chennai.
          </p>

          <div className="mt-8">
            <a
              href="/#book"
              className="btn btn-cta"
            >
              Book a Cab
            </a>
          </div>
        </section>

        {/* BOOKING FORM */}
        <section id="book" className="w-full max-w-[1000px] mx-auto py-12 sm:py-16 px-6 sm:px-8">
          <div className="glass-card p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--ink)] text-center">
              🚖 Book your safe & secure cab
            </h2>
            <p className="text-slate-600 mb-6 sm:mb-8 text-center">
              Airport transfers, outstation trips, and rentals in & around Chennai.
            </p>
            <BookingForm />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-16 sm:py-20 bg-white">
          <div className="w-full max-w-[1100px] mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-[var(--ink)]">
              How it Works
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="card p-6 hover:lift">
                <h3 className="font-semibold text-lg mb-1">1. Book Online</h3>
                <p className="text-slate-600">Choose pickup & drop, enter details, and confirm.</p>
              </div>
              <div className="card p-6 hover:lift">
                <h3 className="font-semibold text-lg mb-1">2. Driver Assigned</h3>
                <p className="text-slate-600">Nearest available driver is allocated instantly.</p>
              </div>
              <div className="card p-6 hover:lift">
                <h3 className="font-semibold text-lg mb-1">3. Enjoy the Ride</h3>
                <p className="text-slate-600">On-time pickup, safe driving & transparent fare.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="reviews" className="py-16 sm:py-20 bg-[var(--bg)]">
          <div className="w-full max-w-[1100px] mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-[var(--ink)]">
              What our Customers Say
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { name: "Arun", text: "Smooth airport ride, on-time and professional." },
                { name: "Priya", text: "Very safe & secure. My go-to in Chennai." },
                { name: "Ramesh", text: "Transparent pricing, no hidden charges!" },
              ].map((t, i) => (
                <div key={i} className="card p-6">
                  <div className="avatar mb-3" />
                  <p className="text-slate-700 mb-3">“{t.text}”</p>
                  <p className="font-semibold text-[var(--brand)]">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Suspense>
    </main>
  );
}
