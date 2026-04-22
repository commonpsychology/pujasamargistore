// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../src/lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name?.trim())    return NextResponse.json({ error: 'Name is required' },    { status: 400 });
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{
        name:    name.trim(),
        email:   email?.trim()   || null,
        phone:   phone?.trim()   || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        status:  'unread',
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Contact insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });

  } catch (err) {
    console.error('Contact POST error:', err.message);
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}