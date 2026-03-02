'use client';
// app/admin/orders/page.js

import { useState, useEffect, useMemo, useCallback } from 'react';

const ADMIN_PASSWORD = 'pushkar2025'; // ← change this to your password

const STATUS_COLORS = {
  pending:   { bg: 'rgba(250,204,21,0.1)',  border: 'rgba(250,204,21,0.25)',  text: '#facc15' },
  confirmed: { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   text: '#22c55e' },
  completed: { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)',  text: '#818cf8' },
  cancelled: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   text: '#f87171' },
};

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Password Gate ────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [pwd, setPwd]       = useState('');
  const [shake, setShake]   = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_unlocked', '1');
      onUnlock();
    } else {
      setAttempts(a => a + 1);
      setShake(true);
      setPwd('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #080d18; }

        .gate-wrap {
          font-family: 'DM Sans', sans-serif;
          background: #080d18;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .gate-card {
          background: #0c1220;
          border: 1px solid #1a2540;
          border-radius: 20px;
          padding: 40px 36px;
          width: 100%; max-width: 380px;
          text-align: center;
        }
        .gate-icon {
          font-size: 40px; margin-bottom: 16px;
        }
        .gate-eyebrow {
          font-size: 10px; font-weight: 800; letter-spacing: 3px;
          text-transform: uppercase; color: #facc15; margin-bottom: 8px;
        }
        .gate-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 6px;
        }
        .gate-sub {
          font-size: 12px; color: #475569; margin-bottom: 28px;
        }
        .gate-input-wrap {
          position: relative; margin-bottom: 12px;
        }
        .gate-input {
          width: 100%;
          background: #111827; border: 1px solid #1e293b;
          border-radius: 12px; padding: 13px 44px 13px 16px;
          color: #f1f5f9; font-size: 15px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s; letter-spacing: 2px;
        }
        .gate-input:focus { border-color: rgba(250,204,21,0.4); }
        .gate-input.error { border-color: rgba(239,68,68,0.5); }
        .toggle-btn {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #334155; font-size: 16px; padding: 4px;
          transition: color 0.2s;
        }
        .toggle-btn:hover { color: #94a3b8; }
        .gate-btn {
          width: 100%;
          background: rgba(250,204,21,0.1);
          border: 1px solid rgba(250,204,21,0.25);
          border-radius: 12px; padding: 13px;
          color: #facc15; font-size: 13px; font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .gate-btn:hover {
          background: rgba(250,204,21,0.15);
          border-color: rgba(250,204,21,0.4);
        }
        .gate-error {
          font-size: 11px; color: #f87171; font-weight: 700;
          margin-top: 10px; min-height: 16px;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
        .shake { animation: shake 0.5s ease; }
      `}</style>

      <div className="gate-wrap">
        <div className={`gate-card ${shake ? 'shake' : ''}`}>
          <div className="gate-icon">🔐</div>
          <p className="gate-eyebrow">Restricted Area</p>
          <h1 className="gate-title">Admin Access</h1>
          <p className="gate-sub">Enter your admin password to continue</p>

          <GateForm
            pwd={pwd}
            setPwd={setPwd}
            shake={shake}
            attempts={attempts}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );
}

function GateForm({ pwd, setPwd, shake, attempts, onSubmit }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <div className="gate-input-wrap">
        <input
          className={`gate-input${attempts > 0 ? ' error' : ''}`}
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          autoFocus
        />
        <button className="toggle-btn" onClick={() => setShow(s => !s)} tabIndex={-1}>
          {show ? '🙈' : '👁'}
        </button>
      </div>
      <button className="gate-btn" onClick={onSubmit}>
        Unlock Dashboard →
      </button>
      <p className="gate-error">
        {attempts > 0 ? `Incorrect password${attempts > 2 ? ` (${attempts} attempts)` : ''}` : ''}
      </p>
    </>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────
export default function AdminOrdersPage() {
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('admin_unlocked') === '1'
  );

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return <AdminDashboard />;
}

// ─── Dashboard (only renders after unlock) ───────────────────
function AdminDashboard() {
  const [data, setData]         = useState({ puja_orders: [], cheena_orders: [] });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/puja-orders?type=all');
      if (!res.ok) throw new Error('Failed');
      const rows = await res.json();
      const puja_orders   = rows.filter(o => o.order_type === 'puja');
      const cheena_orders = rows.filter(o => o.order_type === 'cheena');
      setData({ puja_orders, cheena_orders });
    } catch {
      setError('Failed to load orders. Check your database connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (type, id, status) => {
    const endpoint = type === 'puja' ? `/api/puja-orders/${id}` : `/api/cheena-orders/${id}`;
    try {
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setData(prev => ({
        ...prev,
        [`${type}_orders`]: prev[`${type}_orders`].map(o => o.id === id ? { ...o, status } : o),
      }));
    } catch { /* silent */ }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_unlocked');
    window.location.reload();
  };

  const allOrders = useMemo(() => {
    const puja   = (data.puja_orders   || []).map(o => ({ ...o, _type: 'puja' }));
    const cheena = (data.cheena_orders || []).map(o => ({ ...o, _type: 'cheena' }));
    return [...puja, ...cheena].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [data]);

  const filtered = useMemo(() => {
    let list = allOrders;
    if (tab !== 'all')          list = list.filter(o => o._type === tab);
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.name?.toLowerCase().includes(q) ||
        o.phone?.includes(q) ||
        (o.puja_name || o.cheena_name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allOrders, tab, statusFilter, search]);

  const stats = useMemo(() => ({
    total:     allOrders.length,
    puja:      allOrders.filter(o => o._type === 'puja').length,
    cheena:    allOrders.filter(o => o._type === 'cheena').length,
    pending:   allOrders.filter(o => o.status === 'pending').length,
    confirmed: allOrders.filter(o => o.status === 'confirmed').length,
  }), [allOrders]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #facc15; --green: #22c55e; --orange: #f97316; --amber: #fbbf24;
          --bg: #080d18; --surface: #0c1220; --surface2: #111827;
          --border: #1a2540; --border2: #1e293b; --muted: #475569; --text: #f1f5f9;
        }

        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

        .admin-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg); color: var(--text);
          min-height: 100vh; padding: 40px 24px 80px;
        }

        .page-title-row {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 32px; gap: 16px; flex-wrap: wrap;
          animation: fadeUp 0.4s ease both;
        }
        .page-eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
        .page-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 700; color: var(--text); line-height: 1.1; }

        .title-actions { display: flex; gap: 8px; align-items: center; }
        .refresh-btn {
          display: flex; align-items: center; gap: 7px;
          background: var(--surface); border: 1px solid var(--border2);
          color: var(--muted); font-size: 12px; font-weight: 700;
          padding: 9px 16px; border-radius: 10px; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .refresh-btn:hover { border-color: rgba(250,204,21,0.25); color: #94a3b8; }
        .logout-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15);
          color: #f87171; font-size: 12px; font-weight: 700;
          padding: 9px 16px; border-radius: 10px; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); }

        .stats-row {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px; margin-bottom: 28px;
          animation: fadeUp 0.4s 0.05s ease both;
        }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; }
        .stat-label { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
        .stat-value { font-size: 28px; font-weight: 800; color: var(--text); line-height: 1; }
        .stat-value.gold   { color: var(--gold); }
        .stat-value.green  { color: var(--green); }
        .stat-value.orange { color: var(--orange); }
        .stat-value.amber  { color: var(--amber); }

        .controls { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; animation: fadeUp 0.4s 0.1s ease both; }
        .search-input {
          flex: 1; min-width: 200px;
          background: var(--surface); border: 1px solid var(--border2);
          border-radius: 10px; padding: 10px 14px;
          color: var(--text); font-size: 13px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .search-input:focus { border-color: rgba(250,204,21,0.35); }
        .search-input::placeholder { color: #334155; }
        .filter-select {
          background: var(--surface); border: 1px solid var(--border2);
          border-radius: 10px; padding: 10px 14px;
          color: var(--muted); font-size: 13px; font-family: 'DM Sans', sans-serif;
          outline: none; cursor: pointer;
        }
        .filter-select:focus { border-color: rgba(250,204,21,0.35); }

        .tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; animation: fadeUp 0.4s 0.12s ease both; }
        .tab-btn {
          padding: 8px 18px; border-radius: 999px;
          border: 1px solid var(--border2); background: var(--surface2);
          color: var(--muted); font-size: 12px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .tab-btn:hover { border-color: rgba(250,204,21,0.2); color: #94a3b8; }
        .tab-btn.active { background: rgba(250,204,21,0.08); border-color: rgba(250,204,21,0.28); color: var(--gold); }

        .results-label { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 10px; }

        .orders-list { display: flex; flex-direction: column; gap: 10px; }

        .order-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden;
          animation: cardIn 0.3s ease both;
          transition: border-color 0.2s;
        }
        .order-card:hover { border-color: #1e2d45; }
        .order-card.puja-card   { border-left: 3px solid rgba(249,115,22,0.5); }
        .order-card.cheena-card { border-left: 3px solid rgba(251,191,36,0.5); }

        .card-header {
          display: flex; align-items: center; gap: 12px;
          padding: 15px 18px; cursor: pointer; transition: background 0.15s;
        }
        .card-header:hover { background: rgba(255,255,255,0.02); }

        .type-badge {
          font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 3px 9px; border-radius: 999px; white-space: nowrap; flex-shrink: 0;
        }
        .type-badge.puja   { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); color: var(--orange); }
        .type-badge.cheena { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: var(--amber); }

        .card-main { flex: 1; min-width: 0; }
        .card-name { font-size: 14px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-sub  { font-size: 12px; color: var(--muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .card-price { font-size: 15px; font-weight: 800; color: var(--gold); }
        .card-time  { font-size: 10px; color: #334155; font-weight: 600; }

        .status-pill {
          font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
          padding: 3px 10px; border-radius: 999px; white-space: nowrap;
        }
        .expand-icon { color: #334155; font-size: 13px; flex-shrink: 0; transition: transform 0.2s; }
        .expand-icon.open { transform: rotate(180deg); }

        .card-detail {
          border-top: 1px solid var(--border);
          padding: 18px 20px;
          background: rgba(255,255,255,0.01);
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        @media (max-width: 560px) { .card-detail { grid-template-columns: 1fr; } }

        .dg { display: flex; flex-direction: column; gap: 3px; }
        .dg.full { grid-column: 1 / -1; }
        .dl { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #334155; }
        .dv { font-size: 13px; color: #94a3b8; font-weight: 600; line-height: 1.5; }

        .items-panel {
          grid-column: 1 / -1;
          background: rgba(250,204,21,0.03); border: 1px solid rgba(250,204,21,0.08);
          border-radius: 10px; padding: 12px 14px;
        }
        .items-panel-label { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #334155; margin-bottom: 8px; }
        .item-mini-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px; color: #475569; padding: 4px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .item-mini-row:last-child { border-bottom: none; }
        .item-mini-price { color: var(--gold); font-weight: 700; }

        .status-changer {
          grid-column: 1 / -1;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          padding-top: 10px; border-top: 1px solid var(--border);
        }
        .sc-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #334155; }
        .status-select {
          background: var(--surface2); border: 1px solid var(--border2);
          border-radius: 8px; padding: 7px 12px;
          color: var(--text); font-size: 12px; font-family: 'DM Sans', sans-serif;
          outline: none; cursor: pointer;
        }
        .order-id { font-size: 11px; color: #1e293b; font-weight: 600; margin-left: auto; }

        .state-box { text-align: center; padding: 60px 20px; color: #334155; font-size: 14px; }
        .state-emoji { font-size: 44px; margin-bottom: 12px; }
        .spinner {
          width: 24px; height: 24px; border: 2px solid rgba(250,204,21,0.15);
          border-top-color: var(--gold); border-radius: 50%;
          animation: spin 0.7s linear infinite; margin: 0 auto 14px;
        }
      `}</style>

      <div className="admin-page">

        <div className="page-title-row">
          <div>
            <p className="page-eyebrow">Admin Dashboard</p>
            <h1 className="page-title">Orders</h1>
          </div>
          <div className="title-actions">
            <button className="refresh-btn" onClick={load}>↺ Refresh</button>
            <button className="logout-btn" onClick={handleLogout}>🔒 Lock</button>
          </div>
        </div>

        {!loading && !error && (
          <div className="stats-row">
            <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{stats.total}</div></div>
            <div className="stat-card"><div className="stat-label">Puja Kit</div><div className="stat-value orange">{stats.puja}</div></div>
            <div className="stat-card"><div className="stat-label">Cheena</div><div className="stat-value amber">{stats.cheena}</div></div>
            <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value gold">{stats.pending}</div></div>
            <div className="stat-card"><div className="stat-label">Confirmed</div><div className="stat-value green">{stats.confirmed}</div></div>
          </div>
        )}

        <div className="controls">
          <input
            className="search-input"
            placeholder="🔍  Search name, phone, puja…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="tabs">
          {[['all','🙏 All'], ['puja','🪔 Puja Samagri'], ['cheena','✨ Cheena']].map(([val, label]) => (
            <button key={val} className={`tab-btn${tab === val ? ' active' : ''}`} onClick={() => setTab(val)}>
              {label}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <p className="results-label">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
        )}

        {loading && <div className="state-box"><div className="spinner" />Loading orders…</div>}
        {error   && <div className="state-box"><div className="state-emoji">⚠️</div>{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="state-box"><div className="state-emoji">📭</div>No orders found.</div>
        )}

        {!loading && !error && (
          <div className="orders-list">
            {filtered.map((order, i) => {
              const key    = `${order._type}-${order.id}`;
              const isOpen = expanded === key;
              const isPuja = order._type === 'puja';
              const title  = isPuja ? order.puja_name : order.cheena_name;
              const sub    = isPuja
                ? `${order.puja_name_ne ? order.puja_name_ne + ' · ' : ''}${order.location}`
                : `${order.cheena_type === 'short' ? 'लघु चिना' : 'विस्तृत चिना'} · ${fmt(order.dob)}`;
              const price  = isPuja
                ? (order.total_price ? `₹${order.total_price.toLocaleString()}` : '—')
                : `Rs. ${order.price?.toLocaleString()}`;
              const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;

              return (
                <div key={key} className={`order-card ${isPuja ? 'puja-card' : 'cheena-card'}`}
                  style={{ animationDelay: `${i * 0.025}s` }}>

                  <div className="card-header" onClick={() => setExpanded(isOpen ? null : key)}>
                    <span className={`type-badge ${isPuja ? 'puja' : 'cheena'}`}>
                      {isPuja ? '🪔 Puja' : '✨ Cheena'}
                    </span>
                    <div className="card-main">
                      <div className="card-name">{order.name}</div>
                      <div className="card-sub">{title} · {order.phone}</div>
                    </div>
                    <div className="card-right">
                      <span className="card-price">{price}</span>
                      <span className="status-pill" style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
                        {order.status}
                      </span>
                      <span className="card-time">{fmtTime(order.created_at)}</span>
                    </div>
                    <span className={`expand-icon${isOpen ? ' open' : ''}`}>▾</span>
                  </div>

                  {isOpen && (
                    <div className="card-detail">
                      <div className="dg">
                        <span className="dl">Full Name</span>
                        <span className="dv">{order.name}</span>
                      </div>
                      <div className="dg">
                        <span className="dl">Phone</span>
                        <span className="dv">
                          <a href={`tel:${order.phone}`} style={{ color: '#22c55e', textDecoration: 'none' }}>{order.phone}</a>
                        </span>
                      </div>

                      {isPuja ? (<>
                        <div className="dg">
                          <span className="dl">Puja</span>
                          <span className="dv">{order.puja_name}{order.puja_name_ne ? ` (${order.puja_name_ne})` : ''}</span>
                        </div>
                        <div className="dg">
                          <span className="dl">Date</span>
                          <span className="dv">{fmt(order.date)}</span>
                        </div>
                        <div className="dg full">
                          <span className="dl">Location</span>
                          <span className="dv">{order.location}</span>
                        </div>
                        {order.note && (
                          <div className="dg full">
                            <span className="dl">Note</span>
                            <span className="dv">{order.note}</span>
                          </div>
                        )}
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="items-panel">
                            <div className="items-panel-label">Kit Items ({order.items.length})</div>
                            {order.items.map((it, idx) => (
                              <div key={idx} className="item-mini-row">
                                <span>{it.name} × {it.qty} {it.unit}</span>
                                <span className="item-mini-price">₹{(it.price * it.qty).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>) : (<>
                        <div className="dg">
                          <span className="dl">Cheena Type</span>
                          <span className="dv">{order.cheena_name} — Rs. {order.price?.toLocaleString()}</span>
                        </div>
                        <div className="dg">
                          <span className="dl">Date of Birth</span>
                          <span className="dv">{fmt(order.dob)}</span>
                        </div>
                        {order.tob && (
                          <div className="dg">
                            <span className="dl">Time of Birth</span>
                            <span className="dv">{order.tob}</span>
                          </div>
                        )}
                        {order.pob && (
                          <div className="dg">
                            <span className="dl">Place of Birth</span>
                            <span className="dv">{order.pob}</span>
                          </div>
                        )}
                        {order.nwaran_name && (
                          <div className="dg">
                            <span className="dl">Nwaran Name</span>
                            <span className="dv">{order.nwaran_name}</span>
                          </div>
                        )}
                        {order.message && (
                          <div className="dg full">
                            <span className="dl">Message</span>
                            <span className="dv">{order.message}</span>
                          </div>
                        )}
                      </>)}

                      <div className="status-changer">
                        <span className="sc-label">Status</span>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={e => updateStatus(order._type, order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <span className="order-id">#{order.id} · {fmtTime(order.created_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}