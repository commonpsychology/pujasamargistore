'use client';
// app/forgot-password/reset/page.js
//
// Step 3 — user lands here after clicking the email link.
// Supabase appends a one-time token to the URL as a hash fragment.
// The onAuthStateChange listener fires a PASSWORD_RECOVERY event,
// which we catch to confirm the token is valid before showing the form.
//
// URL pattern from Supabase:
//   /forgot-password/reset#access_token=...&type=recovery
//
// Flow:
//   WAITING  → checking for PASSWORD_RECOVERY event (spinner)
//   READY    → show new password form
//   SUCCESS  → password updated, redirect to login
//   EXPIRED  → token invalid/expired, show error + retry link

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0–5
}

function StrengthBar({ pw }) {
  const s = getStrength(pw);
  const colors = ['#ef4444','#f97316','#eab308','#22c55e','#4ade80'];
  const labels = ['Too short','Weak','Fair','Good','Strong'];
  if (!pw) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= s ? colors[s - 1] : '#1a2d4a',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>
      <p style={{ fontSize: 10, color: s >= 1 ? colors[s - 1] : '#334155', fontWeight: 700 }}>
        {pw ? labels[s - 1] ?? 'Very strong' : ''}
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [stage,    setStage]    = useState('waiting'); // waiting | ready | success | expired
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCo,   setShowCo]   = useState(false);
  const [error,    setError]    = useState('');
  const [shake,    setShake]    = useState(false);
  const [loading,  setLoading]  = useState(false);

  // Listen for Supabase PASSWORD_RECOVERY event — fires when the token in
  // the URL hash is valid. If it never fires (bad/expired token), show error.
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Token didn't resolve after 5 s — treat as expired/invalid
      setStage(s => s === 'waiting' ? 'expired' : s);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          clearTimeout(timeout);
          setStage('ready');
        }
        // If already signed in via the recovery token, also mark ready
        if (event === 'SIGNED_IN' && session) {
          clearTimeout(timeout);
          setStage(s => s === 'waiting' ? 'ready' : s);
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleReset = async () => {
    setError('');

    if (password.length < MIN_PW_LENGTH) {
      setError(`Password must be at least ${MIN_PW_LENGTH} characters.`);
      triggerShake(); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      triggerShake(); return;
    }
    if (getStrength(password) < 2) {
      setError('Password is too weak. Add uppercase letters, numbers, or symbols.');
      triggerShake(); return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setLoading(false);
      setError(err.message || 'Could not update password. The link may have expired.');
      triggerShake(); return;
    }

    // Sign out so the user logs in fresh with their new password
    await supabase.auth.signOut();
    setStage('success');

    // Redirect to login after 3 s
    setTimeout(() => router.replace('/login'), 3000);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        .fpr-root {
          position:fixed; inset:0; background:#080d18;
          font-family:'DM Sans',-apple-system,sans-serif;
          display:flex; align-items:center; justify-content:center;
          overflow:hidden;
        }
        .fpr-glow {
          position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 65% 50% at 50% 110%, rgba(250,204,21,0.06) 0%, transparent 65%);
        }
        .fpr-wrap {
          position:relative; z-index:10;
          width:min(440px, calc(100vw - 32px));
          animation: fprSlide 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes fprSlide { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }

        .fpr-card {
          background:linear-gradient(160deg,#0e1e38 0%,#080d18 100%);
          border:1px solid #1a2d4a; border-radius:26px; overflow:hidden;
        }
        .fpr-card.shake { animation: fprShake 0.55s ease; }
        @keyframes fprShake {
          0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)}
          35%{transform:translateX(8px)}   55%{transform:translateX(-5px)}
          75%{transform:translateX(5px)}   90%{transform:translateX(-2px)}
        }
        .fpr-topbar { height:3px; }
        .fpr-topbar.gold   { background:linear-gradient(90deg,transparent,#f59e0b 25%,#facc15 50%,#f59e0b 75%,transparent); }
        .fpr-topbar.green  { background:linear-gradient(90deg,transparent,#4ade80 25%,#86efac 50%,#4ade80 75%,transparent); }
        .fpr-topbar.red    { background:linear-gradient(90deg,transparent,#f87171 25%,#fca5a5 50%,#f87171 75%,transparent); }
        .fpr-body { padding:38px 38px 44px; }
        @media(max-width:480px){ .fpr-body{padding:28px 22px 34px;} }

        /* Icon */
        .fpr-icon-wrap { text-align:center; margin-bottom:22px; }
        .fpr-icon { font-size:48px; display:block; margin-bottom:10px; animation:fprBounce 2s ease-in-out infinite; }
        @keyframes fprBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .fpr-title    { font-size:22px; font-weight:800; color:#f1f5f9; margin-bottom:5px; text-align:center; }
        .fpr-subtitle { font-size:13px; color:#475569; text-align:center; line-height:1.6; }

        /* Waiting spinner */
        .fpr-spinner-wrap { display:flex; flex-direction:column; align-items:center; gap:16px; padding:16px 0; }
        .fpr-spinner {
          width:32px; height:32px;
          border:3px solid rgba(250,204,21,0.12); border-top-color:#facc15;
          border-radius:50%; animation:fprSpin 0.7s linear infinite;
        }
        @keyframes fprSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .fpr-spinner-text { font-size:13px; color:#475569; }

        .fpr-divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
        .fpr-divline { flex:1; height:1px; background:#1a2d4a; }
        .fpr-divtext { font-size:10px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:#334155; }

        .fpr-field { margin-bottom:14px; }
        .fpr-label { display:block; margin-bottom:6px; font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#4a6080; }
        .fpr-input-wrap { position:relative; }
        .fpr-ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; opacity:0.4; }
        .fpr-input {
          width:100%; background:rgba(255,255,255,0.03); border:1px solid #1e3550;
          border-radius:12px; padding:13px 42px 13px 40px;
          color:#f1f5f9; font-size:14px; font-family:inherit;
          outline:none; transition:border-color 0.18s, box-shadow 0.18s;
        }
        .fpr-input::placeholder { color:#1e3550; }
        .fpr-input:focus { border-color:rgba(250,204,21,0.4); box-shadow:0 0 0 3px rgba(250,204,21,0.07); }
        .fpr-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#334155; font-size:14px; padding:3px; transition:color 0.2s; }
        .fpr-eye:hover { color:#64748b; }

        .fpr-error {
          display:flex; align-items:center; gap:9px;
          background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.22);
          border-radius:10px; padding:10px 14px; margin-bottom:14px;
          font-size:12px; font-weight:600; color:#f87171;
          animation: fprErrIn 0.2s ease;
        }
        @keyframes fprErrIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }

        .fpr-req { margin-bottom:16px; }
        .fpr-req-title { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#334155; margin-bottom:8px; }
        .fpr-req-list { display:flex; flex-direction:column; gap:5px; }
        .fpr-req-item { display:flex; align-items:center; gap:8px; font-size:11px; color:#475569; }
        .fpr-req-dot  { width:6px; height:6px; border-radius:50%; background:#1a2d4a; flex-shrink:0; transition:background 0.2s; }
        .fpr-req-dot.met { background:#4ade80; }

        .fpr-btn {
          width:100%; padding:14px;
          background:linear-gradient(135deg,#92400e 0%,#b45309 45%,#facc15 100%);
          color:#0f172a; border:none; border-radius:13px;
          font-size:15px; font-weight:800; font-family:inherit;
          cursor:pointer; margin-top:4px;
          transition:transform 0.12s, box-shadow 0.18s, opacity 0.18s;
          position:relative; overflow:hidden;
        }
        .fpr-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(250,204,21,0.22); }
        .fpr-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .fpr-btn-inner { display:flex; align-items:center; justify-content:center; gap:9px; position:relative; z-index:1; }
        .fpr-spin-sm { width:16px; height:16px; border:2px solid rgba(15,23,42,0.25); border-top-color:#0f172a; border-radius:50%; animation:fprSpin 0.55s linear infinite; }

        /* Success */
        .fpr-success-inner { text-align:center; padding:16px 0; }
        .fpr-success-icon  { font-size:60px; display:block; margin-bottom:16px; animation:fprBounce 1.5s ease-in-out infinite; }
        .fpr-success-title { font-size:22px; font-weight:800; color:#f1f5f9; margin-bottom:8px; }
        .fpr-success-sub   { font-size:13px; color:#64748b; line-height:1.7; margin-bottom:16px; }
        .fpr-success-redirect { font-size:11px; color:#334155; }
        .fpr-dots { display:flex; gap:6px; justify-content:center; margin-top:12px; }
        .fpr-dot  { width:6px; height:6px; border-radius:50%; background:#4ade80; animation:fprDotPulse 1s ease infinite; }
        .fpr-dot:nth-child(2){animation-delay:0.15s} .fpr-dot:nth-child(3){animation-delay:0.3s}
        @keyframes fprDotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* Expired */
        .fpr-expired-inner { text-align:center; padding:16px 0; }
        .fpr-expired-icon  { font-size:52px; display:block; margin-bottom:14px; }
        .fpr-expired-title { font-size:20px; font-weight:800; color:#f87171; margin-bottom:8px; }
        .fpr-expired-sub   { font-size:13px; color:#64748b; line-height:1.7; margin-bottom:20px; }
        .fpr-expired-btn {
          display:inline-block; padding:13px 28px;
          background:rgba(250,204,21,0.08); border:1px solid rgba(250,204,21,0.2);
          border-radius:12px; color:#facc15; font-size:14px; font-weight:700;
          text-decoration:none; transition:all 0.18s;
        }
        .fpr-expired-btn:hover { background:rgba(250,204,21,0.14); }
        .fpr-back-link { margin-top:14px; font-size:12px; color:#334155; }
        .fpr-back-link a { color:#475569; font-weight:700; text-decoration:none; }
        .fpr-back-link a:hover { color:#facc15; }
      `}</style>

      <div className="fpr-root">
        <div className="fpr-glow" />

        <div className="fpr-wrap">
          <div className={`fpr-card${shake ? ' shake' : ''}`}>

            {/* ── WAITING — checking token ── */}
            {stage === 'waiting' && (
              <>
                <div className="fpr-topbar gold" />
                <div className="fpr-body">
                  <div className="fpr-icon-wrap">
                    <span className="fpr-icon">🔑</span>
                    <p className="fpr-title">Verifying Link</p>
                    <p className="fpr-subtitle">Checking your reset token…</p>
                  </div>
                  <div className="fpr-spinner-wrap">
                    <div className="fpr-spinner" />
                    <p className="fpr-spinner-text">Please wait a moment</p>
                  </div>
                </div>
              </>
            )}

            {/* ── READY — show new password form ── */}
            {stage === 'ready' && (
              <>
                <div className="fpr-topbar gold" />
                <div className="fpr-body">
                  <div className="fpr-icon-wrap">
                    <span className="fpr-icon">🔐</span>
                    <p className="fpr-title">Set New Password</p>
                    <p className="fpr-subtitle">Choose a strong password for your account.</p>
                  </div>

                  <div className="fpr-divider">
                    <div className="fpr-divline"/><span className="fpr-divtext">New Password</span><div className="fpr-divline"/>
                  </div>

                  <div className="fpr-field">
                    <label className="fpr-label">New Password</label>
                    <div className="fpr-input-wrap">
                      <span className="fpr-ico">🔑</span>
                      <input
                        className="fpr-input"
                        type={showPw ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleReset()}
                        autoFocus
                      />
                      <button className="fpr-eye" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                        {showPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <StrengthBar pw={password} />
                  </div>

                  <div className="fpr-field">
                    <label className="fpr-label">Confirm Password</label>
                    <div className="fpr-input-wrap">
                      <span className="fpr-ico">🔒</span>
                      <input
                        className="fpr-input"
                        type={showCo ? 'text' : 'password'}
                        placeholder="Repeat your new password"
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleReset()}
                      />
                      <button className="fpr-eye" onClick={() => setShowCo(s => !s)} tabIndex={-1}>
                        {showCo ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {confirm && (
                      <p style={{ fontSize:11, marginTop:5, fontWeight:700, color: password === confirm ? '#4ade80' : '#f87171' }}>
                        {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>

                  {/* Requirements checklist */}
                  <div className="fpr-req">
                    <p className="fpr-req-title">Requirements</p>
                    <div className="fpr-req-list">
                      {[
                        ['At least 8 characters',        password.length >= 8],
                        ['At least one uppercase letter', /[A-Z]/.test(password)],
                        ['At least one number',           /[0-9]/.test(password)],
                      ].map(([label, met]) => (
                        <div key={label} className="fpr-req-item">
                          <div className={`fpr-req-dot${met ? ' met' : ''}`} />
                          <span style={{ color: met ? '#4ade80' : '#475569' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && <div className="fpr-error"><span>⚠️</span><span>{error}</span></div>}

                  <button className="fpr-btn" onClick={handleReset} disabled={loading}>
                    <span className="fpr-btn-inner">
                      {loading ? <><div className="fpr-spin-sm"/> Saving…</> : <>🔐 &nbsp;Update Password</>}
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* ── SUCCESS ── */}
            {stage === 'success' && (
              <>
                <div className="fpr-topbar green" />
                <div className="fpr-body">
                  <div className="fpr-success-inner">
                    <span className="fpr-success-icon">✅</span>
                    <p className="fpr-success-title">Password Updated!</p>
                    <p className="fpr-success-sub">
                      Your password has been changed successfully.<br />
                      You can now sign in with your new password.
                    </p>
                    <p className="fpr-success-redirect">Redirecting to login…</p>
                    <div className="fpr-dots">
                      <div className="fpr-dot"/><div className="fpr-dot"/><div className="fpr-dot"/>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── EXPIRED / INVALID ── */}
            {stage === 'expired' && (
              <>
                <div className="fpr-topbar red" />
                <div className="fpr-body">
                  <div className="fpr-expired-inner">
                    <span className="fpr-expired-icon">⏰</span>
                    <p className="fpr-expired-title">Link Expired</p>
                    <p className="fpr-expired-sub">
                      This password reset link has expired or is invalid.<br />
                      Reset links are only valid for <strong style={{color:'#94a3b8'}}>1 hour</strong>.
                    </p>
                    <Link href="/forgot-password" className="fpr-expired-btn">
                      📨 Request a New Link
                    </Link>
                    <p className="fpr-back-link">
                      or <Link href="/login">go back to login</Link>
                    </p>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}