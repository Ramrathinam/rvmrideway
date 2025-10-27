// app/layout.jsx
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; // if you have a Footer component

export const metadata = {
  title: "RVM Rideway",
  description: "Safe & Secure Travels",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Session Provider for next-auth */}
        <AuthProvider>
          {/* ✅ Navbar always visible */}
          <Navbar />

          <main>{children}</main>

          {/* ✅ Footer always visible */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
