// app/api/orders/route.js
// POST /api/orders  — saves a new checkout order to Supabase
// GET  /api/orders  — returns all orders (admin, uses service role key)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '../../../src/lib/supabaseClient';

// ── POST: Place a new order ───────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      cart,
      cartTotal,
      deliveryCharge,
      grandTotal,
      paymentMethod,
      customerName,
      customerPhone,
      customerAddress,
    } = body;

    // Validation
    if (!customerName?.trim())    return NextResponse.json({ error: 'Name is required' },    { status: 400 });
    if (!customerPhone?.trim())   return NextResponse.json({ error: 'Phone is required' },   { status: 400 });
    if (!customerAddress?.trim()) return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    if (!cart?.length)            return NextResponse.json({ error: 'Cart is empty' },        { status: 400 });

    // Serialise cart items — store product name, price, qty as snapshot
    const items = cart.map(({ product, qty, variant }) => ({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      qty,
      variant:  variant ?? null,
      category: product.category ?? null,
    }));

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name:    customerName.trim(),
        customer_phone:   customerPhone.trim(),
        delivery_address: customerAddress.trim(),
        items,
        subtotal:         cartTotal,
        delivery_charge:  deliveryCharge,
        total_amount:     grandTotal,
        payment_method:   paymentMethod ?? 'pending',
        payment_status:   'pending',
        order_status:     'pending',
      }])
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Order insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success:   true,
      orderId:   data.id,
      createdAt: data.created_at,
    }, { status: 201 });

  } catch (err) {
    console.error('Orders POST error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── GET: List all orders (admin only) ────────────────────────
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Orders GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}