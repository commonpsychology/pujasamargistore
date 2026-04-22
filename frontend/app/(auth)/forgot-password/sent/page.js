'use client';
// app/forgot-password/sent/page.js
// Step 2 — shown after the reset email has been sent.
// Displays the email address, lets user resend, and has a countdown.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';export default function ForgotPasswordSentPage() {
  const params  = useSearchParams();
  const email   = params.get('email') || '';

  const [cooldown,  setCooldown]  = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setResending(true);
    setResendMsg('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password/reset`,
    });

    setResending(false);
    if (error) {
      setResendMsg('Could not resend. Please try again.');
    } else {
      setResendMsg('Email resent! Check your inbox.');
      setCooldown(RESEND_COOLDOWN);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        .fps-root {
          position:fixed; inset:0; background:#080d18;
          font-family:'DM Sans',-apple-system,sans-serif;
          display:flex; align-items:center; justify-content:center;
        }
        .fps-glow {
          position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 65% 50% at 50% 110%, rgba(250,204,21,0.06) 0%, transparent 65%);
        }
        .fps-wrap {
          position:relative; z-index:10;
          width:min(440px, calc(100vw - 32px));
          animation: fpsSlide 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes fpsSlide { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
        .fps-card {
          background:linear-gradient(160deg,#0e1e38 0%,#080d18 100%);
          border:1px solid #1a2d4a; border-radius:26px; overflow:hidden;
          text-align:center;
        }
        .fps-topbar { height:3px; background:linear-gradient(90deg,transparent,#4ade80 25%,#86efac 50%,#4ade80 75%,transparent); }
        .fps-body { padding:44px 38px 42px; }
        @media(max-width:480px){ .fps-body{padding:30px 22px 32px;} }

        /* Icon ring */
        .fps-icon-wrap {
          position:relative; width:88px; height:88px; margin:0 auto 22px;
        }
        .fps-icon-ring {
          position:absolute; inset:0; border-radius:50%;
          border:2px solid rgba(74,222,128,0.2);
          animation: fpsPulse 2s ease-in-out infinite;
        }
        @keyframes fpsPulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.1);opacity:1} }
        .fps-icon {
          position:absolute; inset:8px; background:rgba(74,222,128,0.08);
          border:1px solid rgba(74,222,128,0.2); border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:34px;
        }

        .fps-title { font-size:22px; font-weight:800; color:#f1f5f9; margin-bottom:10px; }
        .fps-text  { font-size:13px; color:#64748b; line-height:1.7; margin-bottom:6px; }
        .fps-email {
          display:inline-block; padding:5px 14px;
          background:rgba(250,204,21,0.07); border:1px solid rgba(250,204,21,0.15);
          border-radius:20px; font-size:13px; font-weight:700; color:#facc15;
          margin: 8px 0 16px;
          max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }

        .fps-steps {
          text-align:left; margin:20px 0;
          background:rgba(255,255,255,0.02); border:1px solid #1a2d4a;
          border-radius:14px; padding:16px 18px;
          display:flex; flex-direction:column; gap:10px;
        }
        .fps-step { display:flex; align-items:flex-start; gap:12px; }
        .fps-step-num {
          width:22px; height:22px; border-radius:50%; flex-shrink:0;
          background:rgba(250,204,21,0.1); border:1px solid rgba(250,204,21,0.2);
          font-size:10px; font-weight:800; color:#facc15;
          display:flex; align-items:center; justify-content:center;
        }
        .fps-step-text { font-size:12px; color:#64748b; line-height:1.5; padding-top:2px; }

        .fps-resend-wrap { margin-top:20px; }
        .fps-resend-btn {
          width:100%; padding:13px;
          background:rgba(250,204,21,0.06); border:1px solid rgba(250,204,21,0.15);
          border-radius:12px; color:#facc15; font-size:14px; font-weight:700;
          font-family:inherit; cursor:pointer;
          transition:all 0.18s; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .fps-resend-btn:not(:disabled):hover { background:rgba(250,204,21,0.12); }
        .fps-resend-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .fps-resend-msg { font-size:12px; margin-top:8px; color:#4ade80; }
        .fps-resend-msg.err { color:#f87171; }

        .fps-back { margin-top:18px; font-size:12px; color:#334155; }
        .fps-back a { color:#475569; font-weight:700; text-decoration:none; }
        .fps-back a:hover { color:#facc15; }

        .fps-note {
          margin-top:14px; padding:10px 14px;
          background:rgba(255,255,255,0.02); border:1px solid #1a2d4a;
          border-radius:10px; font-size:11px; color:#334155; line-height:1.6;
        }
      `}</style>

      <div className="fps-root">
        <div className="fps-glow" />
        <div className="fps-wrap">
          <div className="fps-card">
            <div className="fps-topbar" />
            <div className="fps-body">

              <div className="fps-icon-wrap">
                <div className="fps-icon-ring" />
                <div className="fps-icon">📨</div>
              </div>

              <p className="fps-title">Check Your Inbox</p>
              <p className="fps-text">We sent a password reset link to</p>
              {email && <span className="fps-email">{email}</span>}
              <p className="fps-text">Click the link in the email to set a new password.</p>

              <div className="fps-steps">
                <div className="fps-step">
                  <div className="fps-step-num">1</div>
                  <p className="fps-step-text">Open the email from <strong style={{color:'#94a3b8'}}>noreply@mail.app.supabase.io</strong></p>
                </div>
                <div className="fps-step">
                  <div className="fps-step-num">2</div>
                  <p className="fps-step-text">Click <strong style={{color:'#94a3b8'}}>&quot;Reset Password&quot;</strong> — the link expires in 1 hour</p>
                </div>
                <div className="fps-step">
                  <div className="fps-step-num">3</div>
                  <p className="fps-step-text">Enter and confirm your new password on the next page</p>
                </div>
              </div>

              <div className="fps-resend-wrap">
                <button
                  className="fps-resend-btn"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                >
                  {resending ? '📨 Resending…' : cooldown > 0 ? `🕐 Resend in ${cooldown}s` : '📨 Resend Email'}
                </button>
                {resendMsg && (
                  <p className={`fps-resend-msg${resendMsg.includes('Could not') ? ' err' : ''}`}>
                    {resendMsg}
                  </p>
                )}
              </div>

              <p className="fps-note">
                📂 Can&apos;t find it? Check your spam or junk folder.
              </p>

              <p className="fps-back">
                Wrong email? <Link href="/forgot-password">Try again</Link>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <Link href="/login">Back to login</Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}