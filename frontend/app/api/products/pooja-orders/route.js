// app/api/puja-orders/route.js
// Handles puja samagri kit orders AND cheena (birth chart) orders
// Tables are auto-created on first request

import { NextResponse } from 'next/server';

async function getPool() {
  const { Pool } = await import('pg');
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

async function ensureTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS puja_orders (
      id            SERIAL PRIMARY KEY,
      puja_id       VARCHAR(100)  NOT NULL,
      puja_name     VARCHAR(200)  NOT NULL,
      puja_name_ne  VARCHAR(200),
      items         JSONB,
      total_price   INTEGER,
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

    CREATE TABLE IF NOT EXISTS cheena_orders (
      id            SERIAL PRIMARY KEY,
      cheena_type   VARCHAR(50)   NOT NULL,
      cheena_name   VARCHAR(200)  NOT NULL,
      price         INTEGER       NOT NULL,
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
  `);
}

// POST /api/puja-orders — save a new puja samagri kit order
export async function POST(request) {
  let pool;
  try {
    const body = await request.json();
    const { puja_id, puja_name, puja_name_ne, items, total_price, name, phone, location, date, note } = body;

    if (!puja_id || !puja_name || !name?.trim() || !phone?.trim() || !location?.trim() || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    pool = await getPool();
    await ensureTables(pool);

    const { rows } = await pool.query(
      `INSERT INTO puja_orders
         (puja_id, puja_name, puja_name_ne, items, total_price, name, phone, location, date, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, created_at`,
      [
        puja_id, puja_name, puja_name_ne,
        items ? JSON.stringify(items) : null,
        total_price || null,
        name.trim(), phone.trim(), location.trim(), date,
        note?.trim() || null,
      ]
    );

    return NextResponse.json({ success: true, order_id: rows[0].id, created_at: rows[0].created_at }, { status: 201 });
  } catch (err) {
    console.error('puja-orders POST error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}

// GET /api/puja-orders — list all orders (both puja & cheena, for admin)
export async function GET() {
  let pool;
  try {
    pool = await getPool();
    await ensureTables(pool);

    const [pujaResult, cheenaResult] = await Promise.all([
      pool.query(`SELECT *, 'puja' AS order_type FROM puja_orders ORDER BY created_at DESC LIMIT 300`),
      pool.query(`SELECT *, 'cheena' AS order_type FROM cheena_orders ORDER BY created_at DESC LIMIT 300`),
    ]);

    return NextResponse.json({
      puja_orders:   pujaResult.rows,
      cheena_orders: cheenaResult.rows,
    });
  } catch (err) {
    console.error('puja-orders GET error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}