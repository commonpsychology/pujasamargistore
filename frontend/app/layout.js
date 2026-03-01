// app/layout.js
// ─────────────────────────────────────────────────────────────
// Root layout — wraps everything in <CartProvider> so useCart()
// works in Navbar, ProductCard, and any other client component.
// ─────────────────────────────────────────────────────────────

import './globals.css';
import { CartProvider } from '../src/context/CartContext';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';

export const metadata = {
  title: 'पूजा सामग्री — पण्डित पुष्कर राज न्यौपाने',
  description: 'Authentic pooja essentials and festive kits from Thimi, Bhaktapur.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ne">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/*
          CartProvider must be a client boundary.
          Because it has 'use client' at the top of CartContext.js,
          this import is safe here in the Server Component layout.
        */}
        <CartProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}