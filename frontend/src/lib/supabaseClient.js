// src/lib/supabaseClient.js
//
// Exports TWO clients:
//   supabase      — anon key, used from browser and server routes for public ops
//   supabaseAdmin — service role key, ONLY used in server-side API routes
//
// THE ONLY REAL FIX FOR:
//   AbortError: Lock broken by another request with the 'steal' option
//
// Supabase auth-js wraps EVERY auth op in _acquireLock() via Web Locks API.
// Turbopack/HMR re-evaluates modules, creating two client instances.
// The second steals the lock → AbortError.
// FIX: pass a no-op `auth.lock` fn — disables Web Locks entirely.
// Safe for single-tab email/password flows.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL        || '';
const SUPABASE_ANON        = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY   || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY       || '';

// Replaces navigator.locks — just runs the callback directly, no locking
const noOpLock = (_name, _timeout, fn) => fn();

// ── ANON CLIENT (browser-safe singleton) ─────────────────────
let _anonClient = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  if (_anonClient) return _anonClient;
  _anonClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      lock:               noOpLock,
      persistSession:     true,
      detectSessionInUrl: false,
      flowType:           'implicit',
      storageKey:         'puja-auth',
      autoRefreshToken:   true,
      debug:              false,
    },
  });
  return _anonClient;
}

export const supabase = getSupabaseClient();

// ── ADMIN CLIENT (server-only, service role) ──────────────────
// NEVER expose this to the browser. Only import in /api routes.
let _adminClient = null;

export function getSupabaseAdmin() {
  // This function is server-only. The key is intentionally absent in the
  // browser — Next.js strips non-NEXT_PUBLIC_ vars for security.
  // Only warn on the server where the key should actually be present.
  if (!SUPABASE_SERVICE_KEY) {
    if (typeof window === 'undefined') {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
    }
    return null;
  }
  if (_adminClient) return _adminClient;
  _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken:   false,
      persistSession:     false,
      detectSessionInUrl: false,
    },
  });
  return _adminClient;
}

export const supabaseAdmin = getSupabaseAdmin();