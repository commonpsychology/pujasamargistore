'use client';
// app/login/page.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';

const SYMBOLS = ['ॐ', '☸', '🪔', '✦', '❋', 'ॐ', '᳚', '✦', '🪔', '☸'];

const ROLE_REDIRECT = {
  admin:    '/admin/orders',
  delivery: '/admin/delivery',
  accounts: '/admin/accounts',
  customer: '/',
};

// Redirect as soon as we have a user — use quickRole from JWT metadata
// so we don't wait for the profile DB row to load.
// Falls back to '/' if role is unknown (safe default).
function getRedirect(role) {
  return ROLE_REDIRECT[role] ?? '/';
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, quickRole, sessionChecked } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [error,      setError]      = useState('');
  const [shake,      setShake]      = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [mounted,    setMounted]    = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Redirect as soon as user is set — don't wait for profile row
  useEffect(() => {
    if (sessionChecked && user) {
      router.replace(getRedirect(quickRole));
    }
  }, [sessionChecked, user, quickRole, router]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 650);
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your username / email and password.');
      triggerShake();
      return;
    }
    setLoading(true);
    setError('');

    const isEmail = identifier.includes('@');
    const { error: authErr } = await signIn(
      isEmail
        ? { email: identifier.trim(), password }
        : { username: identifier.trim(), password }
    );

    if (authErr) {
      setLoading(false);
      setError(
        authErr.message === 'Invalid login credentials'
          ? 'Wrong username or password. Please try again.'
          : authErr.message || 'Sign in failed. Please try again.'
      );
      triggerShake();
      return;
    }

    // Auth succeeded — show success state immediately.
    // The useEffect above will fire and redirect as soon as
    // the auth state listener updates `user`.
    setSuccess(true);
  };

  // Don't render form until we know if user is already logged in
  if (!sessionChecked) return null;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          position: fixed; inset: 0;
          background: #080d18;
          font-family: 'DM Sans', -apple-system, sans-serif;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; z-index: 0;
        }
        .lp-glow {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background:
            radial-gradient(ellipse 70% 55% at 50% 110%, rgba(250,204,21,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 90% 40% at 50% -10%,  rgba(245,158,11,0.04) 0%, transparent 60%);
        }
        .lp-symbols { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
        .lp-sym { position: absolute; color: #facc15; user-select: none; animation: lpFloat linear infinite; }
        @keyframes lpFloat {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.06; }
          90%  { opacity: 0.06; }
          100% { transform: translateY(-105vh) rotate(380deg); opacity: 0; }
        }
        .lp-ring {
          position: absolute; width: 580px; height: 580px; border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.035);
          left: 50%; top: 50%;
          animation: lpRingSpin 70s linear infinite; pointer-events: none; z-index: 1;
          transform: translate(-50%,-50%);
        }
        .lp-ring::before { content:''; position:absolute; inset:28px; border-radius:50%; border:1px solid rgba(250,204,21,0.025); }
        .lp-ring::after  { content:''; position:absolute; inset:66px; border-radius:50%; border:1px dashed rgba(250,204,21,0.018); }
        @keyframes lpRingSpin { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }

        .lp-card-wrap {
          position: relative; z-index: 10;
          width: min(460px, calc(100vw - 32px));
          max-height: calc(100vh - 32px); overflow-y: auto;
        }
        .lp-card-wrap::-webkit-scrollbar { display: none; }
        .lp-card {
          background: linear-gradient(160deg, #0e1e38 0%, #080d18 100%);
          border: 1px solid #1a2d4a; border-radius: 28px; overflow: hidden;
          animation: lpSlideUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        .lp-card.shake { animation: lpShake 0.55s ease; }
        @keyframes lpSlideUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes lpShake {
          0%,100%{transform:translateX(0)} 15%{transform:translateX(-9px)}
          35%{transform:translateX(9px)}   55%{transform:translateX(-6px)}
          75%{transform:translateX(6px)}   90%{transform:translateX(-2px)}
        }
        .lp-topbar { height:3px; background:linear-gradient(90deg,transparent,#f59e0b 25%,#facc15 50%,#f59e0b 75%,transparent); }
        .lp-body { padding: 36px 40px 42px; }
        @media(max-width:500px){ .lp-body{padding:26px 22px 32px;} }

        /* Brand */
        .lp-brand { text-align:center; margin-bottom:28px; }
        .lp-diyas { display:flex; justify-content:center; align-items:flex-end; gap:14px; margin-bottom:10px; }
        .lp-diya  { display:inline-block; animation:lpDiya 2s ease-in-out infinite; }
        .lp-diya:nth-child(1){ font-size:18px; opacity:0.55; animation-delay:0s; }
        .lp-diya:nth-child(2){ font-size:30px; animation-delay:0.18s; }
        .lp-diya:nth-child(3){ font-size:18px; opacity:0.55; animation-delay:0.36s; }
        @keyframes lpDiya { 0%,100%{transform:scaleY(1) translateY(0)} 50%{transform:scaleY(1.22) translateY(-3px)} }
        .lp-om {
          font-size:50px; line-height:1; display:block; margin-bottom:10px;
          background:linear-gradient(135deg,#f59e0b,#facc15,#f59e0b);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          filter:drop-shadow(0 0 14px rgba(250,204,21,0.3));
        }
        .lp-brand-name { font-size:22px; font-weight:700; color:#f1f5f9; margin-bottom:4px; letter-spacing:-0.3px; }
        .lp-brand-name em { color:#facc15; font-style:italic; }
        .lp-brand-sub { font-size:10px; font-weight:800; letter-spacing:3.5px; text-transform:uppercase; color:#334155; }

        .lp-divider { display:flex; align-items:center; gap:12px; margin-bottom:22px; }
        .lp-divline { flex:1; height:1px; background:#1a2d4a; }
        .lp-divtext { font-size:10px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:#334155; }

        .lp-field { margin-bottom:14px; }
        .lp-label { display:block; margin-bottom:6px; font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#4a6080; }
        .lp-wrap  { position:relative; }
        .lp-ico   { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; opacity:0.4; }
        .lp-input {
          width:100%; background:rgba(255,255,255,0.03); border:1px solid #1e3550;
          border-radius:12px; padding:13px 13px 13px 40px;
          color:#f1f5f9; font-size:14px; font-family:inherit;
          outline:none; transition:border-color 0.18s, box-shadow 0.18s;
        }
        .lp-input::placeholder { color:#1e3550; }
        .lp-input:focus { border-color:rgba(250,204,21,0.4); box-shadow:0 0 0 3px rgba(250,204,21,0.07); }
        .lp-input.pwd { padding-right:44px; }
        .lp-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#334155; font-size:14px; padding:3px; transition:color 0.2s; }
        .lp-eye:hover { color:#64748b; }
        .lp-hint { font-size:10px; color:#273d58; margin-top:5px; padding-left:2px; }

        .lp-error {
          display:flex; align-items:center; gap:9px;
          background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.22);
          border-radius:10px; padding:10px 14px; margin-bottom:14px;
          font-size:12px; font-weight:600; color:#f87171;
          animation:lpErrIn 0.2s ease;
        }
        @keyframes lpErrIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }

        .lp-btn {
          width:100%; padding:14px;
          background:linear-gradient(135deg,#92400e 0%,#b45309 45%,#facc15 100%);
          color:#0f172a; border:none; border-radius:13px;
          font-size:15px; font-weight:800; font-family:inherit;
          cursor:pointer; margin-top:4px;
          transition:transform 0.12s, box-shadow 0.18s, opacity 0.18s;
          position:relative; overflow:hidden;
        }
        .lp-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
          transform:translateX(-100%); transition:transform 0.4s ease;
        }
        .lp-btn:not(:disabled):hover::after { transform:translateX(100%); }
        .lp-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(250,204,21,0.25); }
        .lp-btn:disabled { opacity:0.65; cursor:not-allowed; }
        .lp-btn-inner { display:flex; align-items:center; justify-content:center; gap:9px; position:relative; z-index:1; }
        .lp-spin { width:16px; height:16px; border:2px solid rgba(15,23,42,0.2); border-top-color:#0f172a; border-radius:50%; animation:lpRingSpin 0.55s linear infinite; }

        .lp-register { margin-top:14px; padding:12px 16px; background:rgba(250,204,21,0.04); border:1px solid rgba(250,204,21,0.1); border-radius:12px; text-align:center; }
        .lp-register p { font-size:12px; color:#4a6080; }
        .lp-register a { color:#facc15; font-weight:700; text-decoration:none; }
        .lp-register a:hover { text-decoration:underline; }
        .lp-footer { text-align:center; margin-top:14px; font-size:11px; color:#334155; line-height:1.7; }
        .lp-footer a { color:#475569; text-decoration:none; }
        .lp-footer a:hover { color:#facc15; }

        /* Success */
        .lp-success { position:fixed; inset:0; z-index:300; background:rgba(8,13,24,0.95); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; animation:lpFadeIn 0.25s ease; }
        @keyframes lpFadeIn { from{opacity:0} to{opacity:1} }
        .lp-success-inner { text-align:center; animation:lpPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes lpPop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
        .lp-success-om { font-size:88px; line-height:1; display:block; margin-bottom:16px; background:linear-gradient(135deg,#f59e0b,#facc15); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; filter:drop-shadow(0 4px 20px rgba(250,204,21,0.5)); animation:lpDiya 1.4s ease-in-out infinite; }
        .lp-success-title { font-size:26px; font-weight:700; color:#f1f5f9; margin-bottom:6px; }
        .lp-success-sub   { font-size:11px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#facc15; }
        .lp-dots { display:flex; gap:7px; justify-content:center; margin-top:18px; }
        .lp-dot  { width:6px; height:6px; border-radius:50%; background:#facc15; animation:lpPulse 1s ease infinite; }
        .lp-dot:nth-child(2){animation-delay:0.15s} .lp-dot:nth-child(3){animation-delay:0.3s}
        @keyframes lpPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div className="lp-root">
        <div className="lp-glow" />
        <div className="lp-ring" />
        <div className="lp-symbols">
          {mounted && SYMBOLS.map((sym, i) => (
            <span key={i} className="lp-sym" style={{
              left:             `${(i * 10 + 4) % 94}%`,
              bottom:           `-40px`,
              animationDuration:`${14 + (i * 3.3) % 14}s`,
              animationDelay:   `${(i * 1.9) % 9}s`,
              fontSize:         `${16 + (i * 6) % 22}px`,
            }}>{sym}</span>
          ))}
        </div>

        {success && (
          <div className="lp-success">
            <div className="lp-success-inner">
              <span className="lp-success-om">ॐ</span>
              <p className="lp-success-title">नमस्ते 🙏</p>
              <p className="lp-success-sub">Redirecting…</p>
              <div className="lp-dots">
                <div className="lp-dot"/><div className="lp-dot"/><div className="lp-dot"/>
              </div>
            </div>
          </div>
        )}

        <div className="lp-card-wrap">
          <div className={`lp-card${shake ? ' shake' : ''}`}>
            <div className="lp-topbar" />
            <div className="lp-body">

              <div className="lp-brand">
                <div className="lp-diyas">
                  <span className="lp-diya">🪔</span>
                  <span className="lp-diya">🪔</span>
                  <span className="lp-diya">🪔</span>
                </div>
                <span className="lp-om">ॐ</span>
                <p className="lp-brand-name">पण्डित <em>पुष्कर राज</em> न्यौपाने</p>
                <p className="lp-brand-sub">Puja Samagri · Thimi, Bhaktapur</p>
              </div>

              <div className="lp-divider">
                <div className="lp-divline"/><span className="lp-divtext">Sign In</span><div className="lp-divline"/>
              </div>

              <div className="lp-field">
                <label className="lp-label">Username or Email</label>
                <div className="lp-wrap">
                  <span className="lp-ico">👤</span>
                  <input
                    className="lp-input" type="text"
                    placeholder="username or email@example.com"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoComplete="username" autoFocus
                  />
                </div>
              </div>

              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className="lp-wrap">
                  <span className="lp-ico">🔑</span>
                  <input
                    className="lp-input pwd"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoComplete="current-password"
                  />
                  <button className="lp-eye" onClick={() => setShowPwd(s => !s)} tabIndex={-1}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="lp-hint">Use your username (e.g. ram123) or full email</p>
              </div>

              {error && <div className="lp-error"><span>⚠️</span><span>{error}</span></div>}

              <button className="lp-btn" onClick={handleLogin} disabled={loading || success}>
                <span className="lp-btn-inner">
                  {loading ? <><div className="lp-spin"/> Signing in…</> : <>🪔 &nbsp;Sign In</>}
                </span>
              </button>

              <div className="lp-register">
                <p>New customer? <a href="/register">Create a free account</a></p>
              </div>
              <p className="lp-footer">
                <a href="/forgot-password">Forgot password?</a>
                &nbsp;·&nbsp;
                <span style={{color:'#1e293b'}}>Staff use assigned credentials</span>
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}