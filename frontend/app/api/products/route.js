// app/api/products/route.js
// GET /api/products  — returns all in-stock products from Supabase
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search   = searchParams.get('search');

  let query = supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (search) {
    // Supabase ilike for case-insensitive search
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Products fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}