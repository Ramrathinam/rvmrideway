// components/Navbar.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";


export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("book");

  function closeMenu() {
    setOpen(false);
  }

  // Track active section
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -40% 0px", threshold: 0.1 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => sections.forEach((sec) => observer.unobserve(sec));
  }, []);

  // Desktop link
  function navLink(id, label) {
    return (
      <a
        href={`/#${id}`}
        onClick={closeMenu}
        className={`transition ${
          active === id
            ? "text-[var(--brand)] font-semibold"
            : "text-slate-700 hover:text-[var(--brand)]"
        }`}
      >
        {label}
      </a>
    );
  }

  // Mobile link
  function mobileLink(id, label) {
    return (
      <a
        href={`/#${id}`}
        onClick={closeMenu}
        className={`block w-full rounded-lg px-3 py-2 transition ${
          active === id
            ? "bg-slate-100 text-[var(--brand)] font-semibold"
            : "text-slate-800 hover:bg-slate-100"
        }`}
      >
        {label}
      </a>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <Image
            src="/l2.png" // must be inside /public folder
            alt="RVM Rideway Logo"
            width={56} // ~14 * 4 (sm:h-14)
            height={56}
            className="h-12 w-12 sm:h-14 sm:w-14"
            priority // ensures logo loads first
          />
          <span className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-900">
            RVM{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              RIDEWAYS
            </span>
          </span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
          {navLink("book", "Book")}
          {navLink("how", "How it works")}
          {navLink("reviews", "Reviews")}
          {navLink("contact", "Contact")}

          {session?.user ? (
            <>
              <Link
                href="/bookings"
                className={`transition ${
                  active === "bookings"
                    ? "text-[var(--brand)] font-semibold"
                    : "text-slate-700 hover:text-[var(--brand)]"
                }`}
              >
                My rides
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-700 hover:text-[var(--brand)] transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-[var(--brand)] transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl px-4 py-2 font-semibold transition btn-primary"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Hamburger (mobile only) */}
        <button
          aria-label="Open menu"
          aria-expanded={open}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-slate-800"
          >
            <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
            <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
            <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden border-t transition-[max-height] duration-300 ease-out ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 py-3 space-y-2 bg-white flex flex-col">
          {mobileLink("book", "Book")}
          {mobileLink("how", "How it works")}
          {mobileLink("reviews", "Reviews")}
          {mobileLink("contact", "Contact")}

          {session?.user ? (
            <>
              <Link
                href="/bookings"
                onClick={closeMenu}
                className="block w-full rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
              >
                My rides
              </Link>
              <button
                onClick={() => {
                  closeMenu();
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full rounded-lg border border-slate-300 py-2 font-medium text-slate-800 hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={closeMenu}
                className="w-full rounded-lg border border-slate-300 py-2 text-center font-medium text-slate-800 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                className="w-full btn btn-primary justify-center"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
