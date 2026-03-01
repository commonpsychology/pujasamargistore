// app/api/puja-orders/route.js
// Saves puja booking orders to PostgreSQL
// Table is auto-created on first request if it doesn't exist

import { NextResponse } from 'next/server';

async function getPool() {
  const { Pool } = await import('pg');
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

// Auto-create table if it doesn't exist
async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS puja_orders (
      id            SERIAL PRIMARY KEY,
      puja_id       INTEGER       NOT NULL,
      puja_name     VARCHAR(200)  NOT NULL,
      puja_name_ne  VARCHAR(200),
      name          VARCHAR(200)  NOT NULL,
      phone         VARCHAR(30)   NOT NULL,
      location      TEXT          NOT NULL,
      date          DATE          NOT NULL,
      note          TEXT,
      status        VARCHAR(50)   DEFAULT 'pending',
      created_at    TIMESTAMPTZ   DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_puja_orders_status ON puja_orders(status);
    CREATE INDEX IF NOT EXISTS idx_puja_orders_date   ON puja_orders(date);
  `);
}

// POST /api/puja-orders — save a new booking
export async function POST(request) {
  let pool;
  try {
    const body = await request.json();
    const { puja_id, puja_name, puja_name_ne, name, phone, location, date, note } = body;

    // Basic validation
    if (!puja_id || !puja_name || !name?.trim() || !phone?.trim() || !location?.trim() || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    pool = await getPool();
    await ensureTable(pool);

    const { rows } = await pool.query(
      `INSERT INTO puja_orders (puja_id, puja_name, puja_name_ne, name, phone, location, date, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [puja_id, puja_name, puja_name_ne, name.trim(), phone.trim(), location.trim(), date, note?.trim() || null]
    );

    return NextResponse.json({
      success: true,
      order_id: rows[0].id,
      created_at: rows[0].created_at,
    }, { status: 201 });

  } catch (err) {
    console.error('puja-orders POST error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}

// GET /api/puja-orders — list all orders (for admin use)
export async function GET() {
  let pool;
  try {
    pool = await getPool();
    await ensureTable(pool);

    const { rows } = await pool.query(`
      SELECT * FROM puja_orders
      ORDER BY created_at DESC
      LIMIT 200
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('puja-orders GET error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}