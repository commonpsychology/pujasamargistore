// app/api/orders/route.js
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../src/lib/supabaseClient';

function generateOrderRef() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PS-${ts}-${rnd}`;
}

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
      userId,           // ← FIX: received from checkout page
    } = body;

    if (!customerName?.trim())    return NextResponse.json({ error: 'Name is required' },    { status: 400 });
    if (!customerPhone?.trim())   return NextResponse.json({ error: 'Phone is required' },   { status: 400 });
    if (!customerAddress?.trim()) return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    if (!cart?.length)            return NextResponse.json({ error: 'Cart is empty' },        { status: 400 });

    const items = cart.map(({ product, qty, variant }) => ({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      qty,
      variant:  variant  ?? null,
      category: product.category ?? null,
    }));

    const payment_reference = generateOrderRef();
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error('supabaseAdmin is null — check SUPABASE_SERVICE_ROLE_KEY in .env.local');
      return NextResponse.json({ error: 'Server configuration error. Contact admin.' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        customer_name:     customerName.trim(),
        customer_phone:    customerPhone.trim(),
        delivery_address:  customerAddress.trim(),
        items,
        subtotal:          cartTotal,
        delivery_charge:   deliveryCharge,
        total_amount:      grandTotal,
        payment_method:    paymentMethod ?? 'pending',
        payment_status:    'pending',
        order_status:      'pending',
        payment_reference,
        user_id:           userId ?? null,   // ← FIX: save user_id so /account/orders works
      }])
      .select('id, created_at, payment_reference')
      .single();

    if (error) {
      console.error('Order insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success:       true,
      orderId:       data.id,
      orderRef:      data.payment_reference,
      totalAmount:   grandTotal,
      paymentMethod: paymentMethod,
      createdAt:     data.created_at,
    }, { status: 201 });

  } catch (err) {
    console.error('Orders POST error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Update payment method + status after user chooses ─
// Called by payment page when user clicks "Confirm"
export async function PATCH(request) {
  try {
    const { id, orderRef, status, paymentMethod } = await request.json();
    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    const updateData = {};
    if (status)        updateData.payment_status = status;        // 'cod_pending' | 'payment_pending' | 'paid'
    if (paymentMethod) updateData.payment_method = paymentMethod; // 'cod' | 'qr' | 'esewa' | 'khalti'

    // Auto-confirm order_status for COD
    if (status === 'cod_pending' || status === 'paid') {
      updateData.order_status = 'confirmed';
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 503 });
    }
    let query = supabaseAdmin.from('orders').update(updateData).eq('id', id);
    // Also match orderRef if provided — double-checks it's the right order
    if (orderRef) query = query.eq('payment_reference', orderRef);

    const { error } = await query;
    if (error) throw error;

    // If COD, also insert into cod_orders table
    if (paymentMethod === 'cod') {
      // Fetch the full order to copy into cod_orders
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (order) {
        const { error: codErr } = await supabaseAdmin
          .from('cod_orders')
          .insert([{
            order_id:         order.id,
            customer_name:    order.customer_name,
            customer_phone:   order.customer_phone,
            delivery_address: order.delivery_address,
            items:            order.items,
            total_amount:     order.total_amount,
            status:           'pending',
          }]);
        if (codErr) console.error('COD insert error (non-fatal):', codErr.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Orders PATCH error:', err.message);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// ── GET: All orders (admin) ───────────────────────────────────
export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' },
      { status: 503 }
    );
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