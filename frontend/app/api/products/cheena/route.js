// app/api/cheena/route.js
// Saves cheena (jyotish/birth chart) reading orders to PostgreSQL

import { NextResponse } from 'next/server';

async function getPool() {
  const { Pool } = await import('pg');
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cheena_orders (
      id            SERIAL PRIMARY KEY,
      cheena_type   VARCHAR(50)   NOT NULL,
      cheena_name   VARCHAR(200),
      price         INTEGER,
      name          VARCHAR(200)  NOT NULL,
      nwaran_name   VARCHAR(200),
      dob           DATE          NOT NULL,
      tob           VARCHAR(20),
      pob           TEXT,
      phone         VARCHAR(30)   NOT NULL,
      message       TEXT,
      status        VARCHAR(50)   DEFAULT 'pending',
      created_at    TIMESTAMPTZ   DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_cheena_orders_status ON cheena_orders(status);
    CREATE INDEX IF NOT EXISTS idx_cheena_orders_created ON cheena_orders(created_at);
  `);
}

// POST /api/cheena — save a new cheena reading request
export async function POST(request) {
  let pool;
  try {
    const body = await request.json();
    const { cheena_type, cheena_name, price, name, nwaran_name, dob, tob, pob, phone, message } = body;

    if (!cheena_type || !name?.trim() || !dob || !phone?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    pool = await getPool();
    await ensureTable(pool);

    const { rows } = await pool.query(
      `INSERT INTO cheena_orders (cheena_type, cheena_name, price, name, nwaran_name, dob, tob, pob, phone, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, created_at`,
      [cheena_type, cheena_name || null, price || null,
       name.trim(), nwaran_name?.trim() || null, dob,
       tob || null, pob?.trim() || null, phone.trim(),
       message?.trim() || null]
    );

    return NextResponse.json({ success: true, order_id: rows[0].id, created_at: rows[0].created_at }, { status: 201 });

  } catch (err) {
    console.error('cheena POST error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}