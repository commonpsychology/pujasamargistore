// app/api/puja-orders/route.js
// Uses Supabase (NOT pg — pg is uninstalled)
import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '../../../src/lib/supabaseClient';

// ── POST: Save a new puja booking ────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { puja_id, puja_name, puja_name_ne, items, total_price, name, phone, location, date, note } = body;

    if (!puja_id || !puja_name || !name?.trim() || !phone?.trim() || !location?.trim() || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: puja_id, puja_name, name, phone, location, date' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('puja_orders')
      .insert([{
        puja_id,
        puja_name,
        puja_name_ne: puja_name_ne || null,
        items:        items        || null,
        total_price:  total_price  || null,
        name:         name.trim(),
        phone:        phone.trim(),
        location:     location.trim(),
        date,
        note:         note?.trim() || null,
        status:       'pending',
      }])
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Puja order insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order_id: data.id, created_at: data.created_at }, { status: 201 });

  } catch (err) {
    console.error('Puja-orders POST error:', err.message);
    return NextResponse.json({ error: 'Failed to save booking. Please try again.' }, { status: 500 });
  }
}

// ── GET: All puja + cheena orders for admin ───────────────────
// Use ?type=all to get both merged, or omit for puja only
export async function GET(request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'all') {
      const [pujaRes, cheenaRes] = await Promise.all([
        supabaseAdmin.from('puja_orders').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('cheena_orders').select('*').order('created_at', { ascending: false }),
      ]);
      if (pujaRes.error)   throw pujaRes.error;
      if (cheenaRes.error) throw cheenaRes.error;

      const puja   = (pujaRes.data   || []).map(o => ({ ...o, order_type: 'puja'   }));
      const cheena = (cheenaRes.data || []).map(o => ({ ...o, order_type: 'cheena' }));
      const merged = [...puja, ...cheena].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      return NextResponse.json(merged);
    }

    // Default: puja orders only
    const { data, error } = await supabaseAdmin
      .from('puja_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);

  } catch (err) {
    console.error('Puja-orders GET error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}