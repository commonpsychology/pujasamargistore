'use client';
// src/context/AuthContext.js
//
// TWO SEPARATE PROFILE PATHS
// ──────────────────────────
// Customers → public.users  (created by register page / DB trigger)
// Staff     → public.staff  (inserted manually by admin only)
//
// Role source:
//   Staff:    auth.users.app_metadata.role  (server-side only, tamper-proof)
//   Customer: public.users.role = 'customer' (cosmetic, never checked for access)
//
// On login:
//   1. signInWithPassword → JWT arrives with app_metadata.role
//   2. isStaff = app_metadata.is_staff === true
//   3. fetch correct profile table in background (non-blocking)
//   4. quickRole from JWT → instant redirect, no DB wait

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export { supabase };

// Read role from JWT — staff role is in app_metadata (server-set, tamper-proof)
// Customer role is in user_metadata (cosmetic only)
function getRoleFromUser(u) {
  return u?.app_metadata?.role ?? u?.user_metadata?.role ?? null;
}
function getIsStaff(u) {
  return u?.app_metadata?.is_staff === true;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null);
  const [profile,        setProfile]        = useState(null); // public.users row (customers)
  const [staffProfile,   setStaffProfile]   = useState(null); // public.staff row (staff)
  const [loading,        setLoading]        = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  const lastFetchedId = useRef(null);

  // ── Fetch the right profile table based on who this user is ──────────────
  const fetchProfile = useCallback(async (u) => {
    if (!u?.id) {
      setProfile(null);
      setStaffProfile(null);
      lastFetchedId.current = null;
      return;
    }
    if (u.id === lastFetchedId.current) return; // already loaded
    lastFetchedId.current = u.id;

    if (getIsStaff(u)) {
      // Staff → query public.staff via RPC (single fast call)
      const { data, error } = await supabase.rpc('get_staff_profile', { staff_id: u.id });
      if (lastFetchedId.current === u.id) {
        const row = Array.isArray(data) ? data[0] : data;
        setStaffProfile(!error && row ? row : null);
        setProfile(null);
      }
    } else {
      // Customer → query public.users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', u.id)
        .single();
      if (lastFetchedId.current === u.id) {
        setProfile(!error && data ? data : null);
        setStaffProfile(null);
      }
    }
  }, []);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      setSessionChecked(true);
      setLoading(false);
      if (u) fetchProfile(u); // background
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (event === 'INITIAL_SESSION') return;

        const u = session?.user ?? null;
        setUser(u);
        setSessionChecked(true);
        setLoading(false);

        if (u) {
          fetchProfile(u);
        } else {
          setProfile(null);
          setStaffProfile(null);
          lastFetchedId.current = null;
        }
      }
    );

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchProfile]);

  // ── Customer sign in (email or username) ──────────────────────────────────
  const signIn = useCallback(async ({ email, password, username }) => {
    let loginEmail = email;
    if (username && !email) {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('username', username.trim().toLowerCase())
        .maybeSingle();
      if (error || !data) return { error: { message: 'Username not found.' } };
      loginEmail = data.email;
    }
    const result = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (result.data?.user) fetchProfile(result.data.user);
    return result;
  }, [fetchProfile]);

  // ── Staff sign in — email only, validates against public.staff ────────────
  // After signInWithPassword the JWT carries app_metadata.role immediately,
  // so the redirect fires before fetchProfile even returns.
  const staffSignIn = useCallback(async ({ email, password }) => {
    const result = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (result.error) return result;

    const u = result.data.user;

    // Instant check: is_staff must be true in app_metadata
    if (!getIsStaff(u)) {
      await supabase.auth.signOut();
      return { error: { message: 'Access denied. This portal is for staff only.' } };
    }

    // Kick off profile fetch in background (non-blocking)
    fetchProfile(u);
    return result;
  }, [fetchProfile]);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async (router) => {
    lastFetchedId.current = null;
    try { await supabase.auth.signOut(); } catch (_) {}
    setUser(null);
    setProfile(null);
    setStaffProfile(null);
    if (router) router.replace('/login');
  }, []);

  // ── Refresh profile ───────────────────────────────────────────────────────
  const refreshProfile = useCallback(() => {
    if (user) { lastFetchedId.current = null; fetchProfile(user); }
  }, [user, fetchProfile]);

  // quickRole — available instantly from JWT, no DB wait
  const quickRole = staffProfile?.role ?? profile?.role ?? getRoleFromUser(user);
  const isStaff   = getIsStaff(user);

  return (
    <AuthContext.Provider value={{
      user,
      profile,        // public.users row — null for staff
      staffProfile,   // public.staff row — null for customers
      loading,
      sessionChecked,
      quickRole,      // instant from JWT
      isStaff,        // true if this is a staff account
      signIn,         // customer login
      staffSignIn,    // staff login
      signOut,
      refreshProfile,
      supabase,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}