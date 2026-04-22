// app/api/products/[id]/route.js
// GET /api/products/:id  — returns a single product by id

import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/lib/supabaseClient';

export async function GET(request, { params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}