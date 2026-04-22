// app/api/otp/verify/route.js
import { NextResponse } from 'next/server';
import { createClient }  from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const { userId, otp } = await req.json();

    if (!userId || !otp)
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });

    // Get the latest unused OTP for this user
    const { data: record, error: fetchErr } = await supabaseAdmin
      .from('email_otps')
      .select('*')
      .eq('user_id', userId)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr || !record)
      return NextResponse.json({ error: 'No pending verification found.' }, { status: 400 });

    if (new Date(record.expires_at) < new Date())
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 });

    if (record.otp !== String(otp).trim())
      return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 });

    // ── OTP is correct — confirm in 3 places in parallel ─────────────────────
    const [otpResult, userResult, authResult] = await Promise.all([
      // 1. Mark OTP as used
      supabaseAdmin
        .from('email_otps')
        .update({ used: true })
        .eq('id', record.id),

      // 2. Mark email_verified in your public users table
      supabaseAdmin
        .from('users')
        .update({ email_verified: true })
        .eq('id', userId),

      // 3. ── KEY FIX: Confirm the email in Supabase Auth ──────────────────────
      //    Without this, signInWithPassword returns 422 "Email not confirmed"
      supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true }),
    ]);

    if (otpResult.error)  console.error('OTP mark used error:',  otpResult.error);
    if (userResult.error) console.error('User verify error:',    userResult.error);
    if (authResult.error) console.error('Auth confirm error:',   authResult.error);

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('OTP verify error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}