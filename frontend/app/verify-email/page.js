'use client';
// app/verify-email/page.js

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const ROLE_REDIRECT = {
  admin:    '/admin/orders',
  delivery: '/admin/delivery',
  accounts: '/admin/accounts',
  customer: '/',
};

// ── SVG helpers ───────────────────────────────────────────────────────────────
function DiyaSVG({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3C14 7 11 10 11 14.5C11 17.5 13.2 20 16 20C18.8 20 21 17.5 21 14.5C21 10 18 7 16 3Z" fill="url(#vFG)"/>
      <path d="M16 8C15 10.5 13.5 12.5 13.5 14.5C13.5 16.4 14.6 18 16 18C17.4 18 18.5 16.4 18.5 14.5C18.5 12.5 17 10.5 16 8Z" fill="url(#vIF)" opacity="0.7"/>
      <path d="M8 22C8 20.9 11.6 20 16 20C20.4 20 24 20.9 24 22L23 26C23 27.1 19.9 28 16 28C12.1 28 9 27.1 9 26L8 22Z" fill="url(#vBG)"/>
      <ellipse cx="16" cy="22" rx="8" ry="1.8" fill="url(#vRG)"/>
      <rect x="15.2" y="18.5" width="1.6" height="2.5" rx="0.8" fill="#92400e"/>
      <defs>
        <radialGradient id="vFG" cx="50%" cy="80%" r="60%">
          <stop offset="0%"   stopColor="#facc15"/>
          <stop offset="50%"  stopColor="#f97316"/>
          <stop offset="100%" stopColor="#dc2626"/>
        </radialGradient>
        <radialGradient id="vIF" cx="50%" cy="70%" r="50%">
          <stop offset="0%"   stopColor="#fef9c3"/>
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="vBG" x1="8" y1="20" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#b45309"/>
          <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
        <linearGradient id="vRG" x1="8" y1="22" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fcd34d" stopOpacity="0.3"/>
          <stop offset="50%"  stopColor="#fef3c7" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#fcd34d" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9"  x2="12"   y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

// ── Page component ────────────────────────────────────────────────────────────
export default function VerifyEmailPage() {
  const router = useRouter();

  const [pending,   setPending]   = useState(null);
  const [noSession, setNoSession] = useState(false);
  const [digits,    setDigits]    = useState(['', '', '', '']);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [resendCd,  setResendCd]  = useState(0);

  // ── Refs declared individually (Rules of Hooks) ───────────────────────────
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const refs = [ref0, ref1, ref2, ref3];

  // ── Read sessionStorage on mount ──────────────────────────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem('pending_otp');

    if (!raw) {
      // No pending OTP — check if already logged in and redirect silently
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const role = session.user.app_metadata?.role
            ?? session.user.user_metadata?.role
            ?? 'customer';
          router.replace(ROLE_REDIRECT[role] ?? '/');
        } else {
          setNoSession(true);
        }
      });
      return;
    }

    try {
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > 30 * 60 * 1000) {
        sessionStorage.removeItem('pending_otp');
        setNoSession(true);
        return;
      }
      setPending(data);
      setResendCd(60);
      setTimeout(() => refs[0].current?.focus(), 100);
    } catch {
      sessionStorage.removeItem('pending_otp');
      setNoSession(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resend countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setTimeout(() => setResendCd(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCd]);

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[idx]   = digit;
    setDigits(next);
    setError('');
    if (digit && idx < 3) refs[idx + 1].current?.focus();
    if (digit && idx === 3 && next.join('').length === 4) verify(next.join(''));
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0)
      refs[idx - 1].current?.focus();
  };

  const handlePaste = e => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (p.length === 4) { setDigits(p.split('')); setError(''); verify(p); }
  };

  // ── Verify OTP then auto-login ────────────────────────────────────────────
  const verify = async code => {
    if (!pending) return;
    setLoading(true);
    setError('');

    // 1. Verify OTP with server
    let res, data;
    try {
      res  = await fetch('/api/otp/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: pending.userId, otp: code }),
      });
      data = await res.json();
    } catch {
      setError('Network error. Please try again.');
      setDigits(['', '', '', '']);
      setLoading(false);
      setTimeout(() => refs[0].current?.focus(), 60);
      return;
    }

    if (!res.ok) {
      setError(data?.error || 'Incorrect code. Try again.');
      setDigits(['', '', '', '']);
      setLoading(false);
      setTimeout(() => refs[0].current?.focus(), 60);
      return;
    }

    // 2. OTP accepted — decode stored password and sign in automatically
    let password;
    try   { password = decodeURIComponent(escape(atob(pending.pwd))); }
    catch { password = atob(pending.pwd); }

    const { data: signInData, error: signInErr } =
      await supabase.auth.signInWithPassword({
        email:    pending.email,
        password,
      });

    // 3. Always clear sessionStorage regardless of outcome
    sessionStorage.removeItem('pending_otp');

    if (signInErr || !signInData?.user) {
      // OTP was valid but sign-in failed — send to login with a success flag
      router.replace('/login?verified=1');
      return;
    }

    // 4. Signed in — redirect to role-appropriate page
    const role = signInData.user.app_metadata?.role
      ?? signInData.user.user_metadata?.role
      ?? 'customer';

    setSuccess(true);
    setTimeout(() => router.replace(ROLE_REDIRECT[role] ?? '/'), 1200);
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const resend = async () => {
    if (resendCd > 0 || !pending) return;
    setError('');
    setDigits(['', '', '', '']);
    try {
      const res = await fetch('/api/otp/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: pending.userId, email: pending.email }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed.'); }
      setResendCd(60);
      setTimeout(() => refs[0].current?.focus(), 60);
    } catch (err) {
      setError(err.message);
    }
  };

  // ── RENDER: Loading spinner ───────────────────────────────────────────────
  if (!pending && !noSession) {
    return (
      <div style={{
        position:'fixed', inset:0, background:'#080d18',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          width:32, height:32,
          border:'3px solid rgba(250,204,21,0.2)',
          borderTopColor:'#facc15',
          borderRadius:'50%',
          animation:'spin 0.7s linear infinite',
        }}/>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── RENDER: Session expired ───────────────────────────────────────────────
  if (noSession) {
    return (
      <>
        <style>{`
          *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
          .ns-root {
            position:fixed; inset:0; background:#080d18;
            font-family:'DM Sans',-apple-system,sans-serif;
            display:flex; align-items:center; justify-content:center; padding:24px;
          }
          .ns-card {
            background:linear-gradient(160deg,#0e1e38 0%,#080d18 100%);
            border:1px solid #1a2d4a; border-radius:28px;
            padding:48px 36px; text-align:center; width:min(400px,100%);
          }
          .ns-top {
            height:3px;
            background:linear-gradient(90deg,transparent,#f59e0b 25%,#facc15 50%,#f59e0b 75%,transparent);
            border-radius:2px; margin-bottom:36px;
          }
          .ns-h2 { font-size:20px; font-weight:700; color:#f1f5f9; margin:16px 0 12px; }
          .ns-p  { font-size:13px; color:#475569; line-height:1.7; margin-bottom:28px; }
          .ns-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
          .ns-btn {
            padding:13px 28px; border-radius:13px; font-weight:800; font-size:14px;
            cursor:pointer; border:none; font-family:inherit; transition:opacity .2s;
          }
          .ns-btn:hover { opacity:.85; }
          .ns-btn.primary   { background:linear-gradient(135deg,#92400e,#facc15); color:#0f172a; }
          .ns-btn.secondary { background:rgba(250,204,21,0.08); color:#facc15; border:1px solid rgba(250,204,21,0.2); }
        `}</style>
        <div className="ns-root">
          <div className="ns-card">
            <div className="ns-top"/>
            <DiyaSVG size={48}/>
            <p className="ns-h2">Session expired</p>
            <p className="ns-p">
              This verification session has expired or was already used.<br/>
              Please register again or log in.
            </p>
            <div className="ns-btns">
              <button className="ns-btn primary"   onClick={() => router.push('/register')}>Register again</button>
              <button className="ns-btn secondary" onClick={() => router.push('/login')}>Log in</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── RENDER: Success overlay ───────────────────────────────────────────────
  if (success) {
    return (
      <>
        <style>{`
          *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          @keyframes pop    { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
          @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
          .sv-root  { position:fixed; inset:0; background:rgba(8,13,24,.96); display:flex; align-items:center; justify-content:center; animation:fadeIn .25s ease; }
          .sv-inner { text-align:center; animation:pop .35s cubic-bezier(.34,1.56,.64,1) both; }
          .sv-om    { font-size:88px; line-height:1; display:block; margin-bottom:16px; background:linear-gradient(135deg,#f59e0b,#facc15); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-family:serif; }
          .sv-title { font-size:26px; font-weight:700; color:#f1f5f9; margin-bottom:6px; }
          .sv-sub   { font-size:11px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#facc15; }
          .sv-dots  { display:flex; gap:7px; justify-content:center; margin-top:18px; }
          .sv-dot   { width:6px; height:6px; border-radius:50%; background:#facc15; animation:pulse 1s ease infinite; }
          .sv-dot:nth-child(2) { animation-delay:.15s; }
          .sv-dot:nth-child(3) { animation-delay:.3s;  }
        `}</style>
        <div className="sv-root">
          <div className="sv-inner">
            <span className="sv-om">ॐ</span>
            <p className="sv-title">Email Verified! 🙏</p>
            <p className="sv-sub">Redirecting…</p>
            <div className="sv-dots">
              <div className="sv-dot"/>
              <div className="sv-dot"/>
              <div className="sv-dot"/>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── RENDER: OTP entry UI ──────────────────────────────────────────────────
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#080d18; }
        @keyframes slide     { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
        @keyframes diyaPulse { 0%,100%{transform:scaleY(1) translateY(0)} 50%{transform:scaleY(1.1) translateY(-3px)} }
        @keyframes errIn     { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
        @keyframes spin      { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .vp-root  { position:fixed; inset:0; background:#080d18; font-family:'DM Sans',-apple-system,sans-serif; display:flex; align-items:center; justify-content:center; padding:24px; }
        .vp-glow  { position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse 70% 55% at 50% 110%,rgba(250,204,21,.07) 0%,transparent 65%); }
        .vp-card  { position:relative; z-index:10; width:min(420px,100%); background:linear-gradient(160deg,#0e1e38 0%,#080d18 100%); border:1px solid #1a2d4a; border-radius:28px; overflow:hidden; animation:slide .4s cubic-bezier(.16,1,.3,1) both; }
        .vp-topbar{ height:3px; background:linear-gradient(90deg,transparent,#f59e0b 25%,#facc15 50%,#f59e0b 75%,transparent); }
        .vp-body  { padding:40px 36px 44px; text-align:center; }
        @media(max-width:480px){ .vp-body{ padding:28px 20px 32px; } }
        .vp-diya  { display:flex; justify-content:center; margin-bottom:14px; animation:diyaPulse 2s ease-in-out infinite; }
        .vp-title { font-size:22px; font-weight:700; color:#f1f5f9; margin-bottom:8px; }
        .vp-sub   { font-size:13px; color:#475569; line-height:1.7; margin-bottom:28px; }
        .vp-email { color:#facc15; font-weight:700; }
        .vp-boxes { display:flex; gap:12px; justify-content:center; margin-bottom:10px; }
        .vp-box   { width:64px; height:72px; background:rgba(255,255,255,.03); border:2px solid #1e3550; border-radius:14px; font-size:30px; font-weight:800; color:#facc15; text-align:center; outline:none; caret-color:#facc15; transition:border-color .18s,box-shadow .18s,background .18s; }
        .vp-box:focus  { border-color:rgba(250,204,21,.6); box-shadow:0 0 0 3px rgba(250,204,21,.1); background:rgba(250,204,21,.03); }
        .vp-box.filled { border-color:rgba(250,204,21,.4); }
        @media(max-width:380px){ .vp-box{ width:54px; height:62px; font-size:24px; } }
        .vp-error { display:flex; align-items:center; gap:8px; justify-content:center; font-size:12px; font-weight:600; color:#f87171; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:10px; padding:9px 14px; margin:12px 0; animation:errIn .2s ease; }
        .vp-hint  { font-size:11px; color:#334155; margin:8px 0 20px; }
        .vp-btn   { width:100%; padding:14px; background:linear-gradient(135deg,#92400e 0%,#b45309 45%,#facc15 100%); color:#0f172a; border:none; border-radius:13px; font-size:15px; font-weight:800; font-family:inherit; cursor:pointer; transition:transform .12s,box-shadow .18s,opacity .18s; }
        .vp-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(250,204,21,.25); }
        .vp-btn:disabled { opacity:.55; cursor:not-allowed; }
        .vp-btn-in{ display:flex; align-items:center; justify-content:center; gap:9px; }
        .vp-spin  { width:16px; height:16px; border:2px solid rgba(15,23,42,.2); border-top-color:#0f172a; border-radius:50%; animation:spin .55s linear infinite; }
        .vp-resend{ margin-top:18px; font-size:13px; color:#475569; }
        .vp-resend button { background:none; border:none; cursor:pointer; font-weight:700; font-size:13px; font-family:inherit; }
        .vp-resend button:disabled { color:#334155; cursor:default; }
        .vp-back  { margin-top:12px; font-size:12px; color:#334155; }
        .vp-back button { background:none; border:none; cursor:pointer; color:#475569; font-family:inherit; font-size:12px; }
        .vp-back button:hover { color:#facc15; }
      `}</style>

      <div className="vp-root">
        <div className="vp-glow"/>
        <div className="vp-card">
          <div className="vp-topbar"/>
          <div className="vp-body">

            <div className="vp-diya"><DiyaSVG size={52}/></div>
            <h2 className="vp-title">Verify your email</h2>
            <p className="vp-sub">
              We sent a 4-digit code to<br/>
              <span className="vp-email">{pending?.email}</span>
            </p>

            <div className="vp-boxes" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  className={`vp-box${d ? ' filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                />
              ))}
            </div>

            {error && (
              <div className="vp-error"><WarnIcon/>{error}</div>
            )}

            <p className="vp-hint">Code expires in 10 minutes</p>

            <button
              className="vp-btn"
              disabled={digits.join('').length < 4 || loading}
              onClick={() => verify(digits.join(''))}
            >
              <span className="vp-btn-in">
                {loading
                  ? <><div className="vp-spin"/>Verifying…</>
                  : <>Verify &amp; Continue</>
                }
              </span>
            </button>

            <p className="vp-resend">
              Didn&apos;t receive it?&nbsp;
              <button
                onClick={resend}
                disabled={resendCd > 0}
                style={{
                  color:          resendCd > 0 ? '#334155' : '#facc15',
                  textDecoration: resendCd > 0 ? 'none'    : 'underline',
                }}
              >
                {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend code'}
              </button>
            </p>

            <p className="vp-back">
              <button onClick={() => router.push('/register')}>← Back to registration</button>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}