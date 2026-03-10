// app/api/cheena/route.js
// Uses Supabase (NOT pg — pg is uninstalled)
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../src/lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      cheena_type,
      cheena_name,
      price,
      name,
      nwaran,       // field name from cheena form (form.nwaran)
      nwaran_name,  // alias fallback
      dob,
      tob,
      pob,
      phone,
      message,
    } = body;

    // Validation
    if (!cheena_type)    return NextResponse.json({ error: 'cheena_type is required' },  { status: 400 });
    if (!name?.trim())   return NextResponse.json({ error: 'Name is required' },          { status: 400 });
    if (!dob)            return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });
    if (!phone?.trim())  return NextResponse.json({ error: 'Phone is required' },         { status: 400 });

    if (!['short', 'long'].includes(cheena_type)) {
      return NextResponse.json({ error: 'cheena_type must be "short" or "long"' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error('supabaseAdmin is null — check SUPABASE_SERVICE_ROLE_KEY in .env.local');
      return NextResponse.json({ error: 'Server configuration error. Contact admin.' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('cheena_orders')
      .insert([{
        cheena_type,
        cheena_name: cheena_name || (cheena_type === 'short' ? 'लघु चिना' : 'विस्तृत चिना'),
        price:       Number(price) || 0,
        name:        name.trim(),
        nwaran_name: (nwaran || nwaran_name)?.trim() || null,
        dob,
        tob:         tob  || null,
        pob:         pob?.trim()  || null,
        phone:       phone.trim(),
        message:     message?.trim() || null,
        status:      'pending',
      }])
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Cheena insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success:    true,
      order_id:   data.id,
      created_at: data.created_at,
    }, { status: 201 });

  } catch (err) {
    console.error('Cheena POST error:', err.message);
    return NextResponse.json({ error: 'Failed to submit booking. Please try again.' }, { status: 500 });
  }
}