import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const TABLE_MAP = {
  orders: 'orders',
  puja_orders: 'puja_orders',
  bookings: 'puja_orders',
  cheena_orders: 'cheena_orders',
  cod_orders: 'cod_orders',
  contact_messages: 'contact_messages',
  messages: 'contact_messages',
  newsletter_subscribers: 'newsletter_subscribers',
  newsletter: 'newsletter_subscribers',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableKey = searchParams.get('table');
  const table = TABLE_MAP[tableKey];

  if (!table) {
    return NextResponse.json(
      { error: 'Invalid table: ' + tableKey },
      { status: 400 }
    );
  }

  try {
    if (tableKey === 'messages') {
      const [contacts, newsletter, cheena] = await Promise.all([
        supabaseAdmin.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }),
        supabaseAdmin.from('cheena_orders').select('*').order('created_at', { ascending: false }),
      ]);
      if (contacts.error) throw contacts.error;
      if (newsletter.error) throw newsletter.error;
      if (cheena.error) throw cheena.error;
      return NextResponse.json({
        contact_messages: contacts.data ?? [],
        newsletter_subscribers: newsletter.data ?? [],
        cheena_orders: cheena.data ?? [],
      });
    }

    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const response = { data: data };
    response[table] = data;
    if (tableKey !== table) {
      response[tableKey] = data;
    }
    return NextResponse.json(response);

  } catch (err) {
    console.error('admin/data GET error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const tableKey = body.table;
    const id = body.id;
    const updates = body.updates;
    const table = TABLE_MAP[tableKey];

    if (!table) {
      return NextResponse.json({ error: 'Invalid table: ' + tableKey }, { status: 400 });
    }
    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Missing id or updates' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: data });

  } catch (err) {
    console.error('admin/data PATCH error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}