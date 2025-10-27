// /components/Footer.jsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            🚖 RVM Rideway
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Safe, secure & on-time cabs across Chennai.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-lg">Contact</h3>
          <p className="mt-2 text-sm">
            <a href="mailto:rvmrideway@gmail.com" className="hover:underline">
              rvmrideway@gmail.com
            </a>
          </p>
          <p className="text-sm">📞 +91-9003409690</p>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/919003409690"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="h-5 w-5"
            />
            Chat on WhatsApp
          </a>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg">Quick Links</h3>
          <ul className="mt-2 space-y-2 text-sm">
            <li><a href="/#book" className="hover:underline">Book now</a></li>
            <li><a href="/#how" className="hover:underline">How it works</a></li>
            <li><a href="/#reviews" className="hover:underline">Reviews</a></li>
            <li><Link href="/login" className="hover:underline">Login</Link></li>
            <li><Link href="/register" className="hover:underline">Sign up</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-8 pt-4 text-center text-xs text-slate-400">
        © 2025 RVM Rideway Safe & Secure Travels • Chennai
      </div>
    </footer>
  );
}
