'use client';

// src/components/ConditionalNavbar.js
// Wraps Navbar and hides it on pages where it shouldn't appear.

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

// Add any path here where you want NO navbar
const HIDDEN_ON = ['/payment', '/checkout'];

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const hide = HIDDEN_ON.some(p => pathname.startsWith(p));
  if (hide) return null;
  return <Navbar />;
}