'use client';
// app/account/orders/page.js
// Full order history for the logged-in customer — fetched by user_id.

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const STATUS_META = {
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.25)',  icon: '⏳', label: 'Pending'    },
  confirmed:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   border: 'rgba(96,165,250,0.25)',  icon: '✅', label: 'Confirmed'  },
  dispatched: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',  border: 'rgba(167,139,250,0.25)', icon: '🚚', label: 'Dispatched' },
  delivered:  { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   border: 'rgba(74,222,128,0.25)',  icon: '📦', label: 'Delivered'  },
  completed:  { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   border: 'rgba(74,222,128,0.25)',  icon: '🎉', label: 'Completed'  },
  cancelled:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)',  border: 'rgba(248,113,113,0.25)', icon: '❌', label: 'Cancelled'  },
};

// Progress tracker only shows these 4 linear steps
const PROGRESS_STEPS = ['pending', 'confirmed', 'dispatched', 'delivered'];

const TABS = ['all', 'pending', 'confirmed', 'dispatched', 'delivered', 'completed', 'cancelled'];
const PER_PAGE = 8;

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function fmtRs(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-IN');
}
function shortId(id) {
  return id ? String(id).slice(0, 8).toUpperCase() : '—';
}

// ── Order Detail Modal ────────────────────────────────────────────────────────
function OrderModal({ order: initialOrder, onClose, supabase }) {
  const [order, setOrder] = useState(initialOrder);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch latest status when modal opens
  useEffect(() => {
    if (!initialOrder?.id || !supabase) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRefreshing(true);
    supabase
      .from('orders')
      .select(
        'id, order_status, total_amount, subtotal, delivery_charge, created_at, items, ' +
        'delivery_address, customer_phone, customer_name, notes, payment_reference, payment_status'
      )
      .eq('id', initialOrder.id)
      .single()
      .then(({ data }) => {
        if (data) setOrder(data);
        setRefreshing(false);
      });
  }, [initialOrder?.id, supabase]);

  const handleRefresh = () => {
    if (!supabase) return;
    setRefreshing(true);
    supabase
      .from('orders')
      .select(
        'id, order_status, total_amount, subtotal, delivery_charge, created_at, items, ' +
        'delivery_address, customer_phone, customer_name, notes, payment_reference, payment_status'
      )
      .eq('id', order.id)
      .single()
      .then(({ data }) => {
        if (data) setOrder(data);
        setRefreshing(false);
      });
  };

  const meta = STATUS_META[order.order_status] ?? STATUS_META.pending;
  const items = (() => {
    if (Array.isArray(order.items)) return order.items;
    if (typeof order.items === 'string') {
      try { return JSON.parse(order.items); } catch { return []; }
    }
    return [];
  })();

  // For progress bar: completed maps to delivered visually
  const progressStatus = order.order_status === 'completed' ? 'delivered' : order.order_status;
  const currentIdx = PROGRESS_STEPS.indexOf(progressStatus);
  const isCancelled = order.order_status === 'cancelled';
  const isCompleted = order.order_status === 'completed';

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="aom-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="aom-modal">
        {/* Header */}
        <div className="aom-header">
          <div>
            <p className="aom-order-id">Order #{shortId(order.id)}</p>
            <p className="aom-order-date">{fmtDate(order.created_at)} · {fmtTime(order.created_at)}</p>
          </div>
          <span className="aom-status-badge" style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
            {meta.icon} {meta.label}
          </span>
          <button
            className="aom-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh status"
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'aomSpin 0.7s linear infinite' : 'none' }}>↺</span>
          </button>
          <button className="aom-close" onClick={onClose}>✕</button>
        </div>

        <div className="aom-body">
          {/* Progress tracker */}
          {!isCancelled && (
            <div className="aom-progress">
              {PROGRESS_STEPS.map((s, i) => {
                const done   = isCompleted || i <= currentIdx;
                const active = !isCompleted && i === currentIdx;
                return (
                  <div key={s} className="aom-prog-step">
                    <div className="aom-prog-dot-wrap">
                      {i > 0 && <div className="aom-prog-line" style={{ background: (isCompleted || i <= currentIdx) ? '#facc15' : '#1a2d4a' }} />}
                      <div className="aom-prog-dot" style={{
                        background: done ? '#facc15' : '#1a2d4a',
                        borderColor: active ? '#facc15' : done ? '#facc15' : '#1a2d4a',
                        boxShadow: active ? '0 0 0 4px rgba(250,204,21,0.15)' : 'none',
                      }}>
                        {done && <span style={{ fontSize: 9 }}>✓</span>}
                      </div>
                    </div>
                    <p className="aom-prog-label" style={{ color: done ? '#facc15' : '#334155' }}>
                      {STATUS_META[s].icon} {STATUS_META[s].label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {isCancelled && (
            <div className="aom-cancelled-banner">❌ This order was cancelled</div>
          )}
          {isCompleted && (
            <div className="aom-completed-banner">🎉 This order has been completed!</div>
          )}

          {/* Items */}
          <p className="aom-section-title">Items Ordered</p>
          <div className="aom-items">
            {items.length === 0
              ? <p className="aom-empty-items">No item details available.</p>
              : items.map((item, i) => (
                <div key={i} className="aom-item">
                  <div className="aom-item-img">
                    {item.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 20 }}>🪔</span>
                    }
                  </div>
                  <div className="aom-item-info">
                    <p className="aom-item-name">{item.name || 'Item'}</p>
                    {item.variant && <p className="aom-item-variant">{item.variant}</p>}
                    <p className="aom-item-qty">Qty: {item.qty ?? item.quantity ?? 1}</p>
                  </div>
                  <p className="aom-item-price">{fmtRs((item.price ?? 0) * (item.qty ?? item.quantity ?? 1))}</p>
                </div>
              ))
            }
          </div>

          {/* Totals */}
          <div className="aom-totals">
            <div className="aom-total-row">
              <span>Subtotal</span>
              <span>{fmtRs(order.subtotal ?? order.total_amount)}</span>
            </div>
            <div className="aom-total-row">
              <span>Delivery</span>
              <span style={{ color: Number(order.delivery_charge) === 0 ? '#4ade80' : '#f1f5f9' }}>
                {Number(order.delivery_charge) === 0 ? 'Free' : fmtRs(order.delivery_charge)}
              </span>
            </div>
            <div className="aom-total-row aom-grand">
              <span>Total</span>
              <span>{fmtRs(order.total_amount)}</span>
            </div>
          </div>

          {/* Delivery info */}
          {(order.delivery_address || order.customer_phone || order.notes) && (
            <>
              <p className="aom-section-title" style={{ marginTop: 20 }}>Delivery Details</p>
              <div className="aom-delivery-card">
                {order.delivery_address && (
                  <div className="aom-drow"><span>📍</span><span>{order.delivery_address}</span></div>
                )}
                {order.customer_phone && (
                  <div className="aom-drow"><span>📞</span><span>{order.customer_phone}</span></div>
                )}
                {order.customer_name && (
                  <div className="aom-drow"><span>👤</span><span>{order.customer_name}</span></div>
                )}
                {order.notes && (
                  <div className="aom-drow"><span>📝</span><span style={{ fontStyle: 'italic', color: '#64748b' }}>{order.notes}</span></div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AccountOrdersPage() {
  const { user, profile, supabase } = useAuth();

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState('all');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('orders')
      .select(
        'id, order_status, total_amount, subtotal, delivery_charge, created_at, items, ' +
        'delivery_address, customer_phone, customer_name, notes, payment_reference, payment_status'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (err) {
      console.error('Orders fetch error:', err);
      setError('Could not load orders. Please try again.');
      setOrders([]);
    } else {
      setOrders(data ?? []);
    }
    setLoading(false);
  }, [user, supabase]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // When modal closes, refresh the list so card statuses update too
  const handleModalClose = useCallback(() => {
    setSelected(null);
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab !== 'all') list = list.filter(o => o.order_status === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        String(o.id).toLowerCase().includes(q) ||
        (o.payment_reference || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageOrders = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [tab, search]);

  const counts = useMemo(() => {
    const c = { all: orders.length };
    TABS.slice(1).forEach(s => { c[s] = orders.filter(o => o.order_status === s).length; });
    return c;
  }, [orders]);

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'Customer';

  if (!user && !loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080d18', color: '#475569', fontFamily: 'DM Sans, sans-serif', gap: 16, padding: 24 }}>
        <span style={{ fontSize: 48 }}>🔑</span>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Please sign in to view your orders</p>
        <Link href="/login" style={{ background: '#facc15', color: '#0f172a', fontWeight: 800, padding: '10px 24px', borderRadius: 12, textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .ao-emoji, .ao-tab .tab-icon, .aom-prog-label, .aom-drow span:first-child {
          font-family: "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Android Emoji",EmojiSymbols,sans-serif !important;
        }
        .ao-page {
          min-height: 100vh; background: #080d18;
          overflow-x: hidden; width: 100%;
          padding: 32px 16px 64px; color: #f1f5f9; box-sizing: border-box;
        }
        .ao-inner { max-width: 860px; margin: 0 auto; width: 100%; box-sizing: border-box; }

        .ao-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #334155; margin-bottom: 28px; flex-wrap: wrap; }
        .ao-breadcrumb a { color: #475569; text-decoration: none; }
        .ao-breadcrumb a:hover { color: #facc15; }
        .ao-breadcrumb span { color: #1a2d4a; }

        .ao-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; gap: 12px; flex-wrap: wrap; }
        .ao-header-left {}
        .ao-title { font-size: 26px; font-weight: 800; color: #f1f5f9; margin-bottom: 4px; }
        .ao-sub   { font-size: 13px; color: #475569; }
        .ao-refresh-btn {
          background: #0d1b2e; border: 1px solid #1a2d4a; color: #475569;
          font-size: 12px; font-weight: 700; padding: 9px 16px; border-radius: 10px;
          cursor: pointer; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        }
        .ao-refresh-btn:hover { border-color: rgba(250,204,21,0.3); color: #facc15; }
        .ao-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ao-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; width: 100%; }
        .ao-tab {
          padding: 7px 12px; border-radius: 20px; border: 1px solid #1a2d4a;
          font-size: 12px; font-weight: 700; cursor: pointer;
          background: transparent; color: #475569;
          transition: all 0.15s; display: flex; align-items: center; gap: 5px;
          font-family: inherit; white-space: nowrap;
        }
        .ao-tab:hover  { border-color: #2a3d5a; color: #94a3b8; }
        .ao-tab.active { background: rgba(250,204,21,0.1); border-color: rgba(250,204,21,0.3); color: #facc15; }
        .ao-tab-count  { background: rgba(255,255,255,0.06); border-radius: 10px; padding: 1px 7px; font-size: 10px; font-weight: 800; }
        .ao-tab.active .ao-tab-count { background: rgba(250,204,21,0.15); }

        .ao-search-wrap { position: relative; margin-bottom: 18px; }
        .ao-search-ico  { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.35; font-family: "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif !important; }
        .ao-search {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid #1a2d4a;
          border-radius: 12px; padding: 11px 13px 11px 40px;
          color: #f1f5f9; font-size: 13px; font-family: inherit; outline: none;
          transition: border-color 0.18s; box-sizing: border-box;
        }
        .ao-search::placeholder { color: #1e3550; }
        .ao-search:focus { border-color: rgba(250,204,21,0.35); }

        .ao-list { display: flex; flex-direction: column; gap: 12px; }
        .ao-card {
          background: linear-gradient(135deg, #0d1b2e 0%, #080f1e 100%);
          border: 1px solid #1a2d4a; border-radius: 16px;
          padding: 18px 20px; cursor: pointer;
          transition: border-color 0.18s, transform 0.15s, box-shadow 0.18s;
          overflow: hidden; width: 100%; box-sizing: border-box;
        }
        .ao-card:hover { border-color: rgba(250,204,21,0.25); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }

        .ao-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .ao-card-id   { font-size: 13px; font-weight: 800; color: #f1f5f9; margin-bottom: 3px; }
        .ao-card-date { font-size: 11px; color: #334155; }
        .ao-status-pill { padding: 4px 11px; border-radius: 20px; font-size: 11px; font-weight: 800; white-space: nowrap; flex-shrink: 0; }

        .ao-card-items { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 12px; }
        .ao-card-item-chip { background: rgba(255,255,255,0.04); border: 1px solid #1a2d4a; border-radius: 8px; padding: 4px 10px; font-size: 11px; color: #64748b; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ao-card-item-more { background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.12); border-radius: 8px; padding: 4px 10px; font-size: 11px; color: #facc15; }

        .ao-card-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #0f1a2e; }
        .ao-card-total { font-size: 16px; font-weight: 800; color: #facc15; }
        .ao-card-total-label { font-size: 11px; color: #334155; margin-bottom: 2px; }
        .ao-view-btn { font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 5px; transition: color 0.15s; }
        .ao-card:hover .ao-view-btn { color: #facc15; }

        .ao-empty { text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.02); border: 1px dashed #1a2d4a; border-radius: 16px; }
        .ao-empty-icon  { font-size: 48px; margin-bottom: 14px; display: block; opacity: 0.5; font-family: "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif !important; }
        .ao-empty-title { font-size: 16px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        .ao-empty-sub   { font-size: 13px; color: #334155; }

        .ao-loading { display: flex; flex-direction: column; gap: 12px; }
        .ao-skel { background: linear-gradient(90deg, #0d1b2e 25%, #111f35 50%, #0d1b2e 75%); background-size: 200% 100%; border-radius: 16px; border: 1px solid #1a2d4a; animation: aoSkel 1.4s ease infinite; }
        @keyframes aoSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .ao-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; flex-wrap: wrap; }
        .ao-page-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #1a2d4a; background: transparent; color: #475569; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; display: flex; align-items: center; justify-content: center; }
        .ao-page-btn:hover:not(:disabled)  { border-color: rgba(250,204,21,0.3); color: #facc15; }
        .ao-page-btn.active { background: rgba(250,204,21,0.1); border-color: rgba(250,204,21,0.35); color: #facc15; }
        .ao-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .ao-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 16px 20px; color: #f87171; font-size: 13px; font-weight: 600; margin-bottom: 20px; }

        /* ── Modal ── */
        @keyframes aomSpin { to { transform: rotate(360deg); } }
        .aom-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(4,8,15,0.85); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; animation: aomFade 0.2s ease; overflow-y: auto;
        }
        @keyframes aomFade { from{opacity:0} to{opacity:1} }
        .aom-modal {
          background: #0c1525; border: 1px solid #1a2d4a; border-radius: 22px;
          width: min(540px, calc(100vw - 32px)); max-height: 88vh; overflow-y: auto;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7);
          animation: aomSlide 0.28s cubic-bezier(0.16,1,0.3,1); box-sizing: border-box;
        }
        .aom-modal::-webkit-scrollbar { width: 4px; }
        .aom-modal::-webkit-scrollbar-track { background: transparent; }
        .aom-modal::-webkit-scrollbar-thumb { background: #1a2d4a; border-radius: 4px; }
        @keyframes aomSlide { from{transform:translateY(20px) scale(0.97);opacity:0} to{transform:none;opacity:1} }

        .aom-header {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 22px 22px 18px; border-bottom: 1px solid #1a2d4a;
          position: sticky; top: 0; background: #0c1525; z-index: 10;
        }
        .aom-header > div:first-child { flex: 1; }
        .aom-order-id   { font-size: 16px; font-weight: 800; color: #f1f5f9; }
        .aom-order-date { font-size: 11px; color: #334155; margin-top: 2px; }
        .aom-status-badge { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; flex-shrink: 0; align-self: center; }
        .aom-refresh-btn {
          background: rgba(255,255,255,0.04); border: 1px solid #1a2d4a;
          border-radius: 8px; width: 30px; height: 30px; color: #475569;
          cursor: pointer; font-size: 14px; display: flex; align-items: center;
          justify-content: center; transition: all 0.15s; flex-shrink: 0; align-self: center;
        }
        .aom-refresh-btn:hover:not(:disabled) { border-color: rgba(250,204,21,0.3); color: #facc15; }
        .aom-refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .aom-close {
          background: rgba(255,255,255,0.05); border: 1px solid #1a2d4a;
          border-radius: 8px; width: 30px; height: 30px;
          color: #475569; cursor: pointer; font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0; align-self: center;
        }
        .aom-close:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #f87171; }

        .aom-body { padding: 20px 22px 28px; }

        .aom-progress { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; position: relative; }
        .aom-prog-step { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 6px; }
        .aom-prog-dot-wrap { display: flex; align-items: center; width: 100%; justify-content: center; position: relative; }
        .aom-prog-line { position: absolute; right: 50%; width: 100%; height: 2px; top: 50%; transform: translateY(-50%); }
        .aom-prog-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; color: #080d18; position: relative; z-index: 1; flex-shrink: 0; transition: all 0.2s; }
        .aom-prog-label { font-size: 10px; font-weight: 700; text-align: center; line-height: 1.3; }

        .aom-cancelled-banner { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; font-weight: 600; color: #f87171; text-align: center; }
        .aom-completed-banner { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; font-weight: 600; color: #4ade80; text-align: center; }

        .aom-section-title { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #334155; margin-bottom: 12px; }

        .aom-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .aom-item { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid #1a2d4a; border-radius: 12px; padding: 12px; }
        .aom-item-img { width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0; background: #111f35; border: 1px solid #1a2d4a; display: flex; align-items: center; justify-content: center; overflow: hidden; font-family: "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif !important; }
        .aom-item-info { flex: 1; min-width: 0; }
        .aom-item-name    { font-size: 13px; font-weight: 700; color: #e2e8f0; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .aom-item-variant { font-size: 11px; color: #475569; margin-bottom: 2px; }
        .aom-item-qty     { font-size: 11px; color: #334155; }
        .aom-item-price   { font-size: 14px; font-weight: 800; color: #facc15; flex-shrink: 0; }
        .aom-empty-items  { font-size: 13px; color: #334155; text-align: center; padding: 16px; }

        .aom-totals { background: rgba(250,204,21,0.03); border: 1px solid rgba(250,204,21,0.08); border-radius: 12px; padding: 14px 16px; }
        .aom-total-row { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; padding: 4px 0; }
        .aom-grand     { font-size: 16px; font-weight: 800; color: #facc15; border-top: 1px solid #1a2d4a; padding-top: 10px; margin-top: 6px; }

        .aom-delivery-card { background: rgba(255,255,255,0.02); border: 1px solid #1a2d4a; border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
        .aom-drow { display: flex; gap: 10px; font-size: 13px; color: #64748b; }
        .aom-drow span:first-child { flex-shrink: 0; }

        @media (max-width: 480px) {
          .ao-tabs  { gap: 4px; }
          .ao-tab   { padding: 6px 9px; font-size: 11px; }
          .ao-card  { padding: 14px 14px; }
          .ao-title { font-size: 22px; }
          .aom-progress { gap: 2px; }
          .aom-prog-label { font-size: 8px; }
          .aom-header { padding: 16px 16px 14px; }
          .aom-body   { padding: 16px 16px 24px; }
        }
      `}</style>

      <div className="ao-page">
        <div className="ao-inner">

          <div className="ao-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/account">Account</Link>
            <span>›</span>
            <span style={{ color: '#facc15' }}>My Orders</span>
          </div>

          <div className="ao-header">
            <div className="ao-header-left">
              <h1 className="ao-title">📦 My Orders</h1>
              <p className="ao-sub">
                {loading ? 'Loading…' : `${counts.all} order${counts.all !== 1 ? 's' : ''} placed by ${displayName}`}
              </p>
            </div>
            <button className="ao-refresh-btn" onClick={fetchOrders} disabled={loading}>
              <span style={{ display: 'inline-block', animation: loading ? 'aomSpin 0.7s linear infinite' : 'none' }}>↺</span>
              Refresh
            </button>
          </div>

          {error && <div className="ao-error">⚠️ {error}</div>}

          {loading && (
            <div className="ao-loading">
              {[1,2,3,4].map(i => <div key={i} className="ao-skel" style={{ height: 90 + (i % 2) * 20 }} />)}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="ao-tabs">
                {TABS.map(t => (
                  <button key={t} className={`ao-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                    <span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>
                      {t === 'all' ? '🗂️' : STATUS_META[t]?.icon}
                    </span>
                    {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
                    {counts[t] > 0 && <span className="ao-tab-count">{counts[t]}</span>}
                  </button>
                ))}
              </div>

              <div className="ao-search-wrap">
                <span className="ao-search-ico">🔍</span>
                <input
                  className="ao-search"
                  type="text"
                  placeholder="Search by order ID or reference…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {pageOrders.length === 0 ? (
                <div className="ao-empty">
                  <span className="ao-empty-icon">📭</span>
                  <p className="ao-empty-title">
                    {tab === 'all' && !search ? 'No orders yet' : 'No orders found'}
                  </p>
                  <p className="ao-empty-sub">
                    {tab === 'all' && !search
                      ? 'Your orders will appear here once you place them.'
                      : 'Try a different filter or clear the search.'}
                  </p>
                  {tab === 'all' && !search && (
                    <Link href="/shop" style={{ display: 'inline-block', marginTop: 16, background: '#facc15', color: '#0f172a', fontWeight: 800, padding: '10px 24px', borderRadius: 12, textDecoration: 'none', fontSize: 13 }}>
                      🛍️ Start Shopping
                    </Link>
                  )}
                </div>
              ) : (
                <div className="ao-list">
                  {pageOrders.map(order => {
                    const meta  = STATUS_META[order.order_status] ?? STATUS_META.pending;
                    const items = (() => {
                      if (Array.isArray(order.items)) return order.items;
                      if (typeof order.items === 'string') {
                        try { return JSON.parse(order.items); } catch { return []; }
                      }
                      return [];
                    })();
                    const shown = items.slice(0, 3);
                    const extra = items.length - shown.length;
                    return (
                      <div key={order.id} className="ao-card" onClick={() => setSelected(order)}>
                        <div className="ao-card-top">
                          <div>
                            <p className="ao-card-id">Order #{shortId(order.id)}</p>
                            <p className="ao-card-date">{fmtDate(order.created_at)} · {fmtTime(order.created_at)}</p>
                          </div>
                          <span className="ao-status-pill" style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
                            <span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{meta.icon}</span>{' '}
                            {meta.label}
                          </span>
                        </div>

                        {items.length > 0 && (
                          <div className="ao-card-items">
                            {shown.map((item, i) => (
                              <span key={i} className="ao-card-item-chip">
                                {item.name || 'Item'}
                                {(item.qty ?? item.quantity) > 1 ? ` ×${item.qty ?? item.quantity}` : ''}
                              </span>
                            ))}
                            {extra > 0 && <span className="ao-card-item-more">+{extra} more</span>}
                          </div>
                        )}

                        <div className="ao-card-bottom">
                          <div>
                            <p className="ao-card-total-label">Total paid</p>
                            <p className="ao-card-total">{fmtRs(order.total_amount)}</p>
                          </div>
                          <span className="ao-view-btn">View details →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="ao-pagination">
                  <button className="ao-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`ao-page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button className="ao-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected && (
        <OrderModal
          order={selected}
          onClose={handleModalClose}
          supabase={supabase}
        />
      )}
    </>
  );
}