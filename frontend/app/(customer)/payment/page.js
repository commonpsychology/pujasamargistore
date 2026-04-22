'use client';
// app/payment/page.js
// Reads: orderId, orderRef, total, name, phone, address from URL params
// On confirm: PATCH /api/orders with chosen method + status, then clearCart()

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const QR_IMAGE  = '/images/payment-qr.png';
const ESEWA_ID  = '9849350088';
const KHALTI_ID = '9849350088';

const METHODS = [
  { id: 'qr',     label: 'QR Code',         emoji: '📷', color: '#6366f1', rgb: '99,102,241'  },
  { id: 'esewa',  label: 'eSewa',            emoji: '🟢', color: '#22c55e', rgb: '34,197,94'   },
  { id: 'khalti', label: 'Khalti',           emoji: '🟣', color: '#a855f7', rgb: '168,85,247'  },
  { id: 'cod',    label: 'Cash on Delivery', emoji: '💵', color: '#facc15', rgb: '250,204,21'  },
];

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function PaymentContent() {
  const router         = useRouter();
  const params         = useSearchParams();
  const { clearCart }  = useCart();

  const orderId  = params.get('orderId')  || '';
  const orderRef = params.get('orderRef') || '';   // PS-XXXXXX-XXXX
  const total    = params.get('total')    || '0';
  const name     = params.get('name')     || '';
  const phone    = params.get('phone')    || '';
  const address  = params.get('address')  || '';

  const [selected,  setSelected]  = useState('qr');
  const [saving,    setSaving]    = useState(false);
  const [done,      setDone]      = useState(false);
  const [copied,    setCopied]    = useState('');
  const [orderTime]               = useState(() => Date.now());
  const cartCleared               = useRef(false);

  // Guard: redirect if accessed directly without orderId
  useEffect(() => {
    if (!orderId) router.replace('/shop');
  }, [orderId, router]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:            orderId,
          orderRef:      orderRef,
          status:        selected === 'cod' ? 'cod_pending' : 'payment_pending',
          paymentMethod: selected,
        }),
      });
    } catch (err) {
      console.error('Payment confirm error:', err);
      // Non-fatal — still show success to user, order is already saved
    }

    // ✅ Clear cart only here, after payment is confirmed
    if (!cartCleared.current) {
      clearCart();
      cartCleared.current = true;
    }

    setSaving(false);
    setDone(true);
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────
  if (done) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        @keyframes popIn  { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      `}</style>
      <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#080d18', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ background:'#0c1220', border:'1px solid #1a2540', borderRadius:24, padding:'44px 36px', maxWidth:420, width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:64, animation:'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both', marginBottom:16 }}>🎉</div>
          <p style={{ fontSize:10, fontWeight:800, letterSpacing:3, textTransform:'uppercase', color:'#facc15', marginBottom:6 }}>Order Confirmed</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:700, color:'#f1f5f9', marginBottom:10, animation:'fadeUp 0.4s 0.1s ease both' }}>
            {selected === 'cod' ? 'Cash on Delivery!' : 'Payment Submitted!'}
          </h1>
          <p style={{ color:'#64748b', fontSize:13, marginBottom:24, animation:'fadeUp 0.4s 0.15s ease both', lineHeight:1.7 }}>
            {selected === 'cod'
              ? `Keep Rs. ${Number(total).toLocaleString()} ready. We will deliver to: ${address}`
              : `Thank you, ${name}! We will verify your payment and confirm at ${phone}.`}
          </p>
          <div style={{ background:'rgba(250,204,21,0.06)', border:'1px solid rgba(250,204,21,0.15)', borderRadius:14, padding:'14px 18px', marginBottom:8, animation:'fadeUp 0.4s 0.2s ease both' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:'#334155', marginBottom:4 }}>Order Reference</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#facc15', letterSpacing:2 }}>{orderRef}</div>
          </div>
          <p style={{ color:'#334155', fontSize:11, marginBottom:28 }}>Save this code to track your order</p>
          <button style={{ width:'100%', background:'linear-gradient(135deg,#854d0e,#facc15)', color:'#0f172a', border:'none', borderRadius:12, padding:14, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit', marginBottom:10, animation:'fadeUp 0.4s 0.25s ease both' }}
            onClick={() => router.push('/')}>
            🏠 Back to Home
          </button>
          <button style={{ width:'100%', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, padding:14, color:'#818cf8', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}
            onClick={() => router.push('/shop')}>
            🛒 Continue Shopping
          </button>
        </div>
      </div>
    </>
  );

  // ── PAYMENT SCREEN ──────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        @keyframes pay-fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

        .pay-page { font-family:'DM Sans',sans-serif; background:#080d18; color:#f1f5f9; padding:48px 24px 100px; max-width:600px; margin:0 auto; }
        .pay-page * { box-sizing:border-box; }

        .pay-eyebrow { font-size:10px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#facc15; margin-bottom:6px; }
        .pay-title   { font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:700; color:#f1f5f9; margin-bottom:28px; animation:pay-fadeUp 0.35s ease both; }

        .od-card { background:linear-gradient(145deg,#0d1829,#080d18); border:1px solid #1a2540; border-radius:20px; padding:22px 24px; margin-bottom:20px; animation:pay-fadeUp 0.35s 0.05s ease both; }
        .od-title { font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#334155; margin-bottom:16px; }
        .od-grid  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .od-field { display:flex; flex-direction:column; gap:4px; }
        .od-field.full { grid-column:1/-1; }
        .od-label { font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#334155; }
        .od-value { font-size:13px; font-weight:700; color:#94a3b8; }

        .pc-box   { display:flex; align-items:center; justify-content:space-between; background:rgba(250,204,21,0.05); border:1px solid rgba(250,204,21,0.15); border-radius:12px; padding:12px 16px; margin-top:14px; gap:12px; }
        .pc-label { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#334155; }
        .pc-code  { font-size:16px; font-weight:900; color:#facc15; letter-spacing:2px; }
        .copy-btn { background:rgba(250,204,21,0.08); border:1px solid rgba(250,204,21,0.2); color:#facc15; font-size:11px; font-weight:800; padding:6px 12px; border-radius:8px; cursor:pointer; transition:all 0.15s; font-family:inherit; white-space:nowrap; }
        .copy-btn:hover { background:rgba(250,204,21,0.14); }
        .copy-btn.ok { background:rgba(34,197,94,0.1); border-color:rgba(34,197,94,0.25); color:#22c55e; }

        .section-label { font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#334155; margin-bottom:12px; }
        .methods { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; animation:pay-fadeUp 0.35s 0.1s ease both; }
        @media(max-width:480px){ .methods{grid-template-columns:repeat(2,1fr);} }

        .method-btn { background:#0c1220; border:1.5px solid #1e293b; border-radius:14px; padding:14px 10px; cursor:pointer; transition:all 0.2s; text-align:center; font-family:inherit; display:flex; flex-direction:column; align-items:center; gap:8px; }
        .method-btn:hover  { border-color:#334155; transform:translateY(-1px); }
        .method-btn.active { border-color:var(--mc); background:rgba(var(--mc-rgb),0.07); transform:translateY(-2px); box-shadow:0 6px 20px rgba(var(--mc-rgb),0.15); }
        .method-emoji  { font-size:24px; line-height:1; }
        .method-label  { font-size:11px; font-weight:800; color:#64748b; }
        .method-btn.active .method-label { color:var(--mc); }

        .pay-panel { background:linear-gradient(145deg,#0d1829,#080d18); border:1px solid #1a2540; border-radius:20px; padding:28px; margin-bottom:20px; text-align:center; animation:pay-fadeUp 0.35s 0.15s ease both; }
        .pay-panel-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:#facc15; margin-bottom:20px; }
        .qr-wrap  { width:200px; height:200px; margin:0 auto 16px; border-radius:16px; border:2px solid #1e293b; background:white; padding:8px; overflow:hidden; }
        .qr-wrap img { width:100%; height:100%; object-fit:contain; }
        .pay-id-row { display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
        .pay-id-badge { background:#0f172a; border:1px solid #1e293b; border-radius:10px; padding:10px 18px; font-size:20px; font-weight:900; color:#f1f5f9; letter-spacing:1px; }
        .pay-note { color:#475569; font-size:12px; line-height:1.7; max-width:340px; margin:0 auto; }
        .app-link { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:800; padding:7px 16px; border-radius:999px; margin-top:14px; text-decoration:none; border:1px solid; transition:opacity 0.15s; }
        .app-link:hover { opacity:0.8; }
        .big-emoji { font-size:60px; margin-bottom:12px; display:block; }

        .amount-bar { display:flex; justify-content:space-between; align-items:center; background:rgba(250,204,21,0.05); border:1px solid rgba(250,204,21,0.15); border-radius:14px; padding:16px 20px; margin-bottom:20px; animation:pay-fadeUp 0.35s 0.2s ease both; }
        .amount-label { color:#475569; font-size:13px; font-weight:700; }
        .amount-value { color:#facc15; font-size:22px; font-weight:900; }

        .confirm-btn { width:100%; padding:17px; background:linear-gradient(135deg,#854d0e,#facc15); color:#0f172a; border:none; border-radius:16px; font-size:16px; font-weight:800; cursor:pointer; font-family:inherit; transition:transform 0.15s,box-shadow 0.15s; animation:pay-fadeUp 0.35s 0.25s ease both; }
        .confirm-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .confirm-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(250,204,21,0.3); }
      `}</style>

      <div className="pay-page">
        <p className="pay-eyebrow">Step 2 of 2</p>
        <h1 className="pay-title">💳 Payment</h1>

        {/* Order details */}
        <div className="od-card">
          <div className="od-title">Order Details</div>
          <div className="od-grid">
            <div className="od-field">
              <span className="od-label">Customer</span>
              <span className="od-value">{name || '—'}</span>
            </div>
            <div className="od-field">
              <span className="od-label">Phone</span>
              <span className="od-value">{phone || '—'}</span>
            </div>
            <div className="od-field full">
              <span className="od-label">Delivery Address</span>
              <span className="od-value">{address || '—'}</span>
            </div>
            <div className="od-field">
              <span className="od-label">Order ID</span>
              <span className="od-value">#{String(orderId).slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="od-field">
              <span className="od-label">Date & Time</span>
              <span className="od-value">{formatDateTime(orderTime)}</span>
            </div>
          </div>
          <div className="pc-box">
            <div>
              <div className="pc-label">Payment Reference</div>
              <div className="pc-code">{orderRef}</div>
            </div>
            <button className={`copy-btn${copied === 'ref' ? ' ok' : ''}`}
              onClick={() => copy(orderRef, 'ref')}>
              {copied === 'ref' ? '✓ Copied' : '⎘ Copy'}
            </button>
          </div>
        </div>

        {/* Method selector */}
        <p className="section-label">Choose Payment Method</p>
        <div className="methods">
          {METHODS.map(m => (
            <button key={m.id}
              className={`method-btn${selected === m.id ? ' active' : ''}`}
              style={{ '--mc': m.color, '--mc-rgb': m.rgb }}
              onClick={() => setSelected(m.id)}>
              <span className="method-emoji">{m.emoji}</span>
              <span className="method-label">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Payment panel */}
        <div className="pay-panel">
          {selected === 'qr' && (
            <>
              <p className="pay-panel-title">Scan & Pay</p>
              <div className="qr-wrap">
                <img src={QR_IMAGE} alt="Payment QR"
                  onError={e => {
                    e.target.parentElement.innerHTML =
                      '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#334155;font-size:11px;text-align:center;padding:8px">Add QR to<br/>/public/images/<br/>payment-qr.png</div>';
                  }} />
              </div>
              <p className="pay-note">
                Open any banking app → Scan → Send exactly{' '}
                <strong style={{ color:'#facc15' }}>Rs. {total}</strong>.{' '}
                Add reference <strong style={{ color:'#facc15' }}>{orderRef}</strong> in remarks.
              </p>
            </>
          )}

          {selected === 'esewa' && (
            <>
              <p className="pay-panel-title">Pay via eSewa</p>
              <span className="big-emoji">🟢</span>
              <p style={{ color:'#64748b', fontSize:12, marginBottom:10 }}>Send to this eSewa ID:</p>
              <div className="pay-id-row">
                <span className="pay-id-badge">{ESEWA_ID}</span>
                <button className={`copy-btn${copied === 'esewa' ? ' ok' : ''}`}
                  onClick={() => copy(ESEWA_ID, 'esewa')}>
                  {copied === 'esewa' ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
              <p className="pay-note">
                eSewa → Send Money → ID:{' '}
                <strong style={{ color:'#facc15' }}>{ESEWA_ID}</strong> → Amount:{' '}
                <strong style={{ color:'#facc15' }}>Rs. {total}</strong> → Remarks:{' '}
                <strong style={{ color:'#facc15' }}>{orderRef}</strong>
              </p>
              <a href="https://esewa.com.np" target="_blank" rel="noopener noreferrer"
                className="app-link"
                style={{ background:'rgba(34,197,94,0.08)', borderColor:'rgba(34,197,94,0.25)', color:'#22c55e' }}>
                🟢 Open eSewa
              </a>
            </>
          )}

          {selected === 'khalti' && (
            <>
              <p className="pay-panel-title">Pay via Khalti</p>
              <span className="big-emoji">🟣</span>
              <p style={{ color:'#64748b', fontSize:12, marginBottom:10 }}>Send to this Khalti ID:</p>
              <div className="pay-id-row">
                <span className="pay-id-badge">{KHALTI_ID}</span>
                <button className={`copy-btn${copied === 'khalti' ? ' ok' : ''}`}
                  onClick={() => copy(KHALTI_ID, 'khalti')}>
                  {copied === 'khalti' ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
              <p className="pay-note">
                Khalti → Send Money → ID:{' '}
                <strong style={{ color:'#facc15' }}>{KHALTI_ID}</strong> → Amount:{' '}
                <strong style={{ color:'#facc15' }}>Rs. {total}</strong> → Remarks:{' '}
                <strong style={{ color:'#facc15' }}>{orderRef}</strong>
              </p>
              <a href="https://khalti.com" target="_blank" rel="noopener noreferrer"
                className="app-link"
                style={{ background:'rgba(168,85,247,0.08)', borderColor:'rgba(168,85,247,0.25)', color:'#a855f7' }}>
                🟣 Open Khalti
              </a>
            </>
          )}

          {selected === 'cod' && (
            <>
              <p className="pay-panel-title">Cash on Delivery</p>
              <span className="big-emoji">💵</span>
              <p style={{ color:'#94a3b8', fontSize:14, lineHeight:1.8 }}>
                Deliver to: <strong style={{ color:'#f1f5f9' }}>{address}</strong><br />
                Keep exactly <strong style={{ color:'#facc15' }}>Rs. {total}</strong> ready.<br />
                Our delivery partner will collect at your door.
              </p>
            </>
          )}
        </div>

        <div className="amount-bar">
          <span className="amount-label">Total Amount Due</span>
          <span className="amount-value">Rs. {Number(total).toLocaleString()}</span>
        </div>

        <button className="confirm-btn" onClick={handleConfirm} disabled={saving}>
          {saving
            ? '⏳ Confirming…'
            : selected === 'cod'
              ? '✓ Confirm Order — Pay on Delivery'
              : `✓ I've Sent Rs. ${total} — Confirm & Exit`}
        </button>
      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ background:'#080d18', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#facc15', fontFamily:'sans-serif' }}>
        Loading…
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}