'use client';

// app/admin/orders/page.js
// Simple password-protected admin page to view and manage orders.
// Visit: /admin/orders

import { useState, useEffect } from 'react';

const STATUS_CONFIG = {
  pending:         { label: 'Pending',          color: '#facc15', bg: 'rgba(250,204,21,0.1)'  },
  payment_pending: { label: 'Payment Pending',   color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
  cod_pending:     { label: 'COD Pending',       color: '#a855f7', bg: 'rgba(168,85,247,0.1)'  },
  confirmed:       { label: 'Confirmed',         color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  dispatched:      { label: 'Dispatched',        color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'   },
  delivered:       { label: 'Delivered',         color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  cancelled:       { label: 'Cancelled',         color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const ADMIN_PASSWORD = 'pooja2025';   // ← change this to your own password

/* ── Individual order row — must be its own component so useState is valid ── */
function OrderRow({ order, expanded, setExpanded, updating, updateStatus }) {
  const [localStatus, setLocalStatus] = useState(order.status);
  const sc     = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const isOpen = expanded === order.id;
  const items  = Array.isArray(order.items) ? order.items : [];
  const date   = order.created_at ? new Date(order.created_at).toLocaleString('en-NP') : '—';

  return (
    <div className="order-card">
      <div className="order-header" onClick={() => setExpanded(isOpen ? null : order.id)}>
        <span className="order-id">#{order.id?.toString().slice(0, 8).toUpperCase()}</span>
        <span className="order-customer">
          {order.customer_name || 'Unknown'} · {order.customer_phone || '—'}
        </span>
        <span
          className="status-badge"
          style={{ color: sc.color, background: sc.bg, borderColor: sc.color + '44' }}
        >
          {sc.label}
        </span>
        <span className="order-total">Rs. {order.grand_total}</span>
        <span className="order-time">{date}</span>
        <span className={`expand-arrow${isOpen ? ' open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="order-detail">
          <div className="detail-row">
            <span className="detail-key">Address</span>
            <span className="detail-val">{order.customer_address || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Payment Method</span>
            <span className="detail-val">{order.payment_method || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Delivery Charge</span>
            <span className="detail-val">Rs. {order.delivery_charge}</span>
          </div>

          {items.length > 0 && (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.product?.name || '—'}</td>
                    <td>{item.qty}</td>
                    <td>Rs. {(item.product?.price || 0) * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="status-update">
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 700 }}>Update Status:</span>
            <select
              className="status-select"
              value={localStatus}
              onChange={e => setLocalStatus(e.target.value)}
            >
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <button
              className="update-btn"
              disabled={updating === order.id || localStatus === order.status}
              onClick={() => updateStatus(order.id, localStatus)}
            >
              {updating === order.id ? '⏳' : '✓ Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



export default function AdminOrders() {
  const [authed,   setAuthed]   = useState(false);
  const [pw,       setPw]       = useState('');
  const [pwError,  setPwError]  = useState('');
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [filter,   setFilter]   = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(''); }
    else setPwError('Incorrect password.');
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch {}
    setUpdating(null);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.grand_total || 0), 0),
    pending: orders.filter(o => ['pending', 'payment_pending', 'cod_pending'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  /* ── Login screen ── */
  if (!authed) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: '#080d18', minHeight: '100vh', color: '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid #1e293b', borderRadius: '24px',
          padding: '48px 36px', maxWidth: '380px', width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#facc15', fontSize: '28px', margin: '0 0 8px' }}>
            Admin Access
          </h1>
          <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 28px' }}>Enter password to view orders</p>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', background: '#0f172a', border: `1px solid ${pwError ? '#ef4444' : '#1e293b'}`,
              borderRadius: '10px', padding: '12px 14px', color: '#f1f5f9',
              fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '8px',
            }}
          />
          {pwError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 12px' }}>{pwError}</p>}
          <button
            onClick={handleLogin}
            style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #854d0e, #facc15)',
              color: '#0f172a', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ── Main dashboard ── */
  return (
    <>
      <style href="admin-orders-styles" precedence="default">{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        * { box-sizing: border-box; }
        .admin-page {
          font-family: 'DM Sans', sans-serif;
          background: #080d18; color: #f1f5f9;
          min-height: 100vh; padding: 40px 24px 80px; max-width: 1100px; margin: 0 auto;
        }
        .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 16px; }
        .admin-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px,4vw,40px); font-weight: 700; color: #facc15; margin: 0; }
        .refresh-btn {
          background: #111827; border: 1px solid #1f2937; color: #94a3b8;
          padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s;
        }
        .refresh-btn:hover { border-color: #334155; color: #f1f5f9; }

        /* Stats */
        .stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; margin-bottom: 32px; }
        .stat-card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid #1e293b; border-radius: 14px; padding: 18px;
        }
        .stat-label { font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .stat-value { font-size: 24px; font-weight: 900; color: #f1f5f9; }

        /* Filter tabs */
        .filter-tabs { display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .filter-tabs::-webkit-scrollbar { display: none; }
        .filter-tab {
          white-space: nowrap; padding: 7px 14px; border-radius: 999px;
          border: 1px solid #1f2937; background: #111827; color: #64748b;
          font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .filter-tab.active { background: rgba(250,204,21,0.1); border-color: rgba(250,204,21,0.3); color: #facc15; }

        /* Orders list */
        .orders-list { display: flex; flex-direction: column; gap: 14px; }
        .order-card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; transition: border-color 0.2s;
        }
        .order-card:hover { border-color: #334155; }
        .order-header {
          display: flex; align-items: center; gap: 14px; padding: 16px 20px;
          cursor: pointer; flex-wrap: wrap;
        }
        .order-id { font-size: 13px; font-weight: 800; color: #f1f5f9; }
        .order-customer { font-size: 13px; color: #94a3b8; }
        .order-time { font-size: 11px; color: #334155; margin-left: auto; }
        .order-total { font-size: 15px; font-weight: 900; color: #facc15; }
        .status-badge {
          font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px;
          border: 1px solid; white-space: nowrap;
        }
        .expand-arrow { color: #475569; font-size: 12px; transition: transform 0.2s; }
        .expand-arrow.open { transform: rotate(180deg); }

        /* Order detail */
        .order-detail { border-top: 1px solid #1e293b; padding: 20px; }
        .detail-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
        .detail-key { color: #475569; font-weight: 700; min-width: 120px; }
        .detail-val { color: #94a3b8; }
        .items-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
        .items-table th { color: #475569; font-weight: 700; text-align: left; padding: 6px 0; border-bottom: 1px solid #1e293b; }
        .items-table td { padding: 8px 0; color: #94a3b8; border-bottom: 1px solid #0f172a; }
        .items-table td:last-child { color: #facc15; font-weight: 700; text-align: right; }

        /* Status update */
        .status-update { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
        .status-select {
          background: #0f172a; border: 1px solid #1e293b; border-radius: 8px;
          padding: 8px 12px; color: #f1f5f9; font-size: 13px; font-family: inherit;
          outline: none; cursor: pointer;
        }
        .update-btn {
          background: linear-gradient(135deg, #854d0e, #facc15); color: #0f172a;
          border: none; padding: 8px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit;
        }
        .update-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .empty-state { text-align: center; padding: 60px 20px; color: #334155; font-size: 15px; }
      `}</style>

      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">🧾 Orders Dashboard</h1>
          <button className="refresh-btn" onClick={fetchOrders}>
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Action</div>
            <div className="stat-value" style={{ color: '#f97316' }}>{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Delivered</div>
            <div className="stat-value" style={{ color: '#22c55e' }}>{stats.delivered}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Revenue (Delivered)</div>
            <div className="stat-value" style={{ color: '#facc15', fontSize: '18px' }}>Rs. {stats.revenue}</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          <button className={`filter-tab${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
            All ({orders.length})
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              className={`filter-tab${filter === s ? ' active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {STATUS_CONFIG[s].label} ({orders.filter(o => o.status === s).length})
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading && <div className="empty-state">⏳ Loading orders...</div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">No orders found.</div>
        )}

        <div className="orders-list">
          {filtered.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              expanded={expanded}
              setExpanded={setExpanded}
              updating={updating}
              updateStatus={updateStatus}
            />
          ))}
        </div>
      </div>
    </>
  );
}