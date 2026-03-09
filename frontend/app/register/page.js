'use client';
// app/register/page.js
// New customer registration — creates Supabase auth user + public.users row
// After signup → auto-signs in → redirects to home

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';

const SYMBOLS = ['ॐ', '🪔', '✦', '☸', '❋', '᳚', 'ॐ', '✦', '🪔', '☸'];

export default function RegisterPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    displayName: '',
    username:    '',
    email:       '',
    phone:       '',
    password:    '',
    confirm:     '',
  });
  const [showPwd,  setShowPwd]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Already logged in → home
  useEffect(() => {
    if (!authLoading && user) router.replace('/');
  }, [authLoading, user, router]);

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: '' }));
    setApiError('');
  };

  // ── Client-side validation ──────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.displayName.trim()) e.displayName = 'Full name is required.';
    if (!form.username.trim())    e.username    = 'Username is required.';
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username.trim()))
      e.username = '3–20 chars, lowercase letters, numbers, underscores only.';
    if (!form.email.trim())  e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password)      e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'At least 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    const uname = form.username.trim().toLowerCase();
    const email = form.email.trim().toLowerCase();

    // 1. Check username not taken
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', uname)
      .maybeSingle();

    if (existing) {
      setErrors(e => ({ ...e, username: 'This username is already taken.' }));
      setLoading(false);
      return;
    }

    // 2. Create Supabase auth user
    //    Pass username + display_name as metadata so the DB trigger can use them
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          username:     uname,
          display_name: form.displayName.trim(),
        },
      },
    });

    if (signUpErr) {
      setApiError(signUpErr.message || 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // 3. If email confirmation is disabled in Supabase, the user is immediately active.
    //    Update the public.users row with phone & display_name (trigger already created it).
    const userId = signUpData?.user?.id;
    if (userId) {
      await supabase
        .from('users')
        .update({
          display_name: form.displayName.trim(),
          phone:        form.phone.trim() || null,
          username:     uname,
        })
        .eq('id', userId);
    }

    setSuccess(true);
    // Auth state listener in AuthContext will pick up the new session → redirect
    // If email confirmation is ON, show message instead
    if (!signUpData?.session) {
      // Email confirmation required — don't auto-redirect
      setLoading(false);
    }
  };

  if (authLoading) return null;

  // ── Email confirmation waiting screen ───────────────────────────────────
  if (success && !user) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;700;800&family=Tiro+Devanagari+Sanskrit@0&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .conf-root {
            position: fixed; inset: 0; background: #080d18;
            font-family: 'DM Sans', sans-serif;
            display: flex; align-items: center; justify-content: center;
            padding: 24px;
          }
          .conf-card {
            width: min(440px, 100%);
            background: linear-gradient(160deg, #0e1e38 0%, #080d18 100%);
            border: 1px solid #1a2d4a; border-radius: 28px; overflow: hidden;
            text-align: center;
          }
          .conf-topbar { height: 3px; background: linear-gradient(90deg, transparent, #f59e0b 30%, #facc15 50%, #f59e0b 70%, transparent); }
          .conf-body { padding: 48px 40px 52px; }
          .conf-icon { font-size: 56px; margin-bottom: 20px; animation: confDiya 2s ease-in-out infinite; display: block; }
          @keyframes confDiya { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.15) translateY(-3px)} }
          .conf-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: #f1f5f9; margin-bottom: 12px; }
          .conf-msg { font-size: 14px; color: #64748b; line-height: 1.75; margin-bottom: 28px; }
          .conf-email { color: #facc15; font-weight: 700; }
          .conf-btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #92400e, #b45309, #facc15); color: #0f172a; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; }
        `}</style>
        <div className="conf-root">
          <div className="conf-card">
            <div className="conf-topbar" />
            <div className="conf-body">
              <span className="conf-icon">📧</span>
              <h2 className="conf-title">Check your inbox 🙏</h2>
              <p className="conf-msg">
                We sent a confirmation link to<br/>
                <span className="conf-email">{form.email}</span><br/><br/>
                Click the link in that email to activate your account.
              </p>
              <a href="/login" className="conf-btn">Back to Sign In</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;600;800&family=Tiro+Devanagari+Sanskrit@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rp-root {
          position: fixed; inset: 0; background: #080d18;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; z-index: 0;
        }

        .rp-glow {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background:
            radial-gradient(ellipse 70% 55% at 50% 110%, rgba(250,204,21,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 90% 40% at 50% -10%,  rgba(245,158,11,0.04) 0%, transparent 60%);
        }
        .rp-symbols { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
        .rp-sym {
          position: absolute; color: #facc15; user-select: none;
          animation: rpFloat linear infinite;
        }
        @keyframes rpFloat {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.055; }
          90%  { opacity: 0.055; }
          100% { transform: translateY(-105vh) rotate(380deg); opacity: 0; }
        }
        .rp-ring {
          position: absolute; width: 580px; height: 580px; border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.03);
          left: 50%; top: 50%;
          animation: rpSpin 70s linear infinite; pointer-events: none; z-index: 1;
          transform: translate(-50%,-50%);
        }
        @keyframes rpSpin { from { transform:translate(-50%,-50%) rotate(0deg); } to { transform:translate(-50%,-50%) rotate(360deg); } }

        .rp-card-wrap {
          position: relative; z-index: 10;
          width: min(480px, calc(100vw - 32px));
          max-height: calc(100vh - 32px); overflow-y: auto;
        }
        .rp-card-wrap::-webkit-scrollbar { display: none; }

        .rp-card {
          background: linear-gradient(160deg, #0e1e38 0%, #080d18 100%);
          border: 1px solid #1a2d4a; border-radius: 28px; overflow: hidden;
          animation: rpSlide 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes rpSlide { from{opacity:0;transform:translateY(28px) scale(0.97)} to{opacity:1;transform:none} }

        .rp-topbar { height: 3px; background: linear-gradient(90deg, transparent, #f59e0b 25%, #facc15 50%, #f59e0b 75%, transparent); }
        .rp-body { padding: 36px 42px 44px; }
        @media(max-width:500px){ .rp-body{padding:26px 20px 32px;} }

        .rp-brand { text-align: center; margin-bottom: 26px; }
        .rp-om {
          font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 42px; line-height: 1;
          display: block; margin-bottom: 8px;
          background: linear-gradient(135deg, #f59e0b, #facc15, #f59e0b);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 0 12px rgba(250,204,21,0.28));
        }
        .rp-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .rp-sub { font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #334155; }

        .rp-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
        .rp-divline { flex: 1; height: 1px; background: #1a2d4a; }
        .rp-divtext { font-size: 10px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #334155; }

        /* Two-column grid for name+username */
        .rp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media(max-width:420px){ .rp-grid2{grid-template-columns:1fr;} }

        .rp-field { margin-bottom: 14px; }
        .rp-label { display:block; margin-bottom:6px; font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#4a6080; }
        .rp-wrap { position: relative; }
        .rp-ico  { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:13px; pointer-events:none; opacity:0.45; }
        .rp-input {
          width:100%; background:rgba(255,255,255,0.03); border:1px solid #1e3550;
          border-radius:12px; padding:12px 13px 12px 40px;
          color:#f1f5f9; font-size:13.5px; font-family:'DM Sans',sans-serif;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .rp-input::placeholder { color:#1e3550; }
        .rp-input:focus { border-color:rgba(250,204,21,0.4); box-shadow:0 0 0 3px rgba(250,204,21,0.07); }
        .rp-input.err { border-color: rgba(239,68,68,0.45); }
        .rp-input.pwd-field { padding-right: 44px; }
        .rp-eye  { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#334155; font-size:15px; padding:3px; transition:color 0.2s; }
        .rp-eye:hover { color:#64748b; }

        .rp-errtxt { font-size:10px; color:#f87171; margin-top:4px; padding-left:2px; }
        .rp-hint   { font-size:10px; color:#334155; margin-top:4px; padding-left:2px; }

        .rp-api-error {
          display:flex; align-items:center; gap:9px;
          background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.22);
          border-radius:10px; padding:10px 14px; margin-bottom:14px;
          font-size:12px; font-weight:600; color:#f87171;
        }

        .rp-btn {
          width:100%; padding:15px;
          background:linear-gradient(135deg, #92400e 0%, #b45309 45%, #facc15 100%);
          color:#0f172a; border:none; border-radius:14px;
          font-size:15px; font-weight:800; font-family:'DM Sans',sans-serif;
          cursor:pointer; margin-top:4px;
          transition:transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          position:relative; overflow:hidden;
        }
        .rp-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform:translateX(-100%); transition:transform 0.45s ease;
        }
        .rp-btn:not(:disabled):hover::after { transform:translateX(100%); }
        .rp-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(250,204,21,0.28); }
        .rp-btn:disabled { opacity:0.65; cursor:not-allowed; }
        .rp-btn-inner { display:flex; align-items:center; justify-content:center; gap:9px; position:relative; z-index:1; }
        .rp-spin { width:16px; height:16px; border:2px solid rgba(15,23,42,0.25); border-top-color:#0f172a; border-radius:50%; animation:rpSpin2 0.6s linear infinite; }
        @keyframes rpSpin2 { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        .rp-login {
          margin-top:16px; padding:13px 16px;
          background:rgba(250,204,21,0.04); border:1px solid rgba(250,204,21,0.1);
          border-radius:12px; text-align:center;
        }
        .rp-login p { font-size:12px; color:#4a6080; }
        .rp-login a { color:#facc15; font-weight:700; text-decoration:none; }
        .rp-login a:hover { text-decoration:underline; }

        /* password strength bar */
        .rp-strength-bar { display:flex; gap:4px; margin-top:6px; }
        .rp-strength-seg { flex:1; height:3px; border-radius:2px; background:#1a2d4a; transition:background 0.3s; }

        /* terms note */
        .rp-terms { font-size:10px; color:#334155; text-align:center; margin-top:14px; line-height:1.6; }
        .rp-terms a { color:#475569; }
        .rp-terms a:hover { color:#facc15; }
      `}</style>

      <div className="rp-root">
        <div className="rp-glow" />
        <div className="rp-ring" />
        <div className="rp-symbols">
          {mounted && SYMBOLS.map((sym, i) => (
            <span key={i} className="rp-sym" style={{
              left:             `${(i * 10 + 5) % 93}%`,
              bottom:           `-40px`,
              animationDuration:`${13 + (i * 3.5) % 14}s`,
              animationDelay:   `${(i * 1.8) % 9}s`,
              fontSize:         `${15 + (i * 6) % 22}px`,
            }}>{sym}</span>
          ))}
        </div>

        <div className="rp-card-wrap">
          <div className="rp-card">
            <div className="rp-topbar" />
            <div className="rp-body">

              {/* Brand */}
              <div className="rp-brand">
                <span className="rp-om">ॐ</span>
                <p className="rp-title">Create Account</p>
                <p className="rp-sub">Puja Samagri · Thimi, Bhaktapur</p>
              </div>

              {/* Divider */}
              <div className="rp-divider">
                <div className="rp-divline" /><span className="rp-divtext">New Customer</span><div className="rp-divline" />
              </div>

              {apiError && (
                <div className="rp-api-error"><span>⚠️</span><span>{apiError}</span></div>
              )}

              {/* Name + Username side by side */}
              <div className="rp-grid2">
                <div className="rp-field">
                  <label className="rp-label">Full Name</label>
                  <div className="rp-wrap">
                    <span className="rp-ico">🙏</span>
                    <input className={`rp-input${errors.displayName ? ' err' : ''}`} type="text"
                      placeholder="Ram Prasad" value={form.displayName} onChange={set('displayName')} />
                  </div>
                  {errors.displayName && <p className="rp-errtxt">{errors.displayName}</p>}
                </div>

                <div className="rp-field">
                  <label className="rp-label">Username</label>
                  <div className="rp-wrap">
                    <span className="rp-ico">@</span>
                    <input className={`rp-input${errors.username ? ' err' : ''}`} type="text"
                      placeholder="ram123" value={form.username}
                      onChange={e => { set('username')(e); }}
                      autoCapitalize="none" autoCorrect="off" />
                  </div>
                  {errors.username
                    ? <p className="rp-errtxt">{errors.username}</p>
                    : <p className="rp-hint">3–20 chars, no spaces</p>}
                </div>
              </div>

              {/* Email */}
              <div className="rp-field">
                <label className="rp-label">Email Address</label>
                <div className="rp-wrap">
                  <span className="rp-ico">📧</span>
                  <input className={`rp-input${errors.email ? ' err' : ''}`} type="email"
                    placeholder="ram@example.com" value={form.email} onChange={set('email')} />
                </div>
                {errors.email && <p className="rp-errtxt">{errors.email}</p>}
              </div>

              {/* Phone (optional) */}
              <div className="rp-field">
                <label className="rp-label">Phone <span style={{color:'#273d58',fontWeight:400,letterSpacing:0}}>(optional)</span></label>
                <div className="rp-wrap">
                  <span className="rp-ico">📞</span>
                  <input className="rp-input" type="tel"
                    placeholder="९८XXXXXXXX" value={form.phone} onChange={set('phone')} />
                </div>
              </div>

              {/* Password */}
              <div className="rp-field">
                <label className="rp-label">Password</label>
                <div className="rp-wrap">
                  <span className="rp-ico">🔑</span>
                  <input className={`rp-input pwd-field${errors.password ? ' err' : ''}`}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
                  <button className="rp-eye" onClick={() => setShowPwd(s => !s)} tabIndex={-1}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div className="rp-strength-bar">
                    {[1,2,3,4].map(i => {
                      const s = form.password.length;
                      const filled = s >= i * 2;
                      const colour = s < 5 ? '#ef4444' : s < 8 ? '#f59e0b' : '#22c55e';
                      return <div key={i} className="rp-strength-seg" style={{background: filled ? colour : undefined}} />;
                    })}
                  </div>
                )}
                {errors.password && <p className="rp-errtxt">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="rp-field">
                <label className="rp-label">Confirm Password</label>
                <div className="rp-wrap">
                  <span className="rp-ico">✅</span>
                  <input className={`rp-input pwd-field${errors.confirm ? ' err' : ''}`}
                    type={showConf ? 'text' : 'password'}
                    placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
                  <button className="rp-eye" onClick={() => setShowConf(s => !s)} tabIndex={-1}>
                    {showConf ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirm && <p className="rp-errtxt">{errors.confirm}</p>}
              </div>

              {/* Submit */}
              <button className="rp-btn" onClick={handleRegister} disabled={loading || success}>
                <span className="rp-btn-inner">
                  {loading ? <><div className="rp-spin" /> Creating account…</> : <>🪔 &nbsp;Create Account</>}
                </span>
              </button>

              <p className="rp-terms">
                By registering you agree to our&nbsp;
                <a href="/policies/terms">Terms</a> &amp;&nbsp;
                <a href="/policies/privacy">Privacy Policy</a>
              </p>

              <div className="rp-login">
                <p>Already have an account? <a href="/login">Sign in</a></p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}