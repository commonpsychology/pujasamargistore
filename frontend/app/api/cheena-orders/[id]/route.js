// app/api/cheena-orders/[id]/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../src/lib/supabaseClient';

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('cheena_orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Cheena order PATCH error:', err.message);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}