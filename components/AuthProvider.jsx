// components/AuthProvider.jsx
"use client";

import { SessionProvider } from "next-auth/react";

/**
 * AuthProvider wraps your app with SessionProvider so
 * next-auth session state is available everywhere.
 *
 * Usage: Wrap it in /app/layout.jsx around {children}
 */
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
