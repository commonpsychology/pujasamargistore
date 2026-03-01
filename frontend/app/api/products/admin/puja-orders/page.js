// app/api/orders/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { cart, cartTotal, deliveryCharge, grandTotal, paymentMethod, customerName, customerPhone, customerAddress } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        items: cart,                  // stored as JSON array
        cart_total: cartTotal,
        delivery_charge: deliveryCharge,
        grand_total: grandTotal,
        payment_method: paymentMethod,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        customer_address: customerAddress || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, orderId: data.id });
  } catch (err) {
    console.error('Order save error:', err);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// PATCH — update order status (for admin)
export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}