'use client';
// app/admin/puja-orders/page.js
// FIX vi: Admin dashboard tab for puja_orders table
// Auth: checks sessionStorage admin_staff (same pattern as shop orders)

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_COLORS = {
  pending:   { bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)',  text: '#facc15' },
  confirmed: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',   text: '#22c55e' },
  completed: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',  text: '#818cf8' },
  cancelled: { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',   text: '#f87171' },
};

function fmtTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function pill(val) {
  const c = STATUS_COLORS[val] ?? STATUS_COLORS.pending;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
    }}>
      {val ?? 'pending'}
    </span>
  );
}

export default function AdminPujaOrdersPage() {
  const router  = useRouter();
  const [staff,   setStaff]   = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('admin_staff');
      if (s) {
        const p = JSON.parse(s);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (p?.role === 'admin') { setStaff(p); }
        else { router.replace('/admin-login'); }
      } else { router.replace('/admin-login'); }
    } catch { router.replace('/admin-login'); }
    setChecked(true);
  }, [router]);

  if (!checked || !staff) return <Loading />;
  return <PujaOrdersDashboard />;
}

function Loading() {
  return (
    <div style={{
      background: '#080d18', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#facc15', fontFamily: 'DM Sans,sans-serif', fontSize: 14, gap: 10,
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{
        width: 18, height: 18, borderRadius: '50%', display: 'inline-block',
        border: '2px solid rgba(250,204,21,0.15)', borderTopColor: '#facc15',
        animation: 'spin 0.7s linear infinite',
      }} />
      Checking session…
    </div>
  );
}

function PujaOrdersDashboard() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/data?table=puja_orders');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      // API returns the table key — handle both `puja_orders` and generic `data`
      setOrders(json.puja_orders ?? json.data ?? json.orders ?? []);
    } catch {
      setError('Failed to load puja orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateOrder = async (id, updates) => {
    try {
      await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'puja_orders', id, updates }),
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    } catch {}
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== 'all') list = list.filter(o => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.name?.toLowerCase().includes(q)      ||
        o.phone?.includes(q)                   ||
        o.puja_name?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filter, search]);

  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue:   orders.filter(o => o.status === 'completed')
                     .reduce((s, o) => s + (Number(o.total_price) || 0), 0),
  }), [orders]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="pp">

        <div className="pp-header">
          <div>
            <p className="pp-eye">Puja Services</p>
            <h1 className="pp-title">Puja Orders</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href="/admin/orders" className="pp-tab-link">Shop Orders</a>
            <button className="pp-refresh" onClick={load}>↺ Refresh</button>
          </div>
        </div>

        {!loading && !error && (
          <div className="pp-stats">
            <Stat label="Total"     value={stats.total}     />
            <Stat label="Pending"   value={stats.pending}   color="gold"  />
            <Stat label="Confirmed" value={stats.confirmed} color="green" />
            <Stat label="Completed" value={stats.completed} color="purple" />
            <Stat label="Revenue"   value={`Rs.${stats.revenue.toLocaleString()}`} color="gold" />
          </div>
        )}

        <div className="pp-controls">
          <input className="pp-search" placeholder="🔍 Name, phone, puja, location…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="pp-sel" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading && <StateBox spinner>Loading puja orders…</StateBox>}
        {error   && <StateBox emoji="⚠️">{error}</StateBox>}
        {!loading && !error && filtered.length === 0 && <StateBox emoji="🙏">No puja orders found.</StateBox>}

        {!loading && !error && (
          <>
            <p className="pp-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
            <div className="pp-list">
              {filtered.map((o, i) => {
                const isOpen = expanded === o.id;
                const items  = Array.isArray(o.items)
                  ? o.items
                  : (typeof o.items === 'string' ? (() => { try { return JSON.parse(o.items); } catch { return []; } })() : []);

                return (
                  <div key={o.id} className="pp-card" style={{ animationDelay: `${i * 0.02}s` }}>
                    <div className="pp-card-head" onClick={() => setExpanded(isOpen ? null : o.id)}>
                      <div className="pp-card-main">
                        <div className="pp-card-puja">{o.puja_name}{o.puja_name_ne ? ` — ${o.puja_name_ne}` : ''}</div>
                        <div className="pp-card-name">{o.name} · {o.phone}</div>
                        <div className="pp-card-sub">
                          📍 {o.location} &nbsp;·&nbsp;
                          📅 {fmtDate(o.date)}
                        </div>
                      </div>
                      <div className="pp-card-right">
                        {o.total_price
                          ? <span className="pp-price">Rs. {Number(o.total_price).toLocaleString()}</span>
                          : <span className="pp-price" style={{ color: '#475569' }}>—</span>
                        }
                        {pill(o.status)}
                        <span className="pp-time">{fmtTime(o.created_at)}</span>
                      </div>
                      <span className={`pp-chevron${isOpen ? ' open' : ''}`}>▾</span>
                    </div>

                    {isOpen && (
                      <div className="pp-detail">
                        <DG label="Customer Name">{o.name}</DG>
                        <DG label="Phone">
                          <a href={`tel:${o.phone}`} style={{ color: '#22c55e', textDecoration: 'none' }}>{o.phone}</a>
                        </DG>
                        <DG label="Puja Type" full>{o.puja_name}{o.puja_name_ne ? ` (${o.puja_name_ne})` : ''}</DG>
                        <DG label="Location" full>{o.location}</DG>
                        <DG label="Date">{fmtDate(o.date)}</DG>
                        <DG label="Total Price">
                          {o.total_price ? `Rs. ${Number(o.total_price).toLocaleString()}` : 'Not quoted'}
                        </DG>
                        {o.note && <DG label="Note" full>{o.note}</DG>}
                        <DG label="Booked On" full>{fmtTime(o.created_at)}</DG>

                        {/* Items / samagri list if present */}
                        {items.length > 0 && (
                          <div className="pp-items-panel">
                            <div className="pp-items-label">Samagri / Items ({items.length})</div>
                            {items.map((it, idx) => (
                              <div key={idx} className="pp-item-row">
                                <span>{it.name || it.item || JSON.stringify(it)}</span>
                                {it.price && <span className="pp-item-price">Rs. {Number(it.price).toLocaleString()}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pp-changer">
                          <span className="pp-cl">Status</span>
                          <select className="pp-csel" value={o.status ?? 'pending'}
                            onChange={e => updateOrder(o.id, { status: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span className="pp-oid" style={{ marginLeft: 'auto' }}>#{o.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="pp-stat">
      <div className="pp-stat-label">{label}</div>
      <div className={`pp-stat-value${color ? ` ${color}` : ''}`}>{value}</div>
    </div>
  );
}
function DG({ label, children, full }) {
  return (
    <div className={`pp-dg${full ? ' full' : ''}`}>
      <span className="pp-dl">{label}</span>
      <span className="pp-dv">{children}</span>
    </div>
  );
}
function StateBox({ children, emoji, spinner }) {
  return (
    <div className="pp-state">
      {spinner && <><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div className="pp-spinner" /></>}
      {emoji && <div className="pp-emoji">{emoji}</div>}
      {children}
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --gold:#facc15; --green:#22c55e; --amber:#fbbf24; --purple:#a78bfa;
    --bg:#080d18; --surface:#0c1220; --surface2:#111827;
    --border:#1a2540; --border2:#1e293b; --muted:#475569; --text:#f1f5f9;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes cardIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

  .pp { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; padding:40px 28px 80px; overflow-x:hidden; }

  .pp-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; gap:12px; flex-wrap:wrap; animation:fadeUp 0.4s ease both; }
  .pp-eye   { font-size:10px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:var(--purple); margin-bottom:5px; }
  .pp-title { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:700; color:var(--text); line-height:1.1; }
  .pp-refresh { background:var(--surface); border:1px solid var(--border2); color:var(--muted); font-size:12px; font-weight:700; padding:9px 16px; border-radius:10px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .pp-refresh:hover { border-color:rgba(167,139,250,0.25); color:#94a3b8; }
  .pp-tab-link { background:rgba(167,139,250,0.08); border:1px solid rgba(167,139,250,0.2); color:var(--purple); font-size:12px; font-weight:700; padding:9px 16px; border-radius:10px; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .pp-tab-link:hover { background:rgba(167,139,250,0.14); }

  .pp-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px; margin-bottom:24px; animation:fadeUp 0.4s 0.05s ease both; }
  .pp-stat  { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:14px 16px; }
  .pp-stat-label { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .pp-stat-value { font-size:26px; font-weight:800; color:var(--text); line-height:1; }
  .pp-stat-value.gold   { color:var(--gold); }
  .pp-stat-value.green  { color:var(--green); }
  .pp-stat-value.purple { color:var(--purple); }

  .pp-controls { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; animation:fadeUp 0.4s 0.08s ease both; }
  .pp-search { flex:1; min-width:180px; background:var(--surface); border:1px solid var(--border2); border-radius:10px; padding:10px 14px; color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
  .pp-search:focus { border-color:rgba(167,139,250,0.35); }
  .pp-search::placeholder { color:#334155; }
  .pp-sel { background:var(--surface); border:1px solid var(--border2); border-radius:10px; padding:10px 14px; color:var(--muted); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer; }

  .pp-count { font-size:11px; font-weight:700; color:#334155; margin-bottom:10px; }
  .pp-list  { display:flex; flex-direction:column; gap:10px; }

  .pp-card { background:var(--surface); border:1px solid var(--border); border-left:3px solid rgba(167,139,250,0.4); border-radius:16px; overflow:hidden; animation:cardIn 0.3s ease both; transition:border-color 0.2s; }
  .pp-card:hover { border-color:#1e2d45; }
  .pp-card-head { display:flex; align-items:center; gap:12px; padding:15px 18px; cursor:pointer; transition:background 0.15s; }
  .pp-card-head:hover { background:rgba(255,255,255,0.02); }

  .pp-card-main { flex:1; min-width:0; }
  .pp-card-puja { font-size:14px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px; }
  .pp-card-name { font-size:13px; font-weight:600; color:#94a3b8; margin-bottom:2px; }
  .pp-card-sub  { font-size:11px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pp-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
  .pp-price { font-size:15px; font-weight:800; color:var(--gold); }
  .pp-time  { font-size:10px; color:#334155; font-weight:600; }
  .pp-chevron { color:#334155; font-size:13px; flex-shrink:0; transition:transform 0.2s; }
  .pp-chevron.open { transform:rotate(180deg); }

  .pp-detail { border-top:1px solid var(--border); padding:18px 20px; background:rgba(255,255,255,0.01); display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:560px){ .pp-detail { grid-template-columns:1fr; } }
  .pp-dg      { display:flex; flex-direction:column; gap:3px; }
  .pp-dg.full { grid-column:1/-1; }
  .pp-dl { font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#334155; }
  .pp-dv { font-size:13px; color:#94a3b8; font-weight:600; line-height:1.5; }

  .pp-items-panel { grid-column:1/-1; background:rgba(167,139,250,0.03); border:1px solid rgba(167,139,250,0.1); border-radius:10px; padding:12px 14px; }
  .pp-items-label { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#334155; margin-bottom:8px; }
  .pp-item-row { display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#475569; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.03); }
  .pp-item-row:last-child { border-bottom:none; }
  .pp-item-price { color:var(--gold); font-weight:700; }

  .pp-changer { grid-column:1/-1; display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding-top:10px; border-top:1px solid var(--border); }
  .pp-cl   { font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#334155; }
  .pp-csel { background:var(--surface2); border:1px solid var(--border2); border-radius:8px; padding:7px 12px; color:var(--text); font-size:12px; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer; }
  .pp-oid  { font-size:11px; color:#1e293b; font-weight:600; }

  .pp-state   { text-align:center; padding:60px 20px; color:#334155; font-size:14px; font-family:'DM Sans',sans-serif; }
  .pp-emoji   { font-size:44px; margin-bottom:12px; }
  .pp-spinner { width:24px; height:24px; border:2px solid rgba(167,139,250,0.15); border-top-color:var(--purple); border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 14px; }
`;