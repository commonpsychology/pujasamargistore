'use client';
// app/admin-login/page.js
//
// Uses the staff table in Supabase (via /api/admin/login).
// Does NOT depend on AuthContext or any Supabase auth flow.
// Stores session in sessionStorage so it clears when tab is closed.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [shake,    setShake]    = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [checked,  setChecked]  = useState(false);

  // Check if already logged in
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('admin_staff');
      if (stored) {
        const staff = JSON.parse(stored);
        if (staff?.id) {
          router.replace('/admin/orders');
          return;
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked(true);
  }, [router]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async () => {
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password) {
      setError('Enter your staff email and password.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        triggerShake();
        setLoading(false);
        return;
      }

      // Store staff session
      sessionStorage.setItem('admin_staff', JSON.stringify(data.staff));
      setSuccess(true);

      // Redirect based on role
      const redirects = {
        admin:    '/admin/orders',
        delivery: '/admin/delivery',
        accounts: '/admin/accounts',
      };
      setTimeout(() => {
        router.replace(redirects[data.staff.role] ?? '/admin/orders');
      }, 800);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Network error. Please try again.');
      triggerShake();
      setLoading(false);
    }
  };

  if (!checked) return null;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .al-root {
          position:fixed; inset:0; background:#04080f;
          font-family:'DM Sans',-apple-system,sans-serif;
          display:flex; align-items:center; justify-content:center; overflow:hidden;
        }
        .al-glow {
          position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 65% 50% at 50% 110%, rgba(239,68,68,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 80% 40% at 50% -5%,  rgba(245,158,11,0.05) 0%, transparent 60%);
        }
        .al-grid {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(250,204,21,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,204,21,0.02) 1px, transparent 1px);
          background-size:48px 48px;
        }
        .al-wrap {
          position:relative; z-index:10;
          width:min(420px, calc(100vw - 32px));
        }
        .al-card {
          background:linear-gradient(160deg,#0d1b2e 0%,#04080f 100%);
          border:1px solid #1e2d45; border-radius:24px; overflow:hidden;
          animation:alSlide 0.4s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow:0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.05);
        }
        .al-card.shake { animation:alShake 0.55s ease; }
        @keyframes alSlide { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes alShake {
          0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 35%{transform:translateX(8px)}
          55%{transform:translateX(-5px)} 75%{transform:translateX(5px)} 90%{transform:translateX(-2px)}
        }
        .al-topbar { height:3px; background:linear-gradient(90deg,transparent,#dc2626 20%,#f59e0b 50%,#dc2626 80%,transparent); }
        .al-body { padding:34px 36px 40px; }
        @media(max-width:480px){ .al-body{padding:24px 20px 30px;} }

        .al-brand { text-align:center; margin-bottom:24px; }
        .al-icon  { font-size:44px; display:block; margin-bottom:10px; animation:alPulse 2.5s ease-in-out infinite; }
        @keyframes alPulse { 0%,100%{opacity:0.85;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        .al-title { font-size:21px; font-weight:800; color:#f1f5f9; margin-bottom:3px; }
        .al-sub   { font-size:10px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#334155; }

        .al-restricted {
          display:flex; align-items:center; justify-content:center; gap:8px;
          padding:10px 14px; margin-bottom:20px;
          background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); border-radius:10px;
        }
        .al-restricted span { font-size:11px; font-weight:700; color:#f87171; letter-spacing:0.5px; }

        .al-divider { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .al-divline { flex:1; height:1px; background:#1a2d4a; }
        .al-divtext { font-size:10px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:#334155; }

        .al-field { margin-bottom:13px; }
        .al-label { display:block; margin-bottom:5px; font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#4a6080; }
        .al-wrap-input { position:relative; }
        .al-ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; opacity:0.35; }
        .al-input {
          width:100%; background:rgba(255,255,255,0.03); border:1px solid #1e3550;
          border-radius:11px; padding:12px 13px 12px 40px; color:#f1f5f9;
          font-size:14px; font-family:inherit; outline:none;
          transition:border-color 0.18s, box-shadow 0.18s;
        }
        .al-input::placeholder { color:#1e3550; }
        .al-input:focus { border-color:rgba(239,68,68,0.4); box-shadow:0 0 0 3px rgba(239,68,68,0.07); }
        .al-input.pwd { padding-right:44px; }
        .al-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#334155; font-size:14px; padding:3px; }
        .al-eye:hover { color:#64748b; }

        .al-error {
          display:flex; align-items:center; gap:9px;
          background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25);
          border-radius:10px; padding:10px 14px; margin-bottom:13px;
          font-size:12px; font-weight:600; color:#f87171;
          animation:alErrIn 0.2s ease;
        }
        @keyframes alErrIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }

        .al-btn {
          width:100%; padding:14px;
          background:linear-gradient(135deg,#7f1d1d 0%,#dc2626 50%,#f59e0b 100%);
          color:#fff; border:none; border-radius:13px;
          font-size:15px; font-weight:800; font-family:inherit;
          cursor:pointer; margin-top:4px;
          transition:transform 0.12s, box-shadow 0.18s, opacity 0.18s;
          position:relative; overflow:hidden;
        }
        .al-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);
          transform:translateX(-100%); transition:transform 0.4s ease;
        }
        .al-btn:not(:disabled):hover::after { transform:translateX(100%); }
        .al-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(220,38,38,0.3); }
        .al-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .al-btn-inner { display:flex; align-items:center; justify-content:center; gap:9px; position:relative; z-index:1; }
        .al-spin { width:16px; height:16px; border:2px solid rgba(255,255,255,0.25); border-top-color:#fff; border-radius:50%; animation:alSpin 0.6s linear infinite; }
        @keyframes alSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        .al-footer { text-align:center; margin-top:16px; font-size:11px; color:#334155; }
        .al-footer a { color:#475569; text-decoration:none; }
        .al-footer a:hover { color:#facc15; }

        .al-success {
          position:fixed; inset:0; z-index:300;
          background:rgba(4,8,15,0.96); backdrop-filter:blur(12px);
          display:flex; align-items:center; justify-content:center;
          animation:alFade 0.25s ease;
        }
        @keyframes alFade { from{opacity:0} to{opacity:1} }
        .al-success-inner { text-align:center; animation:alPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes alPop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
        .al-success-icon  { font-size:70px; display:block; margin-bottom:14px; }
        .al-success-title { font-size:24px; font-weight:800; color:#f1f5f9; margin-bottom:5px; }
        .al-success-sub   { font-size:11px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#f59e0b; }
        .al-dots { display:flex; gap:6px; justify-content:center; margin-top:16px; }
        .al-dot  { width:6px; height:6px; border-radius:50%; background:#f59e0b; animation:alDotPulse 1s ease infinite; }
        .al-dot:nth-child(2){animation-delay:0.15s} .al-dot:nth-child(3){animation-delay:0.3s}
        @keyframes alDotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div className="al-root">
        <div className="al-glow" />
        <div className="al-grid" />

        {success && (
          <div className="al-success">
            <div className="al-success-inner">
              <span className="al-success-icon">⚙️</span>
              <p className="al-success-title">Access Granted</p>
              <p className="al-success-sub">Loading dashboard…</p>
              <div className="al-dots">
                <div className="al-dot"/><div className="al-dot"/><div className="al-dot"/>
              </div>
            </div>
          </div>
        )}

        <div className="al-wrap">
          <div className={`al-card${shake ? ' shake' : ''}`}>
            <div className="al-topbar" />
            <div className="al-body">

              <div className="al-brand">
                <span className="al-icon">🔐</span>
                <p className="al-title">Staff Portal</p>
                <p className="al-sub">पूजा सामग्री · Admin</p>
              </div>

              <div className="al-restricted">
                <span>🛡️</span>
                <span>Authorised Staff Only</span>
              </div>

              <div className="al-divider">
                <div className="al-divline"/>
                <span className="al-divtext">Sign In</span>
                <div className="al-divline"/>
              </div>

              <div className="al-field">
                <label className="al-label">Staff Email</label>
                <div className="al-wrap-input">
                  <span className="al-ico">✉️</span>
                  <input
                    className="al-input"
                    type="email"
                    placeholder="staff@pujasamagri.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="al-field">
                <label className="al-label">Password</label>
                <div className="al-wrap-input">
                  <span className="al-ico">🔑</span>
                  <input
                    className={`al-input pwd`}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoComplete="current-password"
                  />
                  <button className="al-eye" onClick={() => setShowPwd(s => !s)} tabIndex={-1}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="al-error">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <button className="al-btn" onClick={handleLogin} disabled={loading || success}>
                <span className="al-btn-inner">
                  {loading
                    ? <><div className="al-spin"/> Verifying…</>
                    : <>🔐 &nbsp;Enter Dashboard</>}
                </span>
              </button>

              <p className="al-footer">
                Not staff? <Link href="/">Back to home →</Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}