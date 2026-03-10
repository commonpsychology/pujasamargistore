// app/api/admin/login/route.js
// Checks email + password against the staff table
// Uses bcryptjs — run: npm install bcryptjs
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../src/lib/supabaseClient';

let bcrypt;
async function getBcrypt() {
  if (!bcrypt) bcrypt = await import('bcryptjs');
  return bcrypt;
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
    }

    // Fetch staff record — select only what we need
    const { data: staff, error } = await supabaseAdmin
      .from('staff')
      .select('id, name, email, password_hash, role, is_active')
      .eq('email', email.trim().toLowerCase())
      .single();

    // Use same generic error for wrong email OR wrong password (security)
    if (error || !staff) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!staff.is_active) {
      return NextResponse.json({ error: 'Account is disabled. Contact admin.' }, { status: 403 });
    }

    // Check if staff table has password_hash column
    // If not, you need to: ALTER TABLE staff ADD COLUMN password_hash TEXT;
    if (!staff.password_hash) {
      return NextResponse.json({ error: 'Account not fully configured. Contact admin.' }, { status: 403 });
    }

    const { compare } = await getBcrypt();
    const valid = await compare(password, staff.password_hash);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last_login if column exists — non-fatal if it doesn't
    await supabaseAdmin
      .from('staff')
      .update({ last_login: new Date().toISOString() })
      .eq('id', staff.id)
      .then(() => {})
      .catch(() => {});

    // Return safe staff object (no password_hash)
    return NextResponse.json({
      success: true,
      staff: {
        id:    staff.id,
        name:  staff.name,
        email: staff.email,
        role:  staff.role,
      },
    });

  } catch (err) {
    console.error('Admin login error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}