'use client';
// app/admin/bookings/page.js
// Shows puja_orders only.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_COLORS = {
  pending:   { bg:'rgba(250,204,21,0.08)', border:'rgba(250,204,21,0.2)',  text:'#facc15' },
  confirmed: { bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)',   text:'#22c55e' },
  completed: { bg:'rgba(99,102,241,0.08)', border:'rgba(99,102,241,0.2)',  text:'#818cf8' },
  cancelled: { bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)',   text:'#f87171' },
};

function fmt(d)  { if(!d) return '—'; return new Date(d).toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric'}); }
function fmtT(d) { if(!d) return '—'; return new Date(d).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }

export default function AdminBookingsPage() {
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('admin_staff');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (s) { const p = JSON.parse(s); if(p?.role==='admin'){setStaff(p);}else{router.replace('/admin-login');} }
      else { router.replace('/admin-login'); }
    } catch { router.replace('/admin-login'); }
    setChecked(true);
  }, [router]);

  if (!checked || !staff) return <Loading />;
  return <BookingsDashboard />;
}

function Loading() {
  return (
    <div style={{background:'#080d18',minHeight:'100vh',display:'flex',alignItems:'center',
      justifyContent:'center',color:'#facc15',fontFamily:'DM Sans,sans-serif',fontSize:14,gap:10}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{width:18,height:18,borderRadius:'50%',display:'inline-block',
        border:'2px solid rgba(250,204,21,0.15)',borderTopColor:'#facc15',
        animation:'spin 0.7s linear infinite'}} />
      Checking session…
    </div>
  );
}

function BookingsDashboard() {
  const [pujaOrders, setPujaOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [statusF, setStatusF] = useState('all');
  const [search,  setSearch]  = useState('');
  const [expanded,setExpanded]= useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/data?table=puja_orders');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setPujaOrders(json.puja_orders ?? json.data ?? []);
    } catch { setError('Failed to load bookings.'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await fetch('/api/admin/data', {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ table:'puja_orders', id, updates:{ status } }),
      });
      setPujaOrders(prev => prev.map(o => o.id===id ? {...o,status} : o));
    } catch {}
  };

  const filtered = useMemo(() => {
    let list = pujaOrders;
    if (statusF !== 'all') list = list.filter(o => o.status === statusF);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.name?.toLowerCase().includes(q) ||
        o.phone?.includes(q) ||
        o.puja_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pujaOrders, statusF, search]);

  const stats = useMemo(() => ({
    total:    pujaOrders.length,
    pending:  pujaOrders.filter(o=>o.status==='pending').length,
    confirmed:pujaOrders.filter(o=>o.status==='confirmed').length,
    completed:pujaOrders.filter(o=>o.status==='completed').length,
  }), [pujaOrders]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="bk">

        <div className="bk-header">
          <div>
            <p className="bk-eye">Bookings</p>
            <h1 className="bk-title">Puja Orders</h1>
          </div>
          <button className="bk-refresh" onClick={load}>↺ Refresh</button>
        </div>

        {!loading && !error && (
          <div className="bk-stats">
            {[['Total',stats.total],['Pending',stats.pending,'gold'],
              ['Confirmed',stats.confirmed,'green'],['Completed',stats.completed,'indigo']
            ].map(([l,v,c]) => (
              <div key={l} className="bk-stat">
                <div className="bk-sl">{l}</div>
                <div className={`bk-sv${c?' '+c:''}`}>{v}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bk-controls">
          <input className="bk-search" placeholder="🔍 Name, phone, puja…"
            value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="bk-sel" value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading && <State spinner>Loading bookings…</State>}
        {error   && <State emoji="⚠️">{error}</State>}
        {!loading && !error && filtered.length===0 && <State emoji="📭">No bookings found.</State>}

        {!loading && !error && (
          <>
            <p className="bk-count">{filtered.length} booking{filtered.length!==1?'s':''}</p>
            <div className="bk-list">
              {filtered.map((o,i) => {
                const isOpen = expanded === o.id;
                const sc     = STATUS_COLORS[o.status] || STATUS_COLORS.pending;

                return (
                  <div key={o.id} className="bk-card" style={{animationDelay:`${i*0.02}s`}}>
                    <div className="bk-ch" onClick={()=>setExpanded(isOpen?null:o.id)}>
                      <div className="bk-cm">
                        <div className="bk-cn">{o.name}</div>
                        <div className="bk-cs">{o.puja_name} · {o.phone}</div>
                      </div>
                      <div className="bk-cr">
                        <span className="bk-price">{o.total_price ? `Rs. ${o.total_price.toLocaleString()}` : '—'}</span>
                        <span className="bk-pill" style={{background:sc.bg,border:`1px solid ${sc.border}`,color:sc.text}}>{o.status}</span>
                        <span className="bk-time">{fmtT(o.created_at)}</span>
                      </div>
                      <span className={`bk-chev${isOpen?' open':''}`}>▾</span>
                    </div>

                    {isOpen && (
                      <div className="bk-detail">
                        <DG l="Full Name">{o.name}</DG>
                        <DG l="Phone"><a href={`tel:${o.phone}`} style={{color:'#22c55e',textDecoration:'none'}}>{o.phone}</a></DG>
                        <DG l="Puja">{o.puja_name}{o.puja_name_ne?` (${o.puja_name_ne})`:''}</DG>
                        <DG l="Date">{fmt(o.date)}</DG>
                        <DG l="Location" full>{o.location}</DG>
                        {o.note && <DG l="Note" full>{o.note}</DG>}

                        {Array.isArray(o.items) && o.items.length > 0 && (
                          <div className="bk-items">
                            <div className="bk-il">Kit Items ({o.items.length})</div>
                            {o.items.map((it,idx) => (
                              <div key={idx} className="bk-ir">
                                <span>{it.name} × {it.qty} {it.unit}</span>
                                <span className="bk-ip">Rs. {((it.price||0)*(it.qty||1)).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="bk-changer">
                          <span className="bk-cl">Status</span>
                          <select className="bk-csel" value={o.status}
                            onChange={e=>updateStatus(o.id,e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span className="bk-oid">#{o.id} · {fmtT(o.created_at)}</span>
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

function DG({l,children,full}){
  return <div className={`bk-dg${full?' full':''}`}><span className="bk-dl">{l}</span><span className="bk-dv">{children}</span></div>;
}
function State({children,emoji,spinner}){
  return (
    <div className="bk-state">
      {spinner&&<><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div className="bk-spinner"/></>}
      {emoji&&<div style={{fontSize:44,marginBottom:12}}>{emoji}</div>}
      {children}
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--gold:#facc15;--green:#22c55e;--indigo:#818cf8;
    --bg:#080d18;--surface:#0c1220;--surface2:#111827;--border:#1a2540;--border2:#1e293b;--muted:#475569;--text:#f1f5f9;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes cardIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}

  .bk{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding:40px 28px 80px;}
  .bk-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;gap:12px;flex-wrap:wrap;animation:fadeUp 0.4s ease both;}
  .bk-eye{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:5px;}
  .bk-title{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:700;color:var(--text);line-height:1.1;}
  .bk-refresh{background:var(--surface);border:1px solid var(--border2);color:var(--muted);font-size:12px;font-weight:700;padding:9px 16px;border-radius:10px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
  .bk-refresh:hover{border-color:rgba(250,204,21,0.25);color:#94a3b8;}
  .bk-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-bottom:24px;animation:fadeUp 0.4s 0.05s ease both;}
  .bk-stat{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px;}
  .bk-sl{font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
  .bk-sv{font-size:26px;font-weight:800;color:var(--text);line-height:1;}
  .bk-sv.gold{color:var(--gold);}.bk-sv.green{color:var(--green);}.bk-sv.indigo{color:var(--indigo);}
  .bk-controls{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
  .bk-search{flex:1;min-width:180px;background:var(--surface);border:1px solid var(--border2);border-radius:10px;padding:10px 14px;color:var(--text);font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.2s;}
  .bk-search:focus{border-color:rgba(250,204,21,0.35);}
  .bk-search::placeholder{color:#334155;}
  .bk-sel{background:var(--surface);border:1px solid var(--border2);border-radius:10px;padding:10px 14px;color:var(--muted);font-size:13px;font-family:'DM Sans',sans-serif;outline:none;cursor:pointer;}
  .bk-count{font-size:11px;font-weight:700;color:#334155;margin-bottom:10px;}
  .bk-list{display:flex;flex-direction:column;gap:10px;}
  .bk-card{background:var(--surface);border:1px solid var(--border);border-left:3px solid rgba(249,115,22,0.5);border-radius:16px;overflow:hidden;animation:cardIn 0.3s ease both;transition:border-color 0.2s;}
  .bk-card:hover{border-color:#1e2d45;}
  .bk-ch{display:flex;align-items:center;gap:12px;padding:15px 18px;cursor:pointer;transition:background 0.15s;}
  .bk-ch:hover{background:rgba(255,255,255,0.02);}
  .bk-cm{flex:1;min-width:0;}
  .bk-cn{font-size:14px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .bk-cs{font-size:12px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .bk-cr{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
  .bk-price{font-size:15px;font-weight:800;color:var(--gold);}
  .bk-pill{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:999px;white-space:nowrap;}
  .bk-time{font-size:10px;color:#334155;font-weight:600;}
  .bk-chev{color:#334155;font-size:13px;flex-shrink:0;transition:transform 0.2s;}
  .bk-chev.open{transform:rotate(180deg);}
  .bk-detail{border-top:1px solid var(--border);padding:18px 20px;background:rgba(255,255,255,0.01);display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  @media(max-width:560px){.bk-detail{grid-template-columns:1fr;}}
  .bk-dg{display:flex;flex-direction:column;gap:3px;}
  .bk-dg.full{grid-column:1/-1;}
  .bk-dl{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#334155;}
  .bk-dv{font-size:13px;color:#94a3b8;font-weight:600;line-height:1.5;}
  .bk-items{grid-column:1/-1;background:rgba(250,204,21,0.03);border:1px solid rgba(250,204,21,0.08);border-radius:10px;padding:12px 14px;}
  .bk-il{font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#334155;margin-bottom:8px;}
  .bk-ir{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#475569;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);}
  .bk-ir:last-child{border-bottom:none;}
  .bk-ip{color:var(--gold);font-weight:700;}
  .bk-changer{grid-column:1/-1;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--border);}
  .bk-cl{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#334155;}
  .bk-csel{background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:7px 12px;color:var(--text);font-size:12px;font-family:'DM Sans',sans-serif;outline:none;cursor:pointer;}
  .bk-oid{font-size:11px;color:#1e293b;font-weight:600;margin-left:auto;}
  .bk-state{text-align:center;padding:60px 20px;color:#334155;font-size:14px;font-family:'DM Sans',sans-serif;}
  .bk-spinner{width:24px;height:24px;border:2px solid rgba(250,204,21,0.15);border-top-color:var(--gold);border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 14px;}
`;