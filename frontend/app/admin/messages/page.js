'use client';
// app/admin/messages/page.js

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

function fmtT(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_COLORS = {
  pending:   { bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.2)',  text: '#facc15' },
  confirmed: { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#22c55e' },
  completed: { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  text: '#818cf8' },
  cancelled: { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#f87171' },
};

function StatusPill({ status }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
    }}>{status ?? 'pending'}</span>
  );
}

export default function AdminMessagesPage() {
  const router = useRouter();
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
  return <MessagesDashboard />;
}

function Loading() {
  return (
    <div style={{ background: '#080d18', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#facc15',
      fontFamily: 'DM Sans,sans-serif', fontSize: 14, gap: 10 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'inline-block',
        border: '2px solid rgba(250,204,21,0.15)', borderTopColor: '#facc15',
        animation: 'spin 0.7s linear infinite' }} />
      Checking session…
    </div>
  );
}

function MessagesDashboard() {
  const [contacts,   setContacts]   = useState([]);
  const [newsletter, setNewsletter] = useState([]);
  const [cheena,     setCheena]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [tab,        setTab]        = useState('contacts');
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('all');
  const [expanded,   setExpanded]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/data?table=messages');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setContacts(json.contact_messages ?? []);
      setNewsletter(json.newsletter_subscribers ?? json.newsletter ?? []);
      setCheena(json.cheena_orders ?? []);
    } catch (e) {
      setError('Failed to load: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'contact_messages', id, updates: { status: 'read' } }),
      });
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status: 'read' } : c));
    } catch {}
  };

  const updateCheenaStatus = async (id, status) => {
    try {
      await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'cheena_orders', id, updates: { status } }),
      });
      setCheena(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch {}
  };

  const filteredContacts = useMemo(() => {
    let list = contacts;
    if (statusF !== 'all') list = list.filter(c => c.status === statusF);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) || c.message?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, statusF, search]);

  const filteredNewsletter = useMemo(() => {
    if (!search.trim()) return newsletter;
    const q = search.toLowerCase();
    return newsletter.filter(n => n.email?.toLowerCase().includes(q));
  }, [newsletter, search]);

  const filteredCheena = useMemo(() => {
    if (!search.trim()) return cheena;
    const q = search.toLowerCase();
    return cheena.filter(c =>
      c.name?.toLowerCase().includes(q) || c.phone?.includes(q) ||
      c.cheena_name?.toLowerCase().includes(q) || c.nwaran_name?.toLowerCase().includes(q)
    );
  }, [cheena, search]);

  const unread        = contacts.filter(c => c.status === 'unread').length;
  const cheenaPending = cheena.filter(c => c.status === 'pending').length;

  const searchPlaceholder =
    tab === 'contacts'   ? '🔍 Name, email, subject…' :
    tab === 'newsletter' ? '🔍 Email…' :
    '🔍 Name, phone, type…';

  return (
    <>
      <style>{STYLES}</style>
      <div className="ms">

        <div className="ms-header">
          <div>
            <p className="ms-eye">Inbox</p>
            <h1 className="ms-title">Messages & Orders</h1>
          </div>
          <button className="ms-refresh" onClick={load}>↺ Refresh</button>
        </div>

        {!loading && !error && (
          <div className="ms-stats">
            <div className="ms-stat"><div className="ms-sl">Contacts</div><div className="ms-sv">{contacts.length}</div></div>
            <div className="ms-stat"><div className="ms-sl">Unread</div><div className="ms-sv gold">{unread}</div></div>
            <div className="ms-stat"><div className="ms-sl">Subscribers</div><div className="ms-sv green">{newsletter.length}</div></div>
            <div className="ms-stat"><div className="ms-sl">Cheena</div><div className="ms-sv purple">{cheena.length}</div></div>
            <div className="ms-stat"><div className="ms-sl">Pending</div><div className="ms-sv gold">{cheenaPending}</div></div>
          </div>
        )}

        <div className="ms-controls">
          <input className="ms-search" placeholder={searchPlaceholder}
            value={search} onChange={e => setSearch(e.target.value)} />
          {tab === 'contacts' && (
            <select className="ms-sel" value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          )}
        </div>

        <div className="ms-tabs">
          <button className={`ms-tab${tab === 'contacts' ? ' active' : ''}`} onClick={() => setTab('contacts')}>
            ✉️ Contact Messages {unread > 0 && <span className="ms-badge">{unread}</span>}
          </button>
          <button className={`ms-tab${tab === 'newsletter' ? ' active' : ''}`} onClick={() => setTab('newsletter')}>
            📧 Newsletter ({newsletter.length})
          </button>
          <button className={`ms-tab${tab === 'cheena' ? ' active purple' : ''}`} onClick={() => setTab('cheena')}>
            🔮 Cheena Orders ({cheena.length})
            {cheenaPending > 0 && <span className="ms-badge purple">{cheenaPending}</span>}
          </button>
        </div>

        {loading && <State spinner>Loading…</State>}
        {error   && <State emoji="⚠️">{error}</State>}

        {/* ── Contact Messages ── */}
        {!loading && !error && tab === 'contacts' && (
          <>
            <p className="ms-count">{filteredContacts.length} message{filteredContacts.length !== 1 ? 's' : ''}</p>
            {filteredContacts.length === 0 && <State emoji="📭">No messages found.</State>}
            <div className="ms-list">
              {filteredContacts.map((c, i) => {
                const isOpen   = expanded === c.id;
                const isUnread = c.status === 'unread';
                return (
                  <div key={c.id} className={`ms-card${isUnread ? ' unread' : ''}`} style={{ animationDelay: `${i * 0.02}s` }}>
                    <div className="ms-ch" onClick={() => { setExpanded(isOpen ? null : c.id); if (isUnread) markRead(c.id); }}>
                      <div className="ms-cm">
                        <div className="ms-cn">{c.name} {isUnread && <span className="ms-dot" />}</div>
                        <div className="ms-cs">{c.subject || '(no subject)'} · {c.email || c.phone || '—'}</div>
                      </div>
                      <div className="ms-cr">
                        {isUnread
                          ? <span className="ms-pill unread">Unread</span>
                          : <span className="ms-pill read">Read</span>}
                        <span className="ms-time">{fmtT(c.created_at)}</span>
                      </div>
                      <span className={`ms-chev${isOpen ? ' open' : ''}`}>▾</span>
                    </div>
                    {isOpen && (
                      <div className="ms-detail">
                        <DG l="Name">{c.name}</DG>
                        <DG l="Email">{c.email ? <a href={`mailto:${c.email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{c.email}</a> : '—'}</DG>
                        <DG l="Phone">{c.phone ? <a href={`tel:${c.phone}`} style={{ color: '#22c55e', textDecoration: 'none' }}>{c.phone}</a> : '—'}</DG>
                        <DG l="Subject">{c.subject || '—'}</DG>
                        <DG l="Received">{fmtT(c.created_at)}</DG>
                        <DG l="Message" full>
                          <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{c.message}</span>
                        </DG>
                        <div style={{ gridColumn: '1/-1', paddingTop: 10, borderTop: '1px solid #1a2540', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          {c.email && (
                            <a href={`mailto:${c.email}?subject=Re: ${c.subject || 'Your message'}`}
                              style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, textDecoration: 'none' }}>
                              ✉️ Reply by Email
                            </a>
                          )}
                          {c.phone && (
                            <a href={`tel:${c.phone}`}
                              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, textDecoration: 'none' }}>
                              📞 Call
                            </a>
                          )}
                          <span style={{ fontSize: 11, color: '#1e293b', marginLeft: 'auto' }}>#{c.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Newsletter ── */}
        {!loading && !error && tab === 'newsletter' && (
          <>
            <p className="ms-count">{filteredNewsletter.length} subscriber{filteredNewsletter.length !== 1 ? 's' : ''}</p>
            {filteredNewsletter.length === 0 && <State emoji="📭">No subscribers found.</State>}
            <div className="ms-nl-grid">
              {filteredNewsletter.map((n, i) => (
                <div key={n.id ?? i} className="ms-nl-card" style={{ animationDelay: `${i * 0.015}s` }}>
                  <div className="ms-nl-email">{n.email}</div>
                  <div className="ms-nl-time">{fmtT(n.subscribed_at ?? n.created_at)}</div>
                  {n.is_active === false && (
                    <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>INACTIVE</span>
                  )}
                  <a href={`mailto:${n.email}`} className="ms-nl-btn">✉️ Email</a>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Cheena Orders ── */}
        {!loading && !error && tab === 'cheena' && (
          <>
            <p className="ms-count">{filteredCheena.length} order{filteredCheena.length !== 1 ? 's' : ''}</p>
            {filteredCheena.length === 0 && <State emoji="🔮">No cheena orders found.</State>}
            <div className="ms-list">
              {filteredCheena.map((c, i) => {
                const isOpen = expanded === `cheena-${c.id}`;
                return (
                  <div key={c.id} className={`ms-card cheena${c.status === 'pending' ? ' unread' : ''}`} style={{ animationDelay: `${i * 0.02}s` }}>
                    <div className="ms-ch" onClick={() => setExpanded(isOpen ? null : `cheena-${c.id}`)}>
                      <div className="ms-cm">
                        <div className="ms-cn">
                          {c.name}
                          {c.status === 'pending' && <span className="ms-dot purple" />}
                        </div>
                        <div className="ms-cs">{c.cheena_name} · {c.phone}</div>
                      </div>
                      <div className="ms-cr">
                        <StatusPill status={c.status} />
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#c084fc' }}>Rs. {c.price}</span>
                        <span className="ms-time">{fmtT(c.created_at)}</span>
                      </div>
                      <span className={`ms-chev${isOpen ? ' open' : ''}`}>▾</span>
                    </div>
                    {isOpen && (
                      <div className="ms-detail">
                        <DG l="Full Name">{c.name}</DG>
                        <DG l="Phone"><a href={`tel:${c.phone}`} style={{ color: '#22c55e', textDecoration: 'none' }}>{c.phone}</a></DG>
                        <DG l="Cheena Type">{c.cheena_name}</DG>
                        <DG l="Price">Rs. {c.price}</DG>
                        <DG l="Date of Birth">{c.dob}</DG>
                        <DG l="Time of Birth">{c.tob || '—'}</DG>
                        <DG l="Place of Birth">{c.pob || '—'}</DG>
                        <DG l="Nwaran Name">{c.nwaran_name || '—'}</DG>
                        <DG l="Submitted">{fmtT(c.created_at)}</DG>
                        {c.message && (
                          <DG l="Message" full>
                            <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{c.message}</span>
                          </DG>
                        )}
                        <div style={{ gridColumn: '1/-1', paddingTop: 10, borderTop: '1px solid #1a2540', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <a href={`tel:${c.phone}`}
                            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, textDecoration: 'none' }}>
                            📞 Call
                          </a>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#475569' }}>Status</span>
                            <select
                              className="ms-sel"
                              value={c.status ?? 'pending'}
                              onChange={e => updateCheenaStatus(c.id, e.target.value)}
                              style={{ padding: '6px 12px', fontSize: 12 }}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <span style={{ fontSize: 11, color: '#1e293b' }}>#{c.id}</span>
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

function DG({ l, children, full }) {
  return (
    <div className={`ms-dg${full ? ' full' : ''}`}>
      <span className="ms-dl">{l}</span>
      <span className="ms-dv">{children}</span>
    </div>
  );
}

function State({ children, emoji, spinner }) {
  return (
    <div className="ms-state">
      {spinner && <><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div className="ms-spinner" /></>}
      {emoji && <div style={{ fontSize: 44, marginBottom: 12 }}>{emoji}</div>}
      {children}
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #facc15; --green: #22c55e; --blue: #60a5fa; --purple: #c084fc;
    --bg: #080d18; --surface: #0c1220; --surface2: #111827;
    --border: #1a2540; --border2: #1e293b; --muted: #475569; --text: #f1f5f9;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
  @keyframes cardIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
  @keyframes spin    { to { transform:rotate(360deg) } }

  .ms { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; padding:40px 28px 80px; }

  .ms-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; gap:12px; flex-wrap:wrap; animation:fadeUp 0.4s ease both; }
  .ms-eye    { font-size:10px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:var(--gold); margin-bottom:5px; }
  .ms-title  { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:700; color:var(--text); line-height:1.1; }
  .ms-refresh { background:var(--surface); border:1px solid var(--border2); color:var(--muted); font-size:12px; font-weight:700; padding:9px 16px; border-radius:10px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .ms-refresh:hover { border-color:rgba(250,204,21,0.25); color:#94a3b8; }

  .ms-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:10px; margin-bottom:24px; animation:fadeUp 0.4s 0.05s ease both; }
  .ms-stat  { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:14px 16px; }
  .ms-sl    { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .ms-sv    { font-size:26px; font-weight:800; color:var(--text); line-height:1; }
  .ms-sv.gold   { color:var(--gold); }
  .ms-sv.green  { color:var(--green); }
  .ms-sv.purple { color:var(--purple); }

  .ms-controls { display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
  .ms-search   { flex:1; min-width:180px; background:var(--surface); border:1px solid var(--border2); border-radius:10px; padding:10px 14px; color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
  .ms-search:focus { border-color:rgba(250,204,21,0.35); }
  .ms-search::placeholder { color:#334155; }
  .ms-sel { background:var(--surface); border:1px solid var(--border2); border-radius:10px; padding:10px 14px; color:var(--muted); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer; }

  .ms-tabs { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
  .ms-tab  { padding:8px 18px; border-radius:999px; border:1px solid var(--border2); background:var(--surface2); color:var(--muted); font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:6px; }
  .ms-tab:hover  { border-color:rgba(250,204,21,0.2); color:#94a3b8; }
  .ms-tab.active { background:rgba(250,204,21,0.08); border-color:rgba(250,204,21,0.28); color:var(--gold); }
  .ms-tab.active.purple { background:rgba(192,132,252,0.08); border-color:rgba(192,132,252,0.28); color:var(--purple); }

  .ms-badge        { background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#f87171; font-size:9px; font-weight:800; padding:2px 7px; border-radius:999px; }
  .ms-badge.purple { background:rgba(192,132,252,0.15); border:1px solid rgba(192,132,252,0.3); color:var(--purple); }

  .ms-count { font-size:11px; font-weight:700; color:#334155; margin-bottom:10px; }
  .ms-list  { display:flex; flex-direction:column; gap:8px; }

  .ms-card         { background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; animation:cardIn 0.3s ease both; transition:border-color 0.2s; }
  .ms-card:hover   { border-color:#1e2d45; }
  .ms-card.unread  { border-left:3px solid rgba(250,204,21,0.5); }
  .ms-card.cheena  { border-left:3px solid rgba(192,132,252,0.3); }
  .ms-card.cheena.unread { border-left:3px solid rgba(192,132,252,0.6); }

  .ms-ch       { display:flex; align-items:center; gap:12px; padding:14px 18px; cursor:pointer; transition:background 0.15s; }
  .ms-ch:hover { background:rgba(255,255,255,0.02); }
  .ms-cm       { flex:1; min-width:0; }
  .ms-cn       { font-size:14px; font-weight:700; color:var(--text); display:flex; align-items:center; gap:7px; }
  .ms-dot         { width:7px; height:7px; border-radius:50%; background:var(--gold); display:inline-block; flex-shrink:0; }
  .ms-dot.purple  { background:var(--purple); }
  .ms-cs       { font-size:12px; color:var(--muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ms-cr       { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }

  .ms-pill        { font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:3px 10px; border-radius:999px; }
  .ms-pill.unread { background:rgba(250,204,21,0.08); border:1px solid rgba(250,204,21,0.2); color:var(--gold); }
  .ms-pill.read   { background:rgba(71,85,105,0.1); border:1px solid rgba(71,85,105,0.2); color:#475569; }

  .ms-time  { font-size:10px; color:#334155; font-weight:600; }
  .ms-chev      { color:#334155; font-size:13px; flex-shrink:0; transition:transform 0.2s; }
  .ms-chev.open { transform:rotate(180deg); }

  .ms-detail { border-top:1px solid var(--border); padding:18px 20px; background:rgba(255,255,255,0.01); display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:560px) { .ms-detail { grid-template-columns:1fr; } }
  .ms-dg      { display:flex; flex-direction:column; gap:3px; }
  .ms-dg.full { grid-column:1/-1; }
  .ms-dl { font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#334155; }
  .ms-dv { font-size:13px; color:#94a3b8; font-weight:600; line-height:1.5; }

  .ms-nl-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:10px; }
  .ms-nl-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:14px 16px; animation:cardIn 0.3s ease both; display:flex; flex-direction:column; gap:6px; }
  .ms-nl-email { font-size:14px; font-weight:700; color:var(--text); word-break:break-all; }
  .ms-nl-time  { font-size:11px; color:#334155; }
  .ms-nl-btn   { align-self:flex-start; background:rgba(96,165,250,0.07); border:1px solid rgba(96,165,250,0.18); color:var(--blue); font-size:11px; font-weight:700; padding:5px 12px; border-radius:8px; text-decoration:none; transition:all 0.2s; margin-top:2px; cursor:pointer; }
  .ms-nl-btn:hover { background:rgba(96,165,250,0.12); }

  .ms-state   { text-align:center; padding:60px 20px; color:#334155; font-size:14px; font-family:'DM Sans',sans-serif; }
  .ms-spinner { width:24px; height:24px; border:2px solid rgba(250,204,21,0.15); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 14px; }
`;