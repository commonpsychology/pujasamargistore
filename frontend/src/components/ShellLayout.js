'use client';
// src/components/ShellLayout.js
// Client component that reads the current pathname and conditionally
// renders Navbar, Footer and LangToggle — so layout.js can stay a
// simple non-async server component with no headers() call.

import { usePathname } from 'next/navigation';
import Navbar     from './Navbar';
import Footer     from './Footer';
import LangToggle from './LangToggle';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/admin-login', '/admin/orders', '/admin/messages', '/admin/bookings','/verify-email'];

export default function ShellLayout({ children }) {
  const pathname   = usePathname();
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p));

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main>{children}</main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <LangToggle />}
    </>
  );
}