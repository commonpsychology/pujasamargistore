'use client';
// app/account/page.js
// Customer account dashboard — non-sensitive profile info + recent orders
// Editable: display name, phone, address. Email shown read-only. No passwords shown.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';

const STATUS_META = {
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: '⏳' },
  confirmed:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: '✅' },
  dispatched: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',icon: '🚚' },
  delivered:  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: '📦' },
  cancelled:  { color: '#f87171', bg: 'rgba(248,113,113,0.1)',icon: '❌' },
};

export default function AccountPage() {
  const { user, profile, supabase, refreshProfile } = useAuth();

  const [orders,       setOrders]       = useState([]);
  const [ordersLoading,setOrdersLoading]= useState(true);

  // Edit form state
  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState('');
  const [saveErr,     setSaveErr]     = useState('');
  const [form,        setForm]        = useState({ display_name: '', phone: '', address: '' });

  // Seed form when profile loads
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        display_name: profile.display_name || '',
        phone:        profile.phone        || '',
        address:      profile.address      || '',
      });
    }
  }, [profile]);

  // Fetch last 5 orders
  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('id, status, total, created_at, items')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setOrders(data ?? []);
        setOrdersLoading(false);
      });
  }, [user, supabase]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    const { error } = await supabase
      .from('users')
      .update({
        display_name: form.display_name.trim() || null,
        phone:        form.phone.trim()        || null,
        address:      form.address.trim()      || null,
      })
      .eq('id', user.id);

    if (error) {
      setSaveErr('Could not save changes. Please try again.');
    } else {
      setSaveMsg('Saved successfully 🙏');
      refreshProfile();
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3500);
    }
    setSaving(false);
  };

  const displayName = profile?.display_name || profile?.username || '—';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  // Initials for avatar
  const initials = (profile?.display_name || profile?.username || '?').slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;600;800&display=swap');

        .ac-page {
          max-width: 860px;
          margin: 0 auto;
          padding: 48px 24px 100px;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Page header ── */
        .ac-header {
          display: flex; align-items: center; gap: 22px;
          margin-bottom: 40px;
          padding: 28px 32px;
          background: linear-gradient(135deg, #0e1e38 0%, #080d18 100%);
          border: 1px solid #1a2d4a;
          border-radius: 22px;
          position: relative; overflow: hidden;
        }
        .ac-header::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.4), transparent);
        }
        .ac-avatar-wrap {
          width: 68px; height: 68px; flex-shrink: 0; position: relative;
        }
        .ac-avatar {
          width: 68px; height: 68px; border-radius: 50%;
          background: #1a2540;
          border: 2px solid rgba(250,204,21,0.35);
          box-shadow: 0 0 18px rgba(250,204,21,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800; color: #facc15;
          overflow: hidden;
        }
        .ac-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .ac-online {
          position: absolute; bottom: 2px; right: 2px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #22c55e; border: 2px solid #111827;
        }
        .ac-header-info { flex: 1; min-width: 0; }
        .ac-header-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 3px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ac-header-email { font-size: 12px; color: #475569; margin-bottom: 6px; }
        .ac-header-meta  { display: flex; gap: 10px; flex-wrap: wrap; }
        .ac-badge {
          font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase; padding: 3px 9px; border-radius: 6px;
        }
        .ac-header-since { font-size: 11px; color: #334155; align-self: center; }

        /* ── Section card ── */
        .ac-card {
          background: #0c1220;
          border: 1px solid #1a2540;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 18px;
        }
        .ac-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px 16px;
          border-bottom: 1px solid #0f1a2e;
        }
        .ac-card-title {
          display: flex; align-items: center; gap: 9px;
          font-size: 12px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase; color: #facc15;
        }
        .ac-card-title-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #facc15; box-shadow: 0 0 8px rgba(250,204,21,0.5);
        }
        .ac-edit-btn {
          font-size: 11px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; padding: 6px 14px; border-radius: 8px;
          border: 1px solid rgba(250,204,21,0.25);
          background: rgba(250,204,21,0.06); color: #facc15;
          cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .ac-edit-btn:hover { background: rgba(250,204,21,0.12); border-color: rgba(250,204,21,0.4); }
        .ac-edit-btn.cancel { color: #94a3b8; border-color: #1a2d4a; background: transparent; }
        .ac-edit-btn.cancel:hover { background: rgba(255,255,255,0.04); }

        .ac-card-body { padding: 20px 24px; }

        /* ── Info rows ── */
        .ac-row {
          display: grid; grid-template-columns: 140px 1fr;
          gap: 8px; padding: 10px 0;
          border-bottom: 1px solid #0a1525;
          align-items: start;
        }
        .ac-row:last-child { border-bottom: none; }
        .ac-row-label { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: #334155; padding-top: 2px; }
        .ac-row-val   { font-size: 13px; color: #94a3b8; word-break: break-word; }
        .ac-row-val.highlight { color: #f1f5f9; font-weight: 600; }
        .ac-row-val.mono      { font-family: monospace; font-size: 11px; color: #334155; }
        .ac-row-val.empty     { color: #273d58; font-style: italic; }

        /* ── Edit inputs ── */
        .ac-input {
          width: 100%; background: rgba(255,255,255,0.03);
          border: 1px solid #1e3550; border-radius: 10px;
          padding: 9px 13px; color: #f1f5f9; font-size: 13px;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ac-input:focus {
          border-color: rgba(250,204,21,0.38);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.07);
        }
        .ac-input::placeholder { color: #273d58; }

        .ac-save-row {
          display: flex; align-items: center; gap: 12px;
          margin-top: 16px; padding-top: 16px; border-top: 1px solid #0f1a2e;
        }
        .ac-save-btn {
          padding: 10px 22px;
          background: linear-gradient(135deg, #92400e, #b45309, #facc15);
          color: #0f172a; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 800; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
        }
        .ac-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(250,204,21,0.25); }
        .ac-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ac-save-msg { font-size: 12px; color: #4ade80; font-weight: 600; }
        .ac-save-err { font-size: 12px; color: #f87171; font-weight: 600; }

        /* ── Orders mini-list ── */
        .ac-orders-empty { font-size: 13px; color: #334155; padding: 12px 0; text-align: center; }
        .ac-orders-empty a { color: #facc15; text-decoration: none; font-weight: 700; }

        .ac-order-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 12px 0; border-bottom: 1px solid #0a1525;
          flex-wrap: wrap;
        }
        .ac-order-row:last-child { border-bottom: none; }
        .ac-order-id   { font-size: 11px; font-family: monospace; color: #334155; }
        .ac-order-date { font-size: 11px; color: #273d58; margin-top: 2px; }
        .ac-order-status {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
          padding: 3px 10px; border-radius: 20px;
        }
        .ac-order-total { font-size: 13px; font-weight: 800; color: #facc15; white-space: nowrap; }

        .ac-view-all {
          display: block; text-align: center; margin-top: 16px;
          font-size: 12px; font-weight: 700; color: #475569;
          text-decoration: none; letter-spacing: 0.5px;
          padding: 10px; border-radius: 10px; border: 1px solid #0f1a2e;
          transition: color 0.2s, border-color 0.2s;
        }
        .ac-view-all:hover { color: #facc15; border-color: rgba(250,204,21,0.2); }

        /* ── Stats strip ── */
        .ac-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 12px; margin-bottom: 18px;
        }
        @media(max-width:500px){ .ac-stats{ grid-template-columns: 1fr 1fr; } }
        .ac-stat {
          background: #0c1220; border: 1px solid #1a2540;
          border-radius: 14px; padding: 18px 20px;
          text-align: center;
        }
        .ac-stat-val { font-size: 26px; font-weight: 800; color: #facc15; line-height: 1; margin-bottom: 5px; }
        .ac-stat-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #334155; }

        @keyframes acSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .ac-spinner { width: 24px; height: 24px; border: 2px solid rgba(250,204,21,0.1); border-top-color: #facc15; border-radius: 50%; animation: acSpin 0.7s linear infinite; margin: 20px auto; }
      `}</style>

      <div className="ac-page">

        {/* ── Profile header ── */}
        <div className="ac-header">
          <div className="ac-avatar-wrap">
            <div className="ac-avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={displayName} />
                : initials
              }
            </div>
            <div className="ac-online" />
          </div>
          <div className="ac-header-info">
            <p className="ac-header-name">{displayName}</p>
            <p className="ac-header-email">{user?.email}</p>
            <div className="ac-header-meta">
              <span
                className="ac-badge"
                style={{ background: '#1a2540', color: '#94a3b8' }}
              >
                Customer
              </span>
              <span className="ac-header-since">Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="ac-stats">
          <div className="ac-stat">
            <p className="ac-stat-val">{ordersLoading ? '…' : orders.length}</p>
            <p className="ac-stat-label">Recent Orders</p>
          </div>
          <div className="ac-stat">
            <p className="ac-stat-val">
              {ordersLoading ? '…' : orders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="ac-stat-label">Delivered</p>
          </div>
          <div className="ac-stat">
            <p className="ac-stat-val">
              {ordersLoading ? '…'
                : orders.length > 0
                  ? `₹${Math.round(orders.reduce((s, o) => s + Number(o.total), 0)).toLocaleString()}`
                  : '₹0'
              }
            </p>
            <p className="ac-stat-label">Total Spent</p>
          </div>
        </div>

        {/* ── Profile info card ── */}
        <div className="ac-card">
          <div className="ac-card-head">
            <div className="ac-card-title">
              <div className="ac-card-title-dot" />
              Profile Information
            </div>
            {!editing
              ? <button className="ac-edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>
              : <button className="ac-edit-btn cancel" onClick={() => { setEditing(false); setSaveErr(''); }}>✕ Cancel</button>
            }
          </div>
          <div className="ac-card-body">

            {/* Always read-only rows */}
            <div className="ac-row">
              <span className="ac-row-label">Username</span>
              <span className="ac-row-val highlight">@{profile?.username || '—'}</span>
            </div>
            <div className="ac-row">
              <span className="ac-row-label">Email</span>
              <span className="ac-row-val highlight">{user?.email || '—'}</span>
            </div>
            <div className="ac-row">
              <span className="ac-row-label">User ID</span>
              <span className="ac-row-val mono">{user?.id?.slice(0, 16)}…</span>
            </div>
            <div className="ac-row">
              <span className="ac-row-label">Joined</span>
              <span className="ac-row-val">{memberSince}</span>
            </div>

            {/* Editable rows */}
            {!editing ? (
              <>
                <div className="ac-row">
                  <span className="ac-row-label">Display Name</span>
                  <span className={`ac-row-val ${profile?.display_name ? 'highlight' : 'empty'}`}>
                    {profile?.display_name || 'Not set'}
                  </span>
                </div>
                <div className="ac-row">
                  <span className="ac-row-label">Phone</span>
                  <span className={`ac-row-val ${profile?.phone ? '' : 'empty'}`}>
                    {profile?.phone || 'Not set'}
                  </span>
                </div>
                <div className="ac-row">
                  <span className="ac-row-label">Address</span>
                  <span className={`ac-row-val ${profile?.address ? '' : 'empty'}`}>
                    {profile?.address || 'Not set'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="ac-row">
                  <span className="ac-row-label">Display Name</span>
                  <input
                    className="ac-input"
                    value={form.display_name}
                    onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="ac-row">
                  <span className="ac-row-label">Phone</span>
                  <input
                    className="ac-input"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="९८XXXXXXXX"
                  />
                </div>
                <div className="ac-row">
                  <span className="ac-row-label">Address</span>
                  <input
                    className="ac-input"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Kathmandu, Bagmati Province"
                  />
                </div>
                <div className="ac-save-row">
                  <button className="ac-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : '🙏 Save Changes'}
                  </button>
                  {saveErr && <span className="ac-save-err">⚠️ {saveErr}</span>}
                </div>
              </>
            )}

            {saveMsg && (
              <p className="ac-save-msg" style={{ marginTop: 12 }}>✓ {saveMsg}</p>
            )}
          </div>
        </div>

        {/* ── Security note ── */}
        <div className="ac-card" style={{ marginBottom: 18 }}>
          <div className="ac-card-head">
            <div className="ac-card-title">
              <div className="ac-card-title-dot" />
              Security
            </div>
          </div>
          <div className="ac-card-body">
            <div className="ac-row">
              <span className="ac-row-label">Password</span>
              <span className="ac-row-val">
                <span style={{ letterSpacing: 3, color: '#334155' }}>••••••••</span>
                &nbsp;
                <a href="/forgot-password" style={{ fontSize: 11, color: '#475569', textDecoration: 'none', fontWeight: 700 }}>
                  Change →
                </a>
              </span>
            </div>
            <div className="ac-row">
              <span className="ac-row-label">Auth Provider</span>
              <span className="ac-row-val">Email / Password</span>
            </div>
          </div>
        </div>

        {/* ── Recent orders card ── */}
        <div className="ac-card">
          <div className="ac-card-head">
            <div className="ac-card-title">
              <div className="ac-card-title-dot" />
              Recent Orders
            </div>
            <Link href="/account/orders" style={{ fontSize: 11, fontWeight: 800, color: '#475569', textDecoration: 'none', letterSpacing: 1 }}>
              View All →
            </Link>
          </div>
          <div className="ac-card-body">
            {ordersLoading && <div className="ac-spinner" />}

            {!ordersLoading && orders.length === 0 && (
              <p className="ac-orders-empty">
                No orders yet. <a href="/shop">Shop now →</a>
              </p>
            )}

            {!ordersLoading && orders.map(order => {
              const st = STATUS_META[order.status] ?? STATUS_META.pending;
              return (
                <div key={order.id} className="ac-order-row">
                  <div>
                    <p className="ac-order-id">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="ac-order-date">
                      {new Date(order.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div
                    className="ac-order-status"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.icon}&nbsp;{order.status}
                  </div>
                  <p className="ac-order-total">₹ {Number(order.total).toLocaleString()}</p>
                </div>
              );
            })}

            {!ordersLoading && orders.length > 0 && (
              <Link href="/account/orders" className="ac-view-all">
                View all orders →
              </Link>
            )}
          </div>
        </div>

      </div>
    </>
  );
}