// src/lib/supabaseClient.js
//
// THE ONLY REAL FIX FOR:
//   AbortError: Lock broken by another request with the 'steal' option
//
// Root cause (confirmed in supabase-js issues #1594, #2013, #2111):
//   Supabase auth-js wraps EVERY auth operation (signIn, signOut, getSession,
//   setSession, token refresh) in an internal _acquireLock() call that uses
//   the browser's Web Locks API (navigator.locks). When two Supabase client
//   instances exist — which Turbopack/HMR causes by re-evaluating modules —
//   the second instance calls navigator.locks.request() with { steal: true },
//   which forcibly aborts the first instance's in-flight lock, throwing:
//     AbortError: Lock broken by another request with the 'steal' option
//
//   flowType:'implicit', custom storage, and globalThis singletons do NOT fix
//   this because _acquireLock() is called AFTER storage is read, inside the
//   auth operation itself. The lock is always acquired regardless of flowType.
//
// THE FIX — noOpLock:
//   Supabase exposes an undocumented `auth.lock` option that replaces the
//   entire locking implementation. Passing a no-op function means:
//   - No navigator.locks calls ever happen
//   - No locks to steal, no AbortError, ever
//   - Auth operations run directly without queuing
//   This is safe for single-tab email/password apps (which is what this is).
//   The lock only matters for multi-tab OAuth flows.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Replaces navigator.locks entirely — just runs the function directly
const noOpLock = (_name, _timeout, fn) => fn();

let _client = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server: fresh client, no lock needed
    return createClient(SUPABASE_URL, SUPABASE_ANON);
  }

  if (_client) return _client;

  _client = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      lock:               noOpLock, // ← THE fix. disables Web Locks completely.
      persistSession:     true,
      detectSessionInUrl: false,
      flowType:           'implicit',
      storageKey:         'puja-auth',
      autoRefreshToken:   true,
      debug:              false,
    },
  });

  return _client;
}

export const supabase = getSupabaseClient();