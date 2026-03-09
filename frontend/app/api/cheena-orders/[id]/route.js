// app/api/cheena-orders/[id]/route.js
// PATCH /api/cheena-orders/:id  — update cheena order status from admin

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../src/lib/supabaseClient';

export async function PATCH(request, { params }) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not configured' }, { status: 503 });
  }

  const { id } = params;
  const { status } = await request.json();

  const VALID = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('cheena_orders')
    .update({ status })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}