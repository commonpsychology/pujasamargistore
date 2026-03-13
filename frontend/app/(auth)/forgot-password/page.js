'use client';
// app/forgot-password/page.js
// Step 1 — user enters their email. Supabase sends a reset link.
// The link redirects to /forgot-password/reset?type=recovery&...

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';const SYMBOLS = ['ॐ', '☸', '🪔', '✦', '❋', '᳚'];

export default function ForgotPasswordPage() {
  const router  = useRouter();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [shake,   setShake]   = useState(false);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email address.');
      triggerShake(); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      triggerShake(); return;
    }

    setLoading(true);
    setError('');

    const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, {
      // After clicking the link in the email, Supabase redirects here.
      // Add this exact URL to: Supabase → Authentication → URL Configuration → Redirect URLs
      redirectTo: `${window.location.origin}/forgot-password/reset`,
    });

    if (err) {
      setLoading(false);
      setError(err.message || 'Something went wrong. Please try again.');
      triggerShake(); return;
    }

    // Success — go to confirmation screen, pass email for display
    router.replace(`/forgot-password/sent?email=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .fp-root {
          position: fixed; inset: 0;
          background: #080d18;
          font-family: 'DM Sans', -apple-system, sans-serif;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .fp-glow {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 65% 50% at 50% 110%, rgba(250,204,21,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 80% 35% at 50% -5%,  rgba(245,158,11,0.04) 0%, transparent 60%);
        }
        .fp-symbols { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .fp-sym {
          position: absolute; color: #facc15; user-select: none;
          animation: fpFloat linear infinite;
        }
        @keyframes fpFloat {
          0%  { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.055; }
          90% { opacity: 0.055; }
          100%{ transform: translateY(-105vh) rotate(360deg); opacity: 0; }
        }
        .fp-ring {
          position: absolute; width: 560px; height: 560px; border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.03);
          left: 50%; top: 50%; transform: translate(-50%,-50%);
          animation: fpSpin 80s linear infinite; pointer-events: none;
        }
        @keyframes fpSpin { from{transform:translate(-50%,-50%) rotate(0)} to{transform:translate(-50%,-50%) rotate(360deg)} }

        .fp-wrap {
          position: relative; z-index: 10;
          width: min(440px, calc(100vw - 32px));
        }
        .fp-card {
          background: linear-gradient(160deg, #0e1e38 0%, #080d18 100%);
          border: 1px solid #1a2d4a; border-radius: 26px; overflow: hidden;
          animation: fpSlide 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .fp-card.shake { animation: fpShake 0.55s ease; }
        @keyframes fpSlide { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes fpShake {
          0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)}
          35%{transform:translateX(8px)}   55%{transform:translateX(-5px)}
          75%{transform:translateX(5px)}   90%{transform:translateX(-2px)}
        }
        .fp-topbar { height: 3px; background: linear-gradient(90deg,transparent,#f59e0b 25%,#facc15 50%,#f59e0b 75%,transparent); }
        .fp-body { padding: 36px 38px 42px; }
        @media(max-width:480px){ .fp-body{padding:26px 22px 32px;} }

        /* Brand */
        .fp-brand { text-align: center; margin-bottom: 28px; }
        .fp-icon { font-size: 48px; display: block; margin-bottom: 10px; animation: fpDiya 2s ease-in-out infinite; }
        @keyframes fpDiya { 0%,100%{transform:scaleY(1) translateY(0)} 50%{transform:scaleY(1.2) translateY(-3px)} }
        .fp-title { font-size: 22px; font-weight: 800; color: #f1f5f9; margin-bottom: 4px; }
        .fp-subtitle { font-size: 13px; color: #475569; line-height: 1.6; }

        .fp-divider { display:flex; align-items:center; gap:12px; margin-bottom:22px; }
        .fp-divline { flex:1; height:1px; background:#1a2d4a; }
        .fp-divtext { font-size:10px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:#334155; }

        .fp-field { margin-bottom: 16px; }
        .fp-label { display:block; margin-bottom:6px; font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#4a6080; }
        .fp-input-wrap { position:relative; }
        .fp-ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; opacity:0.4; }
        .fp-input {
          width:100%; background:rgba(255,255,255,0.03); border:1px solid #1e3550;
          border-radius:12px; padding:13px 13px 13px 40px;
          color:#f1f5f9; font-size:14px; font-family:inherit;
          outline:none; transition:border-color 0.18s, box-shadow 0.18s;
        }
        .fp-input::placeholder { color:#1e3550; }
        .fp-input:focus { border-color:rgba(250,204,21,0.4); box-shadow:0 0 0 3px rgba(250,204,21,0.07); }

        .fp-error {
          display:flex; align-items:center; gap:9px;
          background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.22);
          border-radius:10px; padding:10px 14px; margin-bottom:14px;
          font-size:12px; font-weight:600; color:#f87171;
          animation: fpErrIn 0.2s ease;
        }
        @keyframes fpErrIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }

        .fp-btn {
          width:100%; padding:14px;
          background:linear-gradient(135deg,#92400e 0%,#b45309 45%,#facc15 100%);
          color:#0f172a; border:none; border-radius:13px;
          font-size:15px; font-weight:800; font-family:inherit;
          cursor:pointer;
          transition:transform 0.12s, box-shadow 0.18s, opacity 0.18s;
          position:relative; overflow:hidden;
        }
        .fp-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
          transform:translateX(-100%); transition:transform 0.4s ease;
        }
        .fp-btn:not(:disabled):hover::after { transform:translateX(100%); }
        .fp-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(250,204,21,0.22); }
        .fp-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .fp-btn-inner { display:flex; align-items:center; justify-content:center; gap:9px; position:relative; z-index:1; }
        .fp-spin { width:16px; height:16px; border:2px solid rgba(15,23,42,0.25); border-top-color:#0f172a; border-radius:50%; animation:fpSpin 0.55s linear infinite; }

        .fp-back { text-align:center; margin-top:16px; font-size:12px; color:#334155; }
        .fp-back a { color:#facc15; font-weight:700; text-decoration:none; }
        .fp-back a:hover { text-decoration:underline; }

        .fp-note {
          margin-top:14px; padding:12px 14px;
          background:rgba(250,204,21,0.04); border:1px solid rgba(250,204,21,0.1);
          border-radius:10px; font-size:11px; color:#475569; line-height:1.7;
          text-align:center;
        }
      `}</style>

      <div className="fp-root">
        <div className="fp-glow" />
        <div className="fp-ring" />
        <div className="fp-symbols">
          {mounted && SYMBOLS.map((sym, i) => (
            <span key={i} className="fp-sym" style={{
              left:             `${(i * 17 + 5) % 92}%`,
              bottom:           '-40px',
              animationDuration:`${15 + (i * 4) % 12}s`,
              animationDelay:   `${(i * 2.3) % 8}s`,
              fontSize:         `${16 + (i * 7) % 20}px`,
            }}>{sym}</span>
          ))}
        </div>

        <div className="fp-wrap">
          <div className={`fp-card${shake ? ' shake' : ''}`}>
            <div className="fp-topbar" />
            <div className="fp-body">

              <div className="fp-brand">
                <span className="fp-icon">🔓</span>
                <p className="fp-title">Forgot Password?</p>
                <p className="fp-subtitle">
                  Enter your email and we&apos;ll send you<br />a secure reset link.
                </p>
              </div>

              <div className="fp-divider">
                <div className="fp-divline"/><span className="fp-divtext">Reset Link</span><div className="fp-divline"/>
              </div>

              <div className="fp-field">
                <label className="fp-label">Email Address</label>
                <div className="fp-input-wrap">
                  <span className="fp-ico">✉️</span>
                  <input
                    className="fp-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {error && <div className="fp-error"><span>⚠️</span><span>{error}</span></div>}

              <button className="fp-btn" onClick={handleSubmit} disabled={loading}>
                <span className="fp-btn-inner">
                  {loading
                    ? <><div className="fp-spin"/> Sending…</>
                    : <>📨 &nbsp;Send Reset Link</>
                  }
                </span>
              </button>

              <p className="fp-note">
                Check your spam folder if you don&apos;t see the email within a few minutes.
              </p>

              <p className="fp-back">
                <Link href="/login">← Back to Sign In</Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}