'use client';
// app/checkout/page.js
// IMPORTANT: clearCart() is NOT called here.
// Cart is cleared only in payment/page.js after the user confirms payment.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const FREE_DELIVERY_THRESHOLD = 2000;
const DELIVERY_CHARGE = 120;

export default function Checkout() {
  const router = useRouter();
  const { cart, cartTotal, cartCount, removeFromCart, setQty, clearCart } = useCart();
  const { user, profile, supabase } = useAuth();

  const deliveryCharge = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const grandTotal     = cartTotal + deliveryCharge;

  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error,   setError]   = useState('');
  const [mounted, setMounted] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Auto-fill from profile (users table) or auth metadata
  useEffect(() => {
    if (!user) return;

    // Try profile row first (public.users table)
    const profileName  = profile?.full_name?.trim()    || profile?.display_name?.trim() || profile?.username?.trim() || '';
    const profilePhone = profile?.phone?.trim()         || '';

    // Fallback: Supabase auth user_metadata
    const metaName  = user.user_metadata?.full_name?.trim() || user.user_metadata?.name?.trim() || '';
    const metaPhone = user.user_metadata?.phone?.trim()     || '';

    const resolvedName  = profileName  || metaName  || '';
    const resolvedPhone = profilePhone || metaPhone || '';

    if (!name.trim())  setName(resolvedName);
    if (!phone.trim()) setPhone(resolvedPhone);

    // Flag if profile is incomplete so we can show a nudge
    if (!resolvedName || !resolvedPhone) setProfileIncomplete(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user]);

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in your name, phone, and address.');
      return;
    }
    setError('');
    setPlacing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          cartTotal,
          deliveryCharge,
          grandTotal,
          paymentMethod:   'pending',
          customerName:    name,
          customerPhone:   phone,
          customerAddress: address,
          userId:          user?.id ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      // Save name+phone back to users table so future forms are pre-filled
      if (user?.id && supabase) {
        const updates = {};
        if (!profile?.full_name?.trim() && name.trim())  updates.full_name = name.trim();
        if (!profile?.phone?.trim()     && phone.trim()) updates.phone     = phone.trim();
        if (Object.keys(updates).length > 0) {
          supabase.from('users').update(updates).eq('id', user.id).then(() => {});
        }
      }

      const params = new URLSearchParams({
        orderId:  data.orderId,
        orderRef: data.orderRef,
        total:    grandTotal,
        name,
        phone,
        address,
      });
      router.push(`/payment?${params.toString()}`);

    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  };

  return (
    <>
      <style href="checkout-styles" precedence="default">{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        * { box-sizing: border-box; }

        .checkout-page {
          font-family: 'DM Sans', sans-serif;
          background: #080d18; color: #f1f5f9;
          min-height: 100vh; padding: 48px 24px 80px;
          max-width: 900px; margin: 0 auto;
        }
        .top-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
        .back-btn {
          background: #111827; border: 1px solid #1f2937; color: #94a3b8;
          padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, color 0.2s;
        }
        .back-btn:hover { border-color: #334155; color: #f1f5f9; }
        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 42px); font-weight: 700; color: #facc15; margin: 0;
        }
        .item-count-label { color: #475569; font-size: 13px; margin-left: auto; }

        .empty-state { text-align: center; padding: 100px 20px; color: #334155; }
        .empty-state .emoji { font-size: 56px; margin-bottom: 16px; }
        .empty-state p { font-size: 16px; margin: 0 0 24px; }
        .shop-btn {
          background: linear-gradient(135deg, #854d0e, #facc15); color: #0f172a;
          border: none; padding: 14px 28px; border-radius: 12px; font-size: 15px;
          font-weight: 800; cursor: pointer; font-family: 'DM Sans', sans-serif;
        }

        .profile-nudge {
          background: rgba(250,204,21,0.06);
          border: 1px solid rgba(250,204,21,0.18);
          border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;
          font-size: 13px; color: #94a3b8;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          flex-wrap: wrap;
        }
        .profile-nudge a {
          color: #facc15; font-weight: 700; text-decoration: none;
          white-space: nowrap; font-size: 12px;
        }
        .profile-nudge a:hover { text-decoration: underline; }

        .delivery-banner {
          border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;
          font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 12px;
        }
        .delivery-banner.free  { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #22c55e; }
        .delivery-banner.paid  { background: rgba(250,204,21,0.07); border: 1px solid rgba(250,204,21,0.2); color: #facc15; }
        .progress-track { flex: 1; height: 6px; background: #1e293b; border-radius: 999px; overflow: hidden; }
        .progress-fill  {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #facc15, #22c55e); transition: width 0.4s ease;
        }

        .cart-list  { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
        .cart-item  {
          display: flex; align-items: center; gap: 16px;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid #1e293b; border-radius: 16px; padding: 16px; transition: border-color 0.2s;
        }
        .cart-item:hover { border-color: #334155; }
        .item-thumb {
          width: 60px; height: 60px; border-radius: 10px;
          background: linear-gradient(135deg, #1e1a0e, #2d2510);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; flex-shrink: 0; overflow: hidden;
        }
        .item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .item-info   { flex: 1; min-width: 0; }
        .item-name   {
          font-size: 14px; font-weight: 800; color: #f1f5f9;
          margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .item-meta   { font-size: 11px; color: #475569; font-weight: 600; }
        .qty-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .qty-btn {
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid #334155;
          background: #111827; color: #94a3b8; font-size: 16px; font-weight: 800;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: border-color 0.15s, color 0.15s; font-family: inherit; line-height: 1;
        }
        .qty-btn:hover { border-color: #facc15; color: #facc15; }
        .qty-num     { font-size: 14px; font-weight: 800; color: #f1f5f9; min-width: 24px; text-align: center; }
        .item-total  { font-size: 15px; font-weight: 900; color: #facc15; flex-shrink: 0; min-width: 70px; text-align: right; }
        .remove-btn  {
          background: none; border: none; color: #334155; font-size: 18px;
          cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.15s; line-height: 1;
        }
        .remove-btn:hover { color: #ef4444; }

        .form-card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid #1e293b; border-radius: 20px; padding: 24px; margin-bottom: 24px;
        }
        .form-title  {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 700; color: #facc15; margin: 0 0 18px;
        }
        .form-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group  { margin-bottom: 14px; }
        .form-label  {
          font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;
          letter-spacing: 0.5px; display: block; margin-bottom: 6px;
        }
        .form-input  {
          width: 100%; background: #0f172a; border: 1px solid #1e293b;
          border-radius: 10px; padding: 11px 14px; color: #f1f5f9;
          font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s;
        }
        .form-input:focus       { border-color: rgba(250,204,21,0.4); }
        .form-input::placeholder { color: #334155; }
        .autofill-tag {
          display: inline-block; font-size: 9px; font-weight: 800;
          letter-spacing: 1px; text-transform: uppercase;
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);
          color: #22c55e; padding: 1px 7px; border-radius: 999px;
          margin-left: 6px; vertical-align: middle;
        }
        .saved-tag {
          display: inline-block; font-size: 9px; font-weight: 800;
          letter-spacing: 1px; text-transform: uppercase;
          background: rgba(250,204,21,0.08); border: 1px solid rgba(250,204,21,0.2);
          color: #facc15; padding: 1px 7px; border-radius: 999px;
          margin-left: 6px; vertical-align: middle;
        }

        .summary-card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid #1e293b; border-radius: 20px; padding: 28px;
        }
        .summary-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 700; color: #facc15; margin: 0 0 20px;
        }
        .summary-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px; font-size: 14px; color: #64748b;
        }
        .summary-row.total {
          color: #f1f5f9; font-size: 18px; font-weight: 900;
          margin-top: 16px; padding-top: 16px; border-top: 1px solid #1e293b;
        }
        .summary-row.total span:last-child { color: #facc15; }
        .free-tag    { color: #22c55e; font-weight: 700; }
        .savings-tag {
          font-size: 11px; color: #22c55e; font-weight: 700;
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);
          padding: 2px 8px; border-radius: 999px;
        }
        .error-msg {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
          color: #ef4444; border-radius: 10px; padding: 12px 16px;
          font-size: 13px; font-weight: 600; margin-bottom: 14px;
        }
        .cta-group { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .place-order-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #854d0e, #facc15);
          color: #0f172a; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 800; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .place-order-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .place-order-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(250,204,21,0.3); }
        .clear-btn {
          width: 100%; padding: 12px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          color: #ef4444; border-radius: 12px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .clear-btn:hover { background: rgba(239,68,68,0.15); }

        @media (max-width: 520px) {
          .item-meta { display: none; }
          .cart-item { padding: 12px; gap: 10px; }
          .item-thumb { width: 48px; height: 48px; font-size: 22px; }
          .form-row   { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="checkout-page">
        <div className="top-bar">
          <button className="back-btn" onClick={() => router.push('/shop')}>← Back to Shop</button>
          <h1 className="page-title">🛒 Cart</h1>
          {mounted && cartCount > 0 && (
            <span className="item-count-label">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {mounted && cart.length === 0 && (
          <div className="empty-state">
            <div className="emoji">🛒</div>
            <p>Your cart is empty</p>
            <button className="shop-btn" onClick={() => router.push('/shop')}>🪔 Browse Products</button>
          </div>
        )}

        {mounted && cart.length > 0 && (
          <>
            {/* Profile incomplete nudge */}
            {user && profileIncomplete && (
              <div className="profile-nudge">
                <span>💡 Save your name & phone in your profile so forms fill automatically next time.</span>
                <a href="/account/settings">Complete Profile →</a>
              </div>
            )}

            {deliveryCharge === 0 ? (
              <div className="delivery-banner free">
                <span>🎉</span>
                <span>You qualify for FREE delivery!</span>
              </div>
            ) : (
              <div className="delivery-banner paid">
                <span>🚚</span>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '6px' }}>
                    Add <strong>Rs. {FREE_DELIVERY_THRESHOLD - cartTotal}</strong> more for free delivery
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill"
                      style={{ width: `${Math.min((cartTotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            )}

            <div className="cart-list">
              {cart.map(({ key, product, qty }) => {
                const imageSrc = product.image_url ||
                  (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
                return (
                  <div className="cart-item" key={key}>
                    <div className="item-thumb">
                      {imageSrc
                        ? <img src={imageSrc} alt={product.name}
                            onError={e => { e.target.style.display = 'none'; }} />
                        : <span>{product.emoji || '🪔'}</span>}
                    </div>
                    <div className="item-info">
                      <p className="item-name">{product.name}</p>
                      <p className="item-meta">{product.category} · Rs. {product.price} each</p>
                    </div>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => setQty(key, qty - 1)}>−</button>
                      <span className="qty-num">{qty}</span>
                      <button className="qty-btn" onClick={() => setQty(key, qty + 1)}>+</button>
                    </div>
                    <div className="item-total">Rs. {product.price * qty}</div>
                    <button className="remove-btn" onClick={() => removeFromCart(key)}>✕</button>
                  </div>
                );
              })}
            </div>

            <div className="form-card">
              <p className="form-title">📦 Delivery Details</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Your Name
                    {name && profile?.full_name?.trim() ? <span className="autofill-tag">auto-filled</span>
                      : name ? <span className="saved-tag">will be saved</span> : null}
                  </label>
                  <input className="form-input" placeholder="Full name"
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Phone Number
                    {phone && profile?.phone?.trim() ? <span className="autofill-tag">auto-filled</span>
                      : phone ? <span className="saved-tag">will be saved</span> : null}
                  </label>
                  <input className="form-input" placeholder="98XXXXXXXX"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Delivery Address</label>
                <input className="form-input" placeholder="Street, Tole, City"
                  value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>

            <div className="summary-card">
              <p className="summary-title">Order Summary</p>
              <div className="summary-row">
                <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                <span>Rs. {cartTotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                {deliveryCharge === 0
                  ? <span className="free-tag">FREE 🎉</span>
                  : <span>Rs. {deliveryCharge}</span>}
              </div>
              {deliveryCharge === 0 && (
                <div className="summary-row">
                  <span></span>
                  <span className="savings-tag">You saved Rs. {DELIVERY_CHARGE}!</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs. {grandTotal}</span>
              </div>

              {error && <div className="error-msg">⚠️ {error}</div>}

              <div className="cta-group">
                <button className="place-order-btn" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? '⏳ Placing Order...' : `✓ Place Order · Rs. ${grandTotal}`}
                </button>
                <button className="clear-btn" onClick={clearCart}>🗑 Clear Cart</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}