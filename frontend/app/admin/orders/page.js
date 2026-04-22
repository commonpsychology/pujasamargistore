'use client';
// app/admin/orders/page.js
// Shows shop cart orders from the `orders` table.
// Auth: checks sessionStorage admin_staff (set by /admin-login).

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const PAY_COLORS = {
  pending:         { bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)',  text: '#facc15' },
  payment_pending: { bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)',  text: '#fb923c' },
  cod_pending:     { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',  text: '#818cf8' },
  paid:            { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',   text: '#22c55e' },
  failed:          { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',   text: '#f87171' },
};
const ORD_COLORS = {
  pending:   { bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)',  text: '#facc15' },
  confirmed: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',   text: '#22c55e' },
  completed: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',  text: '#818cf8' },
  cancelled: { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',   text: '#f87171' },
};

function fmtTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function pill(map, val) {
  const c = map[val] || map.pending;
  return (
    <span style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {val ?? 'pending'}
    </span>
  );
}

export default function AdminShopOrdersPage() {
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
  return <OrdersDashboard />;
}

function Loading() {
  return (
    <div style={{ background:'#080d18', minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center', color:'#facc15',
      fontFamily:'DM Sans,sans-serif', fontSize:14, gap:10 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ width:18, height:18, borderRadius:'50%', display:'inline-block',
        border:'2px solid rgba(250,204,21,0.15)', borderTopColor:'#facc15',
        animation:'spin 0.7s linear infinite' }} />
      Checking session…
    </div>
  );
}

function OrdersDashboard() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [payFilter,  setPayFilter]  = useState('all');
  const [ordFilter,  setOrdFilter]  = useState('all');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/data?table=orders');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setOrders(json.orders ?? []);
    } catch { setError('Failed to load orders.'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateOrder = async (id, updates) => {
    try {
      await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'orders', id, updates }),
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    } catch {}
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (payFilter !== 'all') list = list.filter(o => o.payment_status === payFilter);
    if (ordFilter !== 'all') list = list.filter(o => o.order_status   === ordFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.customer_name?.toLowerCase().includes(q)    ||
        o.customer_phone?.includes(q)                 ||
        o.payment_reference?.toLowerCase().includes(q)||
        o.delivery_address?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, payFilter, ordFilter, search]);

  const stats = useMemo(() => ({
    total:    orders.length,
    pending:  orders.filter(o => o.order_status   === 'pending').length,
    confirmed:orders.filter(o => o.order_status   === 'confirmed').length,
    paid:     orders.filter(o => o.payment_status === 'paid').length,
    cod:      orders.filter(o => o.payment_method === 'cod').length,
    revenue:  orders.filter(o => o.payment_status === 'paid')
                    .reduce((s, o) => s + (o.total_amount || 0), 0),
  }), [orders]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="ap">

        <div className="ap-header">
          <div>
            <p className="ap-eye">Shop Orders</p>
            <h1 className="ap-title">Cart Orders</h1>
          </div>
          <button className="ap-refresh" onClick={load}>↺ Refresh</button>
        </div>

        {!loading && !error && (
          <div className="ap-stats">
            <Stat label="Total"     value={stats.total}     />
            <Stat label="Pending"   value={stats.pending}   color="gold"  />
            <Stat label="Confirmed" value={stats.confirmed} color="green" />
            <Stat label="Paid"      value={stats.paid}      color="green" />
            <Stat label="COD"       value={stats.cod}       color="amber" />
            <Stat label="Revenue"   value={`Rs.${stats.revenue.toLocaleString()}`} color="gold" />
          </div>
        )}

        <div className="ap-controls">
          <input className="ap-search" placeholder="🔍 Name, phone, ref…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="ap-sel" value={payFilter} onChange={e => setPayFilter(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="pending">Payment Pending</option>
            <option value="payment_pending">Awaiting Payment</option>
            <option value="cod_pending">COD Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          <select className="ap-sel" value={ordFilter} onChange={e => setOrdFilter(e.target.value)}>
            <option value="all">All Order Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading && <StateBox spinner>Loading orders…</StateBox>}
        {error   && <StateBox emoji="⚠️">{error}</StateBox>}
        {!loading && !error && filtered.length === 0 && <StateBox emoji="📭">No orders found.</StateBox>}

        {!loading && !error && (
          <>
            <p className="ap-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
            <div className="ap-list">
              {filtered.map((o, i) => {
                const isOpen = expanded === o.id;
                const items  = Array.isArray(o.items) ? o.items : [];
                return (
                  <div key={o.id} className="ap-card" style={{ animationDelay: `${i*0.02}s` }}>
                    <div className="ap-card-head" onClick={() => setExpanded(isOpen ? null : o.id)}>
                      <div className="ap-card-main">
                        <div className="ap-card-name">{o.customer_name}</div>
                        <div className="ap-card-sub">{o.payment_reference} · {o.customer_phone}</div>
                      </div>
                      <div className="ap-card-right">
                        <span className="ap-price">Rs. {(o.total_amount||0).toLocaleString()}</span>
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end' }}>
                          {pill(PAY_COLORS, o.payment_status)}
                          {pill(ORD_COLORS, o.order_status)}
                        </div>
                        <span className="ap-time">{fmtTime(o.created_at)}</span>
                      </div>
                      <span className={`ap-chevron${isOpen?' open':''}`}>▾</span>
                    </div>

                    {isOpen && (
                      <div className="ap-detail">
                        <DG label="Customer">{o.customer_name}</DG>
                        <DG label="Phone"><a href={`tel:${o.customer_phone}`} style={{color:'#22c55e',textDecoration:'none'}}>{o.customer_phone}</a></DG>
                        <DG label="Address" full>{o.delivery_address}</DG>
                        <DG label="Payment Method">{o.payment_method ?? '—'}</DG>
                        <DG label="Order Ref">{o.payment_reference}</DG>
                        <DG label="Subtotal">Rs. {(o.subtotal||0).toLocaleString()}</DG>
                        <DG label="Delivery">Rs. {(o.delivery_charge||0).toLocaleString()}</DG>
                        <DG label="Total">Rs. {(o.total_amount||0).toLocaleString()}</DG>
                        <DG label="Placed On" full>{fmtTime(o.created_at)}</DG>

                        {items.length > 0 && (
                          <div className="ap-items-panel">
                            <div className="ap-items-label">Items ({items.length})</div>
                            {items.map((it, idx) => (
                              <div key={idx} className="ap-item-row">
                                <span>{it.name}{it.variant ? ` (${it.variant})` : ''} × {it.qty}</span>
                                <span className="ap-item-price">Rs. {((it.price||0)*(it.qty||1)).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="ap-changer">
                          <span className="ap-cl">Payment Status</span>
                          <select className="ap-csel" value={o.payment_status ?? 'pending'}
                            onChange={e => updateOrder(o.id, { payment_status: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="payment_pending">Awaiting Payment</option>
                            <option value="cod_pending">COD Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                          <span className="ap-cl" style={{marginLeft:12}}>Order Status</span>
                          <select className="ap-csel" value={o.order_status ?? 'pending'}
                            onChange={e => updateOrder(o.id, { order_status: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span className="ap-oid" style={{marginLeft:'auto'}}>#{o.id}</span>
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
    <div className="ap-stat">
      <div className="ap-stat-label">{label}</div>
      <div className={`ap-stat-value${color ? ` ${color}` : ''}`}>{value}</div>
    </div>
  );
}
function DG({ label, children, full }) {
  return (
    <div className={`ap-dg${full?' full':''}`}>
      <span className="ap-dl">{label}</span>
      <span className="ap-dv">{children}</span>
    </div>
  );
}
function StateBox({ children, emoji, spinner }) {
  return (
    <div className="ap-state">
      {spinner && <><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="ap-spinner" /></>}
      {emoji && <div className="ap-emoji">{emoji}</div>}
      {children}
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --gold:#facc15; --green:#22c55e; --amber:#fbbf24;
    --bg:#080d18; --surface:#0c1220; --surface2:#111827;
    --border:#1a2540; --border2:#1e293b; --muted:#475569; --text:#f1f5f9;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes cardIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

  .ap { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; padding:40px 28px 80px; }

  .ap-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; gap:12px; flex-wrap:wrap; animation:fadeUp 0.4s ease both; }
  .ap-eye   { font-size:10px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:var(--gold); margin-bottom:5px; }
  .ap-title { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:700; color:var(--text); line-height:1.1; }
  .ap-refresh { background:var(--surface); border:1px solid var(--border2); color:var(--muted); font-size:12px; font-weight:700; padding:9px 16px; border-radius:10px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .ap-refresh:hover { border-color:rgba(250,204,21,0.25); color:#94a3b8; }

  .ap-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px; margin-bottom:24px; animation:fadeUp 0.4s 0.05s ease both; }
  .ap-stat  { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:14px 16px; }
  .ap-stat-label { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .ap-stat-value { font-size:26px; font-weight:800; color:var(--text); line-height:1; }
  .ap-stat-value.gold  { color:var(--gold); }
  .ap-stat-value.green { color:var(--green); }
  .ap-stat-value.amber { color:var(--amber); }

  .ap-controls { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; animation:fadeUp 0.4s 0.08s ease both; }
  .ap-search { flex:1; min-width:180px; background:var(--surface); border:1px solid var(--border2); border-radius:10px; padding:10px 14px; color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
  .ap-search:focus { border-color:rgba(250,204,21,0.35); }
  .ap-search::placeholder { color:#334155; }
  .ap-sel { background:var(--surface); border:1px solid var(--border2); border-radius:10px; padding:10px 14px; color:var(--muted); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer; }

  .ap-count { font-size:11px; font-weight:700; color:#334155; margin-bottom:10px; }
  .ap-list  { display:flex; flex-direction:column; gap:10px; }

  .ap-card { background:var(--surface); border:1px solid var(--border); border-left:3px solid rgba(34,197,94,0.4); border-radius:16px; overflow:hidden; animation:cardIn 0.3s ease both; transition:border-color 0.2s; }
  .ap-card:hover { border-color:#1e2d45; }
  .ap-card-head { display:flex; align-items:center; gap:12px; padding:15px 18px; cursor:pointer; transition:background 0.15s; }
  .ap-card-head:hover { background:rgba(255,255,255,0.02); }

  .ap-card-main { flex:1; min-width:0; }
  .ap-card-name { font-size:14px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ap-card-sub  { font-size:12px; color:var(--muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ap-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
  .ap-price { font-size:15px; font-weight:800; color:var(--gold); }
  .ap-time  { font-size:10px; color:#334155; font-weight:600; }
  .ap-chevron { color:#334155; font-size:13px; flex-shrink:0; transition:transform 0.2s; }
  .ap-chevron.open { transform:rotate(180deg); }

  .ap-detail { border-top:1px solid var(--border); padding:18px 20px; background:rgba(255,255,255,0.01); display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:560px){ .ap-detail { grid-template-columns:1fr; } }
  .ap-dg      { display:flex; flex-direction:column; gap:3px; }
  .ap-dg.full { grid-column:1/-1; }
  .ap-dl { font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#334155; }
  .ap-dv { font-size:13px; color:#94a3b8; font-weight:600; line-height:1.5; }

  .ap-items-panel { grid-column:1/-1; background:rgba(250,204,21,0.03); border:1px solid rgba(250,204,21,0.08); border-radius:10px; padding:12px 14px; }
  .ap-items-label { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#334155; margin-bottom:8px; }
  .ap-item-row { display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#475569; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.03); }
  .ap-item-row:last-child { border-bottom:none; }
  .ap-item-price { color:var(--gold); font-weight:700; }

  .ap-changer { grid-column:1/-1; display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding-top:10px; border-top:1px solid var(--border); }
  .ap-cl   { font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#334155; }
  .ap-csel { background:var(--surface2); border:1px solid var(--border2); border-radius:8px; padding:7px 12px; color:var(--text); font-size:12px; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer; }
  .ap-oid  { font-size:11px; color:#1e293b; font-weight:600; }

  .ap-state   { text-align:center; padding:60px 20px; color:#334155; font-size:14px; font-family:'DM Sans',sans-serif; }
  .ap-emoji   { font-size:44px; margin-bottom:12px; }
  .ap-spinner { width:24px; height:24px; border:2px solid rgba(250,204,21,0.15); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 14px; }
`;