'use client';
// src/components/ConditionalShell.js
//
// KEY FIX — stay on page after reload
// ────────────────────────────────────
// We now wait for `sessionChecked` (set by AuthContext after getSession()
// resolves) before making any redirect decision.
//
// The old code used only `loading`, which could briefly become false with
// user=null before the localStorage session was restored — causing logged-in
// users to get kicked to /login on every reload.
//
// Flow on reload:
//   1. loading=true, sessionChecked=false  → show loading splash (no redirect)
//   2. getSession() resolves with session  → sessionChecked=true, user=<User>
//   3. loading=false                       → render page normally (no redirect)
//
// Flow on reload when NOT logged in:
//   1. loading=true, sessionChecked=false  → show loading splash
//   2. getSession() resolves with null     → sessionChecked=true, user=null
//   3. loading=false                       → redirect to /login
//
// ADMIN ROUTES (/admin/*, /admin-login):
//   Staff login uses a custom API (/api/admin/login) + sessionStorage.
//   It does NOT create a Supabase auth session, so user=null for staff always.
//   ConditionalShell must NOT touch /admin/* — those pages check sessionStorage
//   themselves. Both /admin-login and /admin/* are in PUBLIC_ROUTES below.

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

// Always accessible without a Supabase login.
// /admin and /admin-login are here because staff auth is handled
// by each admin page via sessionStorage — NOT via Supabase auth.
const PUBLIC_ROUTES = [
  '/login',
  '/admin-login',
  '/admin',          // ← THIS is the fix — all /admin/* pages exempt
  '/register',
  '/forgot-password',
  '/about',
  '/contact',
  '/policies',
];

// Staff-only route prefixes — REMOVED /admin from here.
// Admin pages do their own sessionStorage check; Supabase JWT is not involved.
const ROLE_PROTECTED = {
  // '/admin': ['admin', 'delivery', 'accounts'],  // ← removed, handled by pages
};

// Full-screen pages — no Navbar/Footer
const SHELL_HIDDEN = [
  '/login',
  '/admin-login',
  '/admin',          // ← admin pages have their own layout (sidebar), no shell
  '/register',
  '/forgot-password',
];

export default function ConditionalShell({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, isStaff, quickRole, loading, sessionChecked } = useAuth();

  const isPublic  = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
  const hideShell = SHELL_HIDDEN.some(r => pathname === r || pathname.startsWith(r + '/'));

  const prevUserRef = useRef(undefined);

  useEffect(() => {
    if (!sessionChecked) return;

    const prev          = prevUserRef.current;
    const wasEverSet    = prev !== undefined;
    const justLoggedOut = wasEverSet && prev !== null && user === null;
    prevUserRef.current = user;

    // If admin route — do nothing. Admin pages handle their own auth.
    if (isPublic) return;

    if (justLoggedOut) { router.replace('/login'); return; }

    if (!user && !isPublic) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Non-admin protected routes: check role via JWT
    if (user) {
      const matchedKey = Object.keys(ROLE_PROTECTED).find(k => pathname.startsWith(k));
      if (matchedKey) {
        const allowed = ROLE_PROTECTED[matchedKey];
        if (!isStaff || !allowed.includes(quickRole)) {
          router.replace('/');
        }
      }
    }
  }, [sessionChecked, user, isStaff, quickRole, pathname, isPublic, router]);

  // ── Show loading splash until session is confirmed ───────────────────────
  // Skip the splash for admin routes — they have their own loading state
  if ((loading || !sessionChecked) && !isPublic) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#080d18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 18,
        zIndex: 9999,
      }}>
        <style>{`
          @keyframes shellSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
          @keyframes shellDiya { 0%,100%{transform:scaleY(1) translateY(0)} 50%{transform:scaleY(1.22) translateY(-4px)} }
          @keyframes shellFade { from{opacity:0} to{opacity:1} }
        `}</style>
        <span style={{
          fontSize: 52,
          animation: 'shellDiya 1.6s ease-in-out infinite, shellFade 0.3s ease',
          display: 'block',
        }}>🪔</span>
        <div style={{
          width: 28, height: 28,
          border: '3px solid rgba(250,204,21,0.1)',
          borderTopColor: '#facc15',
          borderRadius: '50%',
          animation: 'shellSpin 0.75s linear infinite',
        }} />
      </div>
    );
  }

  // ── Admin pages and full-screen pages — no Navbar/Footer ─────────────────
  if (hideShell) return <>{children}</>;

  // ── Unauthenticated on protected page — blank while redirect fires ────────
  if (!user && !isPublic) return null;

  // ── Authenticated customer — render with Navbar + Footer ─────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080d18' }}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}