'use client';
// app/(auth)/login/page.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const SYMBOLS = ['ॐ', '☸', '✦', '❋', '᳚', '✦', '☸', 'ॐ', '✦', '❋'];
const ROLE_REDIRECT = { admin:'/admin/orders', delivery:'/admin/delivery', accounts:'/admin/accounts', customer:'/' };
function getRedirect(r) { return ROLE_REDIRECT[r] ?? '/'; }

function DiyaSVG({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3C14 7 11 10 11 14.5C11 17.5 13.2 20 16 20C18.8 20 21 17.5 21 14.5C21 10 18 7 16 3Z" fill="url(#lFG)"/>
      <path d="M16 8C15 10.5 13.5 12.5 13.5 14.5C13.5 16.4 14.6 18 16 18C17.4 18 18.5 16.4 18.5 14.5C18.5 12.5 17 10.5 16 8Z" fill="url(#lIF)" opacity="0.7"/>
      <path d="M8 22C8 20.9 11.6 20 16 20C20.4 20 24 20.9 24 22L23 26C23 27.1 19.9 28 16 28C12.1 28 9 27.1 9 26L8 22Z" fill="url(#lBG)"/>
      <ellipse cx="16" cy="22" rx="8" ry="1.8" fill="url(#lRG)"/>
      <rect x="15.2" y="18.5" width="1.6" height="2.5" rx="0.8" fill="#92400e"/>
      <defs>
        <radialGradient id="lFG" cx="50%" cy="80%" r="60%"><stop offset="0%" stopColor="#facc15"/><stop offset="50%" stopColor="#f97316"/><stop offset="100%" stopColor="#dc2626"/></radialGradient>
        <radialGradient id="lIF" cx="50%" cy="70%" r="50%"><stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fde68a" stopOpacity="0"/></radialGradient>
        <linearGradient id="lBG" x1="8" y1="20" x2="24" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#b45309"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
        <linearGradient id="lRG" x1="8" y1="22" x2="24" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#fcd34d" stopOpacity="0.3"/><stop offset="50%" stopColor="#fef3c7" stopOpacity="0.8"/><stop offset="100%" stopColor="#fcd34d" stopOpacity="0.3"/></linearGradient>
      </defs>
    </svg>
  );
}
function WarnIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
}
function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, supabase, user, quickRole, sessionChecked } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [error,      setError]      = useState('');
  const [shake,      setShake]      = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [pendingOtp, setPendingOtp] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── FIX: Always clear any stale pending_otp when landing on login page.
  // This is what caused "session expired" to show after a successful login —
  // the old pending_otp key was still sitting in sessionStorage.
  useEffect(() => {
    sessionStorage.removeItem('pending_otp');
  }, []);

  // Redirect already logged-in users (but not mid-OTP-flow)
  useEffect(() => {
    if (sessionChecked && user && !pendingOtp && !success) {
      router.replace(getRedirect(quickRole ?? 'customer'));
    }
  }, [sessionChecked, user, quickRole, router, pendingOtp, success]);

  // Show "your email was verified" hint if coming from /verify-email
  const [justVerified, setJustVerified] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('verified') === '1') {
      setJustVerified(true);
    }
  }, []);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 650); };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your username / email and password.');
      triggerShake();
      return;
    }
    setLoading(true);
    setError('');

    const isEmail = identifier.includes('@');
    const { data, error: authErr } = await signIn(
      isEmail ? { email: identifier.trim(), password } : { username: identifier.trim(), password }
    );

    if (authErr) {
      setLoading(false);
      setError(authErr.message === 'Invalid login credentials'
        ? 'Wrong username or password. Please try again.'
        : authErr.message || 'Sign in failed.');
      triggerShake();
      return;
    }

    const userId    = data?.user?.id;
    const userEmail = data?.user?.email;

    // ── Check email_verified ──────────────────────────────────────────────
    // Only unverified users (first-time login without completing OTP) hit this path.
    // Once email_verified = true it stays true forever — no OTP on future logins.
    const { data: prof } = await supabase
      .from('users')
      .select('email_verified')
      .eq('id', userId)
      .single();

    if (!prof?.email_verified) {
      // Block redirect during signOut
      setPendingOtp(true);
      await supabase.auth.signOut();

      // Save state for /verify-email page
      sessionStorage.setItem('pending_otp', JSON.stringify({
        userId,
        email:  userEmail,
        pwd:    btoa(unescape(encodeURIComponent(password))),
        ts:     Date.now(),
      }));

      // Send OTP
      try {
        const res = await fetch('/api/otp/send', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ userId, email: userEmail }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to send OTP.'); }
      } catch (err) {
        sessionStorage.removeItem('pending_otp');
        setError(err.message);
        setPendingOtp(false);
        setLoading(false);
        triggerShake();
        return;
      }

      router.push('/verify-email');
      return;
    }

    // ── Verified user — normal login ──────────────────────────────────────
    // FIX: Clear any stale pending_otp just in case
    sessionStorage.removeItem('pending_otp');

    setSuccess(true);
    const role = data?.user?.app_metadata?.role ?? data?.user?.user_metadata?.role ?? 'customer';
    setTimeout(() => router.replace(getRedirect(role)), 800);
  };

  if (!sessionChecked) return null;

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .lp-root{position:fixed;inset:0;background:#080d18;font-family:'DM Sans',-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;overflow:hidden;}
    .lp-glow{position:absolute;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse 70% 55% at 50% 110%,rgba(250,204,21,.07) 0%,transparent 65%);}
    .lp-sym-wrap{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1;}
    .lp-sym{position:absolute;color:#facc15;user-select:none;animation:lpFloat linear infinite;font-family:serif;}
    @keyframes lpFloat{0%{opacity:0;transform:translateY(0) rotate(0)}10%{opacity:.06}90%{opacity:.06}100%{opacity:0;transform:translateY(-105vh) rotate(380deg)}}
    .lp-ring{position:absolute;width:580px;height:580px;border-radius:50%;border:1px solid rgba(250,204,21,.035);left:50%;top:50%;animation:lpSpin 70s linear infinite;pointer-events:none;z-index:1;transform:translate(-50%,-50%);}
    @keyframes lpSpin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
    .lp-card-wrap{position:relative;z-index:10;width:min(460px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow-y:auto;}
    .lp-card-wrap::-webkit-scrollbar{display:none;}
    .lp-card{background:linear-gradient(160deg,#0e1e38 0%,#080d18 100%);border:1px solid #1a2d4a;border-radius:28px;overflow:hidden;animation:lpUp .45s cubic-bezier(.16,1,.3,1) both;}
    .lp-card.shake{animation:lpShake .55s ease;}
    @keyframes lpUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
    @keyframes lpShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-9px)}35%{transform:translateX(9px)}55%{transform:translateX(-6px)}75%{transform:translateX(6px)}90%{transform:translateX(-2px)}}
    .lp-topbar{height:3px;background:linear-gradient(90deg,transparent,#f59e0b 25%,#facc15 50%,#f59e0b 75%,transparent);}
    .lp-body{padding:36px 40px 42px;}
    @media(max-width:500px){.lp-body{padding:26px 22px 32px;}}
    .lp-brand{text-align:center;margin-bottom:28px;}
    .lp-diyas{display:flex;justify-content:center;align-items:flex-end;gap:14px;margin-bottom:10px;}
    .lp-diya{display:inline-block;animation:lpDiya 2s ease-in-out infinite;}
    .lp-diya:nth-child(1){opacity:.55}.lp-diya:nth-child(2){animation-delay:.18s}.lp-diya:nth-child(3){opacity:.55;animation-delay:.36s}
    @keyframes lpDiya{0%,100%{transform:scaleY(1) translateY(0)}50%{transform:scaleY(1.12) translateY(-3px)}}
    .lp-om{font-size:50px;line-height:1;display:block;margin-bottom:10px;background:linear-gradient(135deg,#f59e0b,#facc15,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 14px rgba(250,204,21,.3));font-family:serif;}
    .lp-name{font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:4px;}
    .lp-name em{color:#facc15;font-style:italic;}
    .lp-sub2{font-size:10px;font-weight:800;letter-spacing:3.5px;text-transform:uppercase;color:#334155;}
    .lp-divider{display:flex;align-items:center;gap:12px;margin-bottom:22px;}
    .lp-divline{flex:1;height:1px;background:#1a2d4a;}
    .lp-divtext{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#334155;}
    .lp-verified{display:flex;align-items:center;gap:8px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12px;font-weight:600;color:#4ade80;}
    .lp-field{margin-bottom:14px;}
    .lp-label{display:block;margin-bottom:6px;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#4a6080;}
    .lp-iw{position:relative;}
    .lp-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);pointer-events:none;display:flex;align-items:center;}
    .lp-input{width:100%;background:rgba(255,255,255,.03);border:1px solid #1e3550;border-radius:12px;padding:13px 13px 13px 40px;color:#f1f5f9;font-size:14px;font-family:inherit;outline:none;transition:border-color .18s,box-shadow .18s;}
    .lp-input::placeholder{color:#1e3550;}
    .lp-input:focus{border-color:rgba(250,204,21,.4);box-shadow:0 0 0 3px rgba(250,204,21,.07);}
    .lp-input.pw{padding-right:44px;}
    .lp-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#334155;padding:4px;display:flex;align-items:center;}
    .lp-eye:hover{color:#64748b;}
    .lp-hint{font-size:10px;color:#273d58;margin-top:5px;padding-left:2px;}
    .lp-err{display:flex;align-items:center;gap:9px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.22);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12px;font-weight:600;color:#f87171;animation:errIn .2s ease;}
    @keyframes errIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
    .lp-btn{width:100%;padding:14px;background:linear-gradient(135deg,#92400e 0%,#b45309 45%,#facc15 100%);color:#0f172a;border:none;border-radius:13px;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;margin-top:4px;transition:transform .12s,box-shadow .18s,opacity .18s;position:relative;overflow:hidden;}
    .lp-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(250,204,21,.25);}
    .lp-btn:disabled{opacity:.65;cursor:not-allowed;}
    .lp-btn-in{display:flex;align-items:center;justify-content:center;gap:9px;position:relative;z-index:1;}
    .lp-spin{width:16px;height:16px;border:2px solid rgba(15,23,42,.2);border-top-color:#0f172a;border-radius:50%;animation:spin .55s linear infinite;flex-shrink:0;}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    .lp-reg{margin-top:14px;padding:12px 16px;background:rgba(250,204,21,.04);border:1px solid rgba(250,204,21,.1);border-radius:12px;text-align:center;}
    .lp-reg p{font-size:12px;color:#4a6080;}
    .lp-reg a{color:#facc15;font-weight:700;text-decoration:none;}
    .lp-reg a:hover{text-decoration:underline;}
    .lp-foot{text-align:center;margin-top:14px;font-size:11px;color:#334155;line-height:1.7;}
    .lp-foot a{color:#475569;text-decoration:none;}
    .lp-foot a:hover{color:#facc15;}
    .lp-success{position:fixed;inset:0;z-index:300;background:rgba(8,13,24,.95);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;animation:fadeIn .25s ease;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .lp-succ-in{text-align:center;animation:pop .35s cubic-bezier(.34,1.56,.64,1) both;}
    @keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.07)}100%{transform:scale(1);opacity:1}}
    .lp-succ-om{font-size:88px;line-height:1;display:block;margin-bottom:16px;background:linear-gradient(135deg,#f59e0b,#facc15);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:serif;}
    .lp-succ-title{font-size:26px;font-weight:700;color:#f1f5f9;margin-bottom:6px;}
    .lp-succ-sub{font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#facc15;}
    .lp-dots{display:flex;gap:7px;justify-content:center;margin-top:18px;}
    .lp-dot{width:6px;height:6px;border-radius:50%;background:#facc15;animation:pulse 1s ease infinite;}
    .lp-dot:nth-child(2){animation-delay:.15s}.lp-dot:nth-child(3){animation-delay:.3s}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="lp-root">
        <div className="lp-glow"/>
        <div className="lp-ring"/>
        <div className="lp-sym-wrap">
          {mounted && SYMBOLS.map((s,i)=>(
            <span key={i} className="lp-sym" style={{left:`${(i*10+4)%94}%`,bottom:'-40px',animationDuration:`${14+(i*3.3)%14}s`,animationDelay:`${(i*1.9)%9}s`,fontSize:`${16+(i*6)%22}px`}}>{s}</span>
          ))}
        </div>
        {success && (
          <div className="lp-success">
            <div className="lp-succ-in">
              <span className="lp-succ-om">ॐ</span>
              <p className="lp-succ-title">नमस्ते 🙏</p>
              <p className="lp-succ-sub">Redirecting…</p>
              <div className="lp-dots"><div className="lp-dot"/><div className="lp-dot"/><div className="lp-dot"/></div>
            </div>
          </div>
        )}
        <div className="lp-card-wrap">
          <div className={`lp-card${shake?' shake':''}`}>
            <div className="lp-topbar"/>
            <div className="lp-body">
              <div className="lp-brand">
                <div className="lp-diyas">
                  <span className="lp-diya"><DiyaSVG size={20}/></span>
                  <span className="lp-diya"><DiyaSVG size={32}/></span>
                  <span className="lp-diya"><DiyaSVG size={20}/></span>
                </div>
                <span className="lp-om">ॐ</span>
                <p className="lp-name">पण्डित <em>पुष्कर राज</em> न्यौपाने</p>
                <p className="lp-sub2">Puja Samagri · Thimi, Bhaktapur</p>
              </div>
              <div className="lp-divider"><div className="lp-divline"/><span className="lp-divtext">Sign In</span><div className="lp-divline"/></div>

              {/* Green banner when coming back from /verify-email */}
              {justVerified && (
                <div className="lp-verified">
                  <span>✓</span> Email verified! You can now sign in.
                </div>
              )}

              <div className="lp-field">
                <label className="lp-label">Username or Email</label>
                <div className="lp-iw">
                  <span className="lp-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                  <input className="lp-input" type="text" placeholder="username or email@example.com" value={identifier} onChange={e=>{setIdentifier(e.target.value);setError('');}} onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoComplete="username" autoFocus/>
                </div>
              </div>
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className="lp-iw">
                  <span className="lp-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg></span>
                  <input className="lp-input pw" type={showPwd?'text':'password'} placeholder="Enter your password" value={password} onChange={e=>{setPassword(e.target.value);setError('');}} onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoComplete="current-password"/>
                  <button className="lp-eye" onClick={()=>setShowPwd(s=>!s)} tabIndex={-1}><EyeIcon open={showPwd}/></button>
                </div>
                <p className="lp-hint">Use your username (e.g. ram123) or full email</p>
              </div>
              {error && <div className="lp-err"><WarnIcon/><span>{error}</span></div>}
              <button className="lp-btn" onClick={handleLogin} disabled={loading||success}>
                <span className="lp-btn-in">
                  {loading ? <><div className="lp-spin"/>Signing in…</> : <><span style={{display:'inline-flex',alignItems:'center'}}><DiyaSVG size={18}/></span>Sign In</>}
                </span>
              </button>
              <div className="lp-reg"><p>New customer? <a href="/register">Create a free account</a></p></div>
              <p className="lp-foot"><a href="/forgot-password">Forgot password?</a>&nbsp;·&nbsp;<span style={{color:'#1e293b'}}>Staff use assigned credentials</span></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}