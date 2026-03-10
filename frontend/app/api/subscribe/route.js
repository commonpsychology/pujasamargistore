// app/api/subscribe/route.js
//
// The Footer calls POST /api/subscribe — this is that route.
// It's an alias that re-exports the same logic as /api/newsletter.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../src/lib/supabaseClient';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase().trim() });

    if (error) {
      // 23505 = unique constraint — already subscribed
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already subscribed!' });
      }
      console.error('Newsletter subscribe error:', error.message);
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });

  } catch (err) {
    console.error('Subscribe POST error:', err.message);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}