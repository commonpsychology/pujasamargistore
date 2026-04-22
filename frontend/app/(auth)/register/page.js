'use client';
// app/register/page.js
// KEY FIX: After signup, saves pending verification to sessionStorage
// then navigates to /verify-email — a dedicated page immune to auth state changes.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const SYMBOLS = ['ॐ', '✦', '☸', '❋', '᳚', '✦', '☸', 'ॐ', '✦', '❋'];

function WarnIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
}
function DiyaSVG({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3C14 7 11 10 11 14.5C11 17.5 13.2 20 16 20C18.8 20 21 17.5 21 14.5C21 10 18 7 16 3Z" fill="url(#dFG3)"/>
      <path d="M16 8C15 10.5 13.5 12.5 13.5 14.5C13.5 16.4 14.6 18 16 18C17.4 18 18.5 16.4 18.5 14.5C18.5 12.5 17 10.5 16 8Z" fill="url(#dIF3)" opacity="0.7"/>
      <path d="M8 22C8 20.9 11.6 20 16 20C20.4 20 24 20.9 24 22L23 26C23 27.1 19.9 28 16 28C12.1 28 9 27.1 9 26L8 22Z" fill="url(#dBG3)"/>
      <ellipse cx="16" cy="22" rx="8" ry="1.8" fill="url(#dRG3)"/>
      <rect x="15.2" y="18.5" width="1.6" height="2.5" rx="0.8" fill="#92400e"/>
      <defs>
        <radialGradient id="dFG3" cx="50%" cy="80%" r="60%"><stop offset="0%" stopColor="#facc15"/><stop offset="50%" stopColor="#f97316"/><stop offset="100%" stopColor="#dc2626"/></radialGradient>
        <radialGradient id="dIF3" cx="50%" cy="70%" r="50%"><stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fde68a" stopOpacity="0"/></radialGradient>
        <linearGradient id="dBG3" x1="8" y1="20" x2="24" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#b45309"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
        <linearGradient id="dRG3" x1="8" y1="22" x2="24" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#fcd34d" stopOpacity="0.3"/><stop offset="50%" stopColor="#fef3c7" stopOpacity="0.8"/><stop offset="100%" stopColor="#fcd34d" stopOpacity="0.3"/></linearGradient>
      </defs>
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  // ── KEY FIX: Only use supabase from context. Do NOT watch user here —
  // that causes the flash because signOut() mid-registration triggers a re-render.
  const { supabase } = useAuth();

  const [form, setForm] = useState({ displayName: '', username: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const setField = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.displayName.trim()) e.displayName = 'Full name is required.';
    if (!form.username.trim()) e.username = 'Username is required.';
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username.trim()))
      e.username = '3–20 chars: lowercase, numbers, underscores only.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'At least 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    const uname = form.username.trim().toLowerCase();
    const email = form.email.trim().toLowerCase();

    // 1. Username check
    const { data: existing } = await supabase
      .from('users').select('id').eq('username', uname).maybeSingle();
    if (existing) {
      setErrors(e => ({ ...e, username: 'This username is already taken.' }));
      setLoading(false);
      return;
    }

    // 2. Create auth user
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: { data: { username: uname, display_name: form.displayName.trim() } },
    });

    if (signUpErr) {
      const msg = signUpErr.message?.toLowerCase() ?? '';
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        setApiError('This email is already registered. Try logging in instead.');
      } else {
        setApiError(signUpErr.message || 'Registration failed.');
      }
      setLoading(false);
      return;
    }

    // Supabase silently returns a session-less fake user for duplicate emails
    if (!signUpData?.user?.id) {
      setApiError('This email may already be registered. Try logging in instead.');
      setLoading(false);
      return;
    }

    const userId = signUpData.user.id;

    // 3. Update profile row
    await supabase.from('users').update({
      display_name:   form.displayName.trim(),
      phone:          form.phone.trim() || null,
      username:       uname,
      email_verified: false,
    }).eq('id', userId);

    // ── KEY FIX: Save state to sessionStorage BEFORE any navigation or signOut.
    // The /verify-email page reads this. btoa() hides the password from casual viewing.
    // register/page.js — saves creds before navigating away
sessionStorage.setItem('pending_otp', JSON.stringify({
  userId,
  email,
  pwd: btoa(unescape(encodeURIComponent(form.password))),  // ← stored here
  ts:  Date.now(),
}));

    // ── KEY FIX: Sign out AFTER saving state. 
    // This prevents the Supabase auth listener from auto-redirecting.
    await supabase.auth.signOut();

    // 4. Send OTP — call our Next.js API route
    try {
      const res = await fetch('/api/otp/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId, email }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setApiError(err.message);
      setLoading(false);
      return;
    }

    // ── KEY FIX: Push to dedicated /verify-email page (not state toggle).
    // This page is completely isolated from auth state.
    router.push('/verify-email');
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rp-root { position:fixed;inset:0;background:#080d18;font-family:'DM Sans',-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;overflow:hidden; }
        .rp-glow { position:absolute;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse 70% 55% at 50% 110%,rgba(250,204,21,0.06) 0%,transparent 65%); }
        .rp-sym-wrap{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1;}
        .rp-sym{position:absolute;color:#facc15;user-select:none;animation:rpFloat linear infinite;font-family:serif;}
        @keyframes rpFloat{0%{opacity:0;transform:translateY(0) rotate(0deg)}10%{opacity:.055}90%{opacity:.055}100%{opacity:0;transform:translateY(-105vh) rotate(380deg)}}
        .rp-ring{position:absolute;width:580px;height:580px;border-radius:50%;border:1px solid rgba(250,204,21,0.03);left:50%;top:50%;animation:rpSpin 70s linear infinite;pointer-events:none;z-index:1;transform:translate(-50%,-50%);}
        @keyframes rpSpin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        .rp-wrap-outer{position:relative;z-index:10;width:min(480px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow-y:auto;}
        .rp-wrap-outer::-webkit-scrollbar{display:none}
        .rp-card{background:linear-gradient(160deg,#0e1e38 0%,#080d18 100%);border:1px solid #1a2d4a;border-radius:28px;overflow:hidden;animation:rpSlide .55s cubic-bezier(.16,1,.3,1) both;}
        @keyframes rpSlide{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}
        .rp-topbar{height:3px;background:linear-gradient(90deg,transparent,#f59e0b 25%,#facc15 50%,#f59e0b 75%,transparent);}
        .rp-body{padding:36px 42px 44px;}
        @media(max-width:500px){.rp-body{padding:26px 20px 32px;}}
        .rp-brand{text-align:center;margin-bottom:26px;}
        .rp-om{font-size:42px;line-height:1;display:block;margin-bottom:8px;background:linear-gradient(135deg,#f59e0b,#facc15,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 12px rgba(250,204,21,.28));font-family:serif;}
        .rp-title{font-size:24px;font-weight:700;color:#f1f5f9;margin-bottom:4px;}
        .rp-sub{font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#334155;}
        .rp-divider{display:flex;align-items:center;gap:12px;margin-bottom:22px;}
        .rp-divline{flex:1;height:1px;background:#1a2d4a;}
        .rp-divtext{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#334155;}
        .rp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        @media(max-width:420px){.rp-grid2{grid-template-columns:1fr;}}
        .rp-field{margin-bottom:14px;}
        .rp-label{display:block;margin-bottom:6px;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#4a6080;}
        .rp-iw{position:relative;}
        .rp-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);pointer-events:none;display:flex;align-items:center;}
        .rp-input{width:100%;background:rgba(255,255,255,.03);border:1px solid #1e3550;border-radius:12px;padding:12px 13px 12px 40px;color:#f1f5f9;font-size:13.5px;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s;}
        .rp-input::placeholder{color:#1e3550;}
        .rp-input:focus{border-color:rgba(250,204,21,.4);box-shadow:0 0 0 3px rgba(250,204,21,.07);}
        .rp-input.err{border-color:rgba(239,68,68,.45);}
        .rp-input.pw{padding-right:44px;}
        .rp-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#334155;padding:3px;display:flex;align-items:center;}
        .rp-eye:hover{color:#64748b;}
        .rp-errtxt{font-size:10px;color:#f87171;margin-top:4px;padding-left:2px;}
        .rp-hint{font-size:10px;color:#334155;margin-top:4px;padding-left:2px;}
        .rp-apierr{display:flex;align-items:center;gap:9px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.22);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12px;font-weight:600;color:#f87171;}
        .rp-btn{width:100%;padding:15px;background:linear-gradient(135deg,#92400e 0%,#b45309 45%,#facc15 100%);color:#0f172a;border:none;border-radius:14px;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;margin-top:4px;transition:transform .15s,box-shadow .2s,opacity .2s;}
        .rp-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(250,204,21,.28);}
        .rp-btn:disabled{opacity:.65;cursor:not-allowed;}
        .rp-btn-in{display:flex;align-items:center;justify-content:center;gap:9px;}
        .rp-spin{width:16px;height:16px;border:2px solid rgba(15,23,42,.25);border-top-color:#0f172a;border-radius:50%;animation:spin .6s linear infinite;}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .rp-login{margin-top:16px;padding:13px 16px;background:rgba(250,204,21,.04);border:1px solid rgba(250,204,21,.1);border-radius:12px;text-align:center;}
        .rp-login p{font-size:12px;color:#4a6080;}
        .rp-login a{color:#facc15;font-weight:700;text-decoration:none;}
        .rp-login a:hover{text-decoration:underline;}
        .rp-sbar{display:flex;gap:4px;margin-top:6px;}
        .rp-sseg{flex:1;height:3px;border-radius:2px;background:#1a2d4a;transition:background .3s;}
        .rp-terms{font-size:10px;color:#334155;text-align:center;margin-top:14px;line-height:1.6;}
        .rp-terms a{color:#475569;}
        .rp-terms a:hover{color:#facc15;}
      `}</style>
      <div className="rp-root">
        <div className="rp-glow"/>
        <div className="rp-ring"/>
        <div className="rp-sym-wrap">
          {mounted && SYMBOLS.map((s,i)=>(
            <span key={i} className="rp-sym" style={{left:`${(i*10+5)%93}%`,bottom:'-40px',animationDuration:`${13+(i*3.5)%14}s`,animationDelay:`${(i*1.8)%9}s`,fontSize:`${15+(i*6)%22}px`}}>{s}</span>
          ))}
        </div>
        <div className="rp-wrap-outer">
          <div className="rp-card">
            <div className="rp-topbar"/>
            <div className="rp-body">
              <div className="rp-brand">
                <span className="rp-om">ॐ</span>
                <p className="rp-title">Create Account</p>
                <p className="rp-sub">Puja Samagri · Thimi, Bhaktapur</p>
              </div>
              <div className="rp-divider"><div className="rp-divline"/><span className="rp-divtext">New Customer</span><div className="rp-divline"/></div>
              {apiError && <div className="rp-apierr"><WarnIcon/><span>{apiError}</span></div>}
              <div className="rp-grid2">
                <div className="rp-field">
                  <label className="rp-label">Full Name</label>
                  <div className="rp-iw">
                    <span className="rp-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11V7a2 2 0 0 1 4 0v4"/><path d="M13 11V5a2 2 0 0 1 4 0v6"/><path d="M5 11a2 2 0 0 1 4 0v2"/><path d="M5 13v1a7 7 0 0 0 14 0v-3"/></svg></span>
                    <input className={`rp-input${errors.displayName?' err':''}`} type="text" placeholder="Ram Prasad" value={form.displayName} onChange={setField('displayName')}/>
                  </div>
                  {errors.displayName && <p className="rp-errtxt">{errors.displayName}</p>}
                </div>
                <div className="rp-field">
                  <label className="rp-label">Username</label>
                  <div className="rp-iw">
                    <span className="rp-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg></span>
                    <input className={`rp-input${errors.username?' err':''}`} type="text" placeholder="ram123" value={form.username} onChange={setField('username')} autoCapitalize="none" autoCorrect="off"/>
                  </div>
                  {errors.username ? <p className="rp-errtxt">{errors.username}</p> : <p className="rp-hint">3–20 chars, no spaces</p>}
                </div>
              </div>
              <div className="rp-field">
                <label className="rp-label">Email Address</label>
                <div className="rp-iw">
                  <span className="rp-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
                  <input className={`rp-input${errors.email?' err':''}`} type="email" placeholder="ram@example.com" value={form.email} onChange={setField('email')}/>
                </div>
                {errors.email && <p className="rp-errtxt">{errors.email}</p>}
              </div>
              <div className="rp-field">
                <label className="rp-label">Phone <span style={{color:'#273d58',fontWeight:400,letterSpacing:0}}>(optional)</span></label>
                <div className="rp-iw">
                  <span className="rp-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg></span>
                  <input className="rp-input" type="tel" placeholder="९८XXXXXXXX" value={form.phone} onChange={setField('phone')}/>
                </div>
              </div>
              <div className="rp-field">
                <label className="rp-label">Password</label>
                <div className="rp-iw">
                  <span className="rp-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg></span>
                  <input className={`rp-input pw${errors.password?' err':''}`} type={showPwd?'text':'password'} placeholder="Min. 6 characters" value={form.password} onChange={setField('password')}/>
                  <button className="rp-eye" onClick={()=>setShowPwd(s=>!s)} tabIndex={-1}><EyeIcon open={showPwd}/></button>
                </div>
                {form.password.length > 0 && (
                  <div className="rp-sbar">
                    {[1,2,3,4].map(i=>{const s=form.password.length;const c=s<5?'#ef4444':s<8?'#f59e0b':'#22c55e';return <div key={i} className="rp-sseg" style={{background:s>=i*2?c:undefined}}/>;})}
                  </div>
                )}
                {errors.password && <p className="rp-errtxt">{errors.password}</p>}
              </div>
              <div className="rp-field">
                <label className="rp-label">Confirm Password</label>
                <div className="rp-iw">
                  <span className="rp-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>
                  <input className={`rp-input pw${errors.confirm?' err':''}`} type={showConf?'text':'password'} placeholder="Repeat password" value={form.confirm} onChange={setField('confirm')}/>
                  <button className="rp-eye" onClick={()=>setShowConf(s=>!s)} tabIndex={-1}><EyeIcon open={showConf}/></button>
                </div>
                {errors.confirm && <p className="rp-errtxt">{errors.confirm}</p>}
              </div>
              <button className="rp-btn" onClick={handleRegister} disabled={loading}>
                <span className="rp-btn-in">
                  {loading ? <><div className="rp-spin"/>Creating account…</> : <><DiyaSVG size={18}/>Create Account</>}
                </span>
              </button>
              <p className="rp-terms">By registering you agree to our <a href="/policies/terms">Terms</a> &amp; <a href="/policies/privacy">Privacy Policy</a></p>
              <div className="rp-login"><p>Already have an account? <a href="/login">Sign in</a></p></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}