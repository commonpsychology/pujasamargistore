// app/api/puja-orders/route.js
// Handles POST requests from /order page to insert into puja_orders table.

import { createClient } from '@supabase/supabase-js';
import { NextResponse }  from 'next/server';

// Service role bypasses RLS — safe for server-side inserts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      puja_id,
      puja_name,
      puja_name_ne,
      name,
      phone,
      location,
      date,
      note,
      items,
      total_price,
      user_id,       // optional — pass if user is logged in
    } = body;

    // Basic validation
    if (!puja_id || !puja_name || !name || !phone || !location || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: puja_id, puja_name, name, phone, location, date' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('puja_orders')
      .insert([{
        puja_id,
        puja_name,
        puja_name_ne:  puja_name_ne  ?? null,
        name,
        phone,
        location,
        date,
        note:          note          ?? null,
        items:         items         ?? null,
        total_price:   total_price   ?? null,
        guru_dakshina: body.guru_dakshina ?? null,
        user_id:       user_id       ?? null,
        status:        'pending',
      }])
      .select()
      .single();

    if (error) {
      console.error('[puja-orders POST] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data }, { status: 201 });

  } catch (err) {
    console.error('[puja-orders POST] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Return 405 for non-POST methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}