// app/api/otp/send/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ── SMTP transporter from your .env vars ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,   // smtp.gmail.com
  port:   Number(process.env.EMAIL_PORT),  // 587
  secure: false,  // false for port 587 (STARTTLS), true for port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,   // neupanesanjeev675@gmail.com
    pass: process.env.EMAIL_PASS,   // your Gmail App Password (16 chars)
  },
});

export async function POST(req) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email)
      return NextResponse.json({ error: 'Missing userId or email.' }, { status: 400 });

    // Invalidate previous unused OTPs
    await supabaseAdmin
      .from('email_otps')
      .update({ used: true })
      .eq('user_id', userId)
      .eq('used', false);

    // Generate 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    // Store OTP — expires in 10 minutes
    const { error: insertErr } = await supabaseAdmin.from('email_otps').insert({
      user_id:    userId,
      email,
      otp,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 });

    // ── Send email ────────────────────────────────────────────────────────────
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,  // "CommonPsychology <noreplypsychology@gmail.com>"
      to:      email,
      subject: 'Your verification code',
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:32px;
                    background:#f8fafc;border-radius:16px;text-align:center;border:1px solid #e2e8f0;">
          <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">Verify your email</h2>
          <p style="color:#64748b;font-size:13px;margin:0 0 24px;">CommonPsychology</p>
          <div style="font-size:44px;font-weight:900;letter-spacing:18px;color:#6366f1;
                      padding:24px;background:#eef2ff;border-radius:14px;margin:0 0 24px;">
            ${otp}
          </div>
          <p style="color:#64748b;font-size:13px;line-height:1.7;">
            Enter this code on the verification page.<br/>
            It expires in <strong style="color:#1e293b;">10 minutes</strong>.<br/><br/>
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
      text: `Your verification code is: ${otp}\n\nExpires in 10 minutes.`,
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('OTP send error:', err);

    if (err.code === 'EAUTH') {
      return NextResponse.json(
        { error: 'Email auth failed. Check EMAIL_USER and EMAIL_PASS in env vars.' },
        { status: 500 }
      );
    }
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Cannot reach email server. Check EMAIL_HOST and EMAIL_PORT.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}