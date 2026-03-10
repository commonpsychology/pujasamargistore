// app/api/admin/data/route.js
//
// Single endpoint that returns all admin data.
// GET /api/admin/data?table=orders|bookings|messages|all
// Uses supabaseAdmin (service role) — bypasses RLS entirely.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../src/lib/supabaseClient';

export async function GET(request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table') || 'all';

  try {
    const result = {};

    // ── Shop Orders ──────────────────────────────────────────
    if (table === 'all' || table === 'orders') {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(`orders: ${error.message}`);
      result.orders = data ?? [];
    }

    // ── Puja Orders ──────────────────────────────────────────
    if (table === 'all' || table === 'bookings') {
      const { data: puja, error: pe } = await supabaseAdmin
        .from('puja_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (pe) throw new Error(`puja_orders: ${pe.message}`);

      const { data: cheena, error: ce } = await supabaseAdmin
        .from('cheena_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (ce) throw new Error(`cheena_orders: ${ce.message}`);

      result.puja_orders   = puja   ?? [];
      result.cheena_orders = cheena ?? [];
    }

    // ── Messages & Newsletter ────────────────────────────────
    if (table === 'all' || table === 'messages') {
      const { data: contacts, error: cErr } = await supabaseAdmin
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (cErr) throw new Error(`contact_messages: ${cErr.message}`);

      const { data: newsletter, error: nErr } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*');
      if (nErr) throw new Error(`newsletter_subscribers: ${nErr.message}`);

      result.contact_messages       = contacts    ?? [];
      result.newsletter_subscribers = newsletter  ?? [];
    }

    return NextResponse.json(result);

  } catch (err) {
    console.error('Admin data fetch error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/data — update order_status or read status
export async function PATCH(request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not configured' }, { status: 503 });
  }

  try {
    const { table, id, updates } = await request.json();

    if (!table || !id || !updates) {
      return NextResponse.json({ error: 'table, id, and updates are required' }, { status: 400 });
    }

    const allowed = ['orders', 'puja_orders', 'cheena_orders', 'contact_messages'];
    if (!allowed.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from(table)
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin PATCH error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}