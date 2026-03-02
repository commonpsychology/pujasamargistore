'use client';

// app/login/page.js
// Sacred login page — matches puja website theme
// Username + password → redirects to role-specific dashboard

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────
// USER ACCOUNTS — add/remove users here
// Each user has a unique username, password, and a "redirect" path
// showing ONLY their relevant data section
// ─────────────────────────────────────────────────────────────
const USERS = [
  {
    username: 'pushkar',
    password: 'pandit2025',
    role: 'Admin',
    redirect: '/admin/orders',
    greeting: 'पण्डितजी, स्वागत छ',
  },
  {
    username: 'delivery',
    password: 'deliver123',
    role: 'Delivery',
    redirect: '/admin/delivery',
    greeting: 'Welcome, Delivery Partner',
  },
  {
    username: 'accounts',
    password: 'accounts123',
    role: 'Accounts',
    redirect: '/admin/accounts',
    greeting: 'Welcome, Accounts',
  },
];
// ─────────────────────────────────────────────────────────────

// Decorative Sanskrit/Devanagari symbols for the background
const SYMBOLS = ['ॐ', '卐', '☸', '🪔', '꧁', '꧂', '᳚', 'ॐ', '✦', '❋'];

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [shake, setShake]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null); // holds the matched user
  const [mounted, setMounted]   = useState(false);

  // Already logged in? Redirect
useEffect(() => {
  if (typeof window === 'undefined') return;
  const saved = sessionStorage.getItem('puja_user');
  if (saved) {
    try {
      const u = JSON.parse(saved);
      router.replace(u.redirect);
    } catch (_) {}
  }
}, [router]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    // Simulate a brief auth delay for UX feel
    await new Promise(r => setTimeout(r, 600));

    const match = USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() &&
           u.password === password
    );

    if (!match) {
      setLoading(false);
      setError('Invalid username or password. Please try again.');
      triggerShake();
      return;
    }

    // Save session
    sessionStorage.setItem('puja_user', JSON.stringify(match));
    setSuccess(match);

    // Short success pause then redirect
    await new Promise(r => setTimeout(r, 1200));
    router.push(match.redirect);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@400;500;600;800&family=Tiro+Devanagari+Sanskrit:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }

        :root {
          --gold:    #facc15;
          --gold2:   #fbbf24;
          --amber:   #f59e0b;
          --deep:    #080d18;
          --surface: #0c1525;
          --surface2:#0f1e35;
          --border:  #1a2d4a;
          --border2: #1e3550;
          --text:    #f1f5f9;
          --muted:   #4a6080;
          --muted2:  #64829a;
          --red:     #ef4444;
          --green:   #22c55e;
        }

        /* ── Animations ── */
        @keyframes floatUp {
          0%   { transform: translateY(0)   rotate(0deg);   opacity: 0.04; }
          50%  { opacity: 0.09; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%     { transform: translateX(-10px); }
          30%     { transform: translateX(10px); }
          45%     { transform: translateX(-8px); }
          60%     { transform: translateX(8px); }
          75%     { transform: translateX(-4px); }
          90%     { transform: translateX(4px); }
        }
        @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes glow   { 0%,100% { box-shadow: 0 0 20px rgba(250,204,21,0.1); } 50% { box-shadow: 0 0 40px rgba(250,204,21,0.25), 0 0 80px rgba(250,204,21,0.08); } }
        @keyframes diyas  { 0%,100% { transform: scaleY(1) translateY(0); opacity: 0.9; } 50% { transform: scaleY(1.15) translateY(-2px); opacity: 1; } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes successPop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

        /* ── Page ── */
        .login-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--deep);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          animation: fadeIn 0.4s ease;
        }

        /* ── Floating symbols background ── */
        .bg-symbols {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .bg-sym {
          position: absolute;
          font-size: 28px;
          color: var(--gold);
          animation: floatUp linear infinite;
          user-select: none;
        }

        /* ── Radial glow ── */
        .bg-glow {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(250,204,21,0.05) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 50% 0%,   rgba(245,158,11,0.03) 0%, transparent 60%);
        }

        /* ── Mandala ring ── */
        .mandala-ring {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.04);
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          animation: spinSlow 60s linear infinite;
          pointer-events: none;
        }
        .mandala-ring::before {
          content: '';
          position: absolute; inset: 20px;
          border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.03);
        }
        .mandala-ring::after {
          content: '';
          position: absolute; inset: 50px;
          border-radius: 50%;
          border: 1px dashed rgba(250,204,21,0.03);
        }

        /* ── Card ── */
        .login-card {
          position: relative; z-index: 10;
          background: linear-gradient(160deg, #0e1e38 0%, #080d18 100%);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 0;
          width: 100%; max-width: 440px;
          overflow: hidden;
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
          transition: transform 0.15s;
        }
        .login-card.shake { animation: shake 0.55s ease; }

        /* Top gold stripe */
        .card-topbar {
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, var(--amber) 30%, var(--gold) 50%, var(--amber) 70%, transparent 100%);
        }

        .card-inner { padding: 40px 40px 44px; }
        @media (max-width: 480px) { .card-inner { padding: 32px 24px 36px; } }

        /* ── Brand section ── */
        .brand { text-align: center; margin-bottom: 36px; }

        .diya-row {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; margin-bottom: 16px;
        }
        .diya {
          font-size: 22px;
          animation: diyas 2s ease-in-out infinite;
          display: inline-block;
        }
        .diya:nth-child(1) { animation-delay: 0s;    font-size: 18px; opacity: 0.6; }
        .diya:nth-child(2) { animation-delay: 0.15s; font-size: 26px; }
        .diya:nth-child(3) { animation-delay: 0.3s;  font-size: 18px; opacity: 0.6; }

        .om-symbol {
          font-family: 'Tiro Devanagari Sanskrit', serif;
          font-size: 44px; line-height: 1;
          background: linear-gradient(135deg, var(--amber), var(--gold), var(--amber));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block; margin-bottom: 10px;
          filter: drop-shadow(0 2px 12px rgba(250,204,21,0.3));
        }

        .brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600;
          color: var(--text); line-height: 1.2; margin-bottom: 4px;
        }
        .brand-name span { color: var(--gold); font-style: italic; }
        .brand-sub {
          font-size: 11px; font-weight: 600; letter-spacing: 3px;
          text-transform: uppercase; color: var(--muted);
        }

        /* ── Divider ── */
        .divider {
          display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
        }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 10px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: var(--muted); }

        /* ── Form ── */
        .field { margin-bottom: 16px; }
        .field-label {
          font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--muted2);
          display: block; margin-bottom: 7px;
        }
        .field-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 15px; pointer-events: none; opacity: 0.5;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border2);
          border-radius: 12px;
          padding: 13px 14px 13px 42px;
          color: var(--text);
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          letter-spacing: 0.3px;
        }
        .field-input::placeholder { color: #273d58; }
        .field-input:focus {
          border-color: rgba(250,204,21,0.35);
          background: rgba(250,204,21,0.02);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.06);
        }
        .field-input.pwd { padding-right: 44px; letter-spacing: 2px; }
        .field-input.pwd::placeholder { letter-spacing: 0.3px; }
        .toggle-pwd {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--muted); font-size: 15px; padding: 4px;
          transition: color 0.2s; line-height: 1;
        }
        .toggle-pwd:hover { color: var(--muted2); }

        /* ── Error ── */
        .error-box {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 16px;
          font-size: 12px; font-weight: 600; color: #f87171;
          animation: slideUp 0.25s ease;
        }

        /* ── Submit button ── */
        .login-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #92400e 0%, #b45309 40%, #facc15 100%);
          color: #0f172a;
          border: none; border-radius: 14px;
          font-size: 15px; font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; margin-top: 8px;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          position: relative; overflow: hidden;
          letter-spacing: 0.3px;
        }
        .login-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .login-btn:hover::before { transform: translateX(100%); }
        .login-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(250,204,21,0.3);
        }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner-sm {
          width: 16px; height: 16px;
          border: 2px solid rgba(15,23,42,0.3);
          border-top-color: #0f172a;
          border-radius: 50%;
          animation: spinSlow 0.6s linear infinite;
        }

        /* ── Footer note ── */
        .login-footer {
          text-align: center; margin-top: 24px;
          font-size: 11px; color: var(--muted);
          line-height: 1.6;
        }
        .login-footer strong { color: #334155; }

        /* ── Success overlay ── */
        .success-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(8,13,24,0.92);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }
        .success-inner {
          text-align: center;
          animation: successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .success-om {
          font-family: 'Tiro Devanagari Sanskrit', serif;
          font-size: 80px; line-height: 1;
          background: linear-gradient(135deg, var(--amber), var(--gold));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block; margin-bottom: 16px;
          filter: drop-shadow(0 4px 20px rgba(250,204,21,0.5));
          animation: diyas 1.5s ease-in-out infinite;
        }
        .success-greeting {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600; color: var(--text);
          margin-bottom: 6px;
        }
        .success-role {
          font-size: 11px; font-weight: 800; letter-spacing: 3px;
          text-transform: uppercase; color: var(--gold);
        }
        .success-dots { display: flex; gap: 6px; justify-content: center; margin-top: 20px; }
        .dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
          animation: pulse 1s ease infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* ── Floating symbols ── */}
      <div className="bg-symbols">
        {mounted && SYMBOLS.map((sym, i) => (
          <span
            key={i}
            className="bg-sym"
            style={{
              left:            `${(i * 11 + 5) % 95}%`,
              bottom:          `-${20 + (i * 7) % 40}px`,
              animationDuration:`${12 + (i * 3.7) % 16}s`,
              animationDelay:  `${(i * 2.1) % 8}s`,
              fontSize:        `${18 + (i * 5) % 24}px`,
              opacity:         0.04 + (i % 4) * 0.01,
            }}
          >
            {sym}
          </span>
        ))}
      </div>

      <div className="bg-glow" />
      <div className="mandala-ring" />

      {/* ── Success overlay ── */}
      {success && (
        <div className="success-overlay">
          <div className="success-inner">
            <span className="success-om">ॐ</span>
            <p className="success-greeting">{success.greeting}</p>
            <p className="success-role">{success.role} Dashboard</p>
            <div className="success-dots">
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
          </div>
        </div>
      )}

      {/* ── Login card ── */}
      <div className={`login-card${shake ? ' shake' : ''}`}>
        <div className="card-topbar" />
        <div className="card-inner">

          {/* Brand */}
          <div className="brand">
            <div className="diya-row">
              <span className="diya">🪔</span>
              <span className="diya">🪔</span>
              <span className="diya">🪔</span>
            </div>
            <span className="om-symbol">ॐ</span>
            <p className="brand-name">
              पण्डित <span>पुष्कर राज</span> न्यौपाने
            </p>
            <p className="brand-sub">Puja Samagri · Thimi, Bhaktapur</p>
          </div>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">Staff Login</span>
            <div className="divider-line" />
          </div>

          {/* Username */}
          <div className="field">
            <label className="field-label">Username</label>
            <div className="field-wrap">
              <span className="field-icon">👤</span>
              <input
                className="field-input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <label className="field-label">Password</label>
            <div className="field-wrap">
              <span className="field-icon">🔑</span>
              <input
                className={`field-input pwd`}
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="current-password"
              />
              <button className="toggle-pwd" onClick={() => setShowPwd(s => !s)} tabIndex={-1}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading || !!success}
          >
            <span className="btn-inner">
              {loading
                ? <><div className="spinner-sm" /> Verifying…</>
                : <>🪔 Enter Dashboard</>}
            </span>
          </button>

          {/* Footer */}
          <p className="login-footer">
            Access is restricted to authorised staff only.<br />
            <strong>Each account shows only your relevant section.</strong>
          </p>

        </div>
      </div>
    </>
  );
}