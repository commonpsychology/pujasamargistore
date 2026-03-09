// app/api/cheena/route.js
// POST /api/cheena  — save a cheena (jyotish) booking

import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    const { cheena_type, cheena_name, price, name, nwaran, dob, tob, pob, phone, message } = body;

    if (!name?.trim())  return NextResponse.json({ error: 'Name is required' },  { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    if (!dob)           return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });

    const { data, error } = await supabase
      .from('cheena_orders')
      .insert([{
        cheena_type,
        cheena_name,
        price,
        name:         name.trim(),
        nwaran_name:  nwaran?.trim() ?? null,
        dob,
        tob:          tob || null,
        pob:          pob?.trim() ?? null,
        phone:        phone.trim(),
        message:      message?.trim() ?? null,
        status:       'pending',
      }])
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Cheena insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order_id: data.id }, { status: 201 });

  } catch (err) {
    console.error('cheena POST error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}