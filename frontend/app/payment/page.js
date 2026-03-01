'use client';

// app/payment/page.js
// Receives: ?orderId=xxx&total=yyy via query params

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ── Replace these with your actual values ────────────────────
const ADMIN_QR_IMAGE = '/images/payment-qr.png';   // put your QR image in /public/images/
const ESEWA_ID       = '9849350088';                // your eSewa merchant ID / number
const KHALTI_ID      = '9849350088';                // your Khalti number
// ─────────────────────────────────────────────────────────────

const METHODS = [
  { id: 'qr',   label: 'QR Code',         emoji: '📷', color: '#6366f1' },
  { id: 'esewa',label: 'eSewa',            emoji: '🟢', color: '#22c55e' },
  { id: 'khalti',label: 'Khalti',          emoji: '🟣', color: '#a855f7' },
  { id: 'cod',   label: 'Cash on Delivery',emoji: '💵', color: '#facc15' },
];

function PaymentContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const orderId      = params.get('orderId');
  const total        = params.get('total');

  const [selected, setSelected]   = useState('qr');
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving]       = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    // Update order with chosen payment method
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: selected === 'cod' ? 'cod_pending' : 'payment_pending' }),
      });
    } catch (_) {}
    setSaving(false);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: '#080d18', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid #1e293b', borderRadius: '24px',
          padding: '48px 36px', textAlign: 'center', maxWidth: '440px', width: '100%',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#facc15', fontSize: '32px', margin: '0 0 8px' }}>
            Order Placed!
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>
            Order #{orderId?.slice(0, 8)} · Rs. {total}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 32px', lineHeight: 1.6 }}>
            {selected === 'cod'
              ? 'Your order is confirmed. Please keep cash ready at delivery.'
              : 'We will confirm your order once payment is verified. Thank you!'}
          </p>
          <button
            onClick={() => router.push('/shop')}
            style={{
              background: 'linear-gradient(135deg, #854d0e, #facc15)',
              color: '#0f172a', border: 'none', padding: '14px 32px',
              borderRadius: '12px', fontSize: '15px', fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        * { box-sizing: border-box; }
        .payment-page {
          font-family: 'DM Sans', sans-serif;
          background: #080d18; color: #f1f5f9;
          min-height: 100vh; padding: 48px 24px 80px;
          max-width: 560px; margin: 0 auto;
        }
        .pay-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 40px); font-weight: 700; color: #facc15;
          margin: 0 0 6px;
        }
        .pay-subtitle { color: #475569; font-size: 13px; margin: 0 0 32px; }

        .order-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(250,204,21,0.08); border: 1px solid rgba(250,204,21,0.2);
          color: #facc15; font-size: 13px; font-weight: 800;
          padding: 8px 16px; border-radius: 999px; margin-bottom: 32px;
        }

        /* Method selector */
        .methods { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
        .method-btn {
          background: #111827; border: 2px solid #1e293b; border-radius: 14px;
          padding: 16px; cursor: pointer; transition: all 0.2s; text-align: left;
          font-family: inherit;
        }
        .method-btn:hover { border-color: #334155; }
        .method-btn.active { border-color: var(--mc); background: rgba(var(--mc-rgb), 0.08); }
        .method-emoji { font-size: 28px; margin-bottom: 8px; display: block; }
        .method-label { font-size: 13px; font-weight: 800; color: #f1f5f9; }

        /* Payment detail card */
        .detail-card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid #1e293b; border-radius: 20px; padding: 28px;
          margin-bottom: 24px; text-align: center;
        }
        .detail-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 700; color: #facc15; margin: 0 0 20px;
        }
        .qr-img {
          width: 220px; height: 220px; object-fit: contain;
          border-radius: 16px; border: 2px solid #334155;
          background: white; padding: 8px; margin: 0 auto 16px; display: block;
        }
        .qr-fallback {
          width: 220px; height: 220px; border-radius: 16px; border: 2px dashed #334155;
          background: #111827; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          color: #475569; font-size: 13px; margin: 0 auto 16px; gap: 8px;
        }
        .pay-id-box {
          background: #0f172a; border: 1px solid #1e293b; border-radius: 10px;
          padding: 12px 16px; font-size: 18px; font-weight: 900; color: #f1f5f9;
          letter-spacing: 1px; display: inline-block;
        }
        .pay-note { color: #64748b; font-size: 12px; margin-top: 12px; line-height: 1.6; }
        .app-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
          color: #22c55e; font-size: 12px; font-weight: 700;
          padding: 6px 14px; border-radius: 999px; margin-top: 12px;
          text-decoration: none;
        }
        .cod-icon { font-size: 56px; margin-bottom: 12px; }

        /* Amount row */
        .amount-row {
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.15);
          border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;
          font-size: 15px;
        }
        .amount-label { color: #64748b; font-weight: 600; }
        .amount-value { color: #facc15; font-weight: 900; font-size: 20px; }

        .confirm-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #854d0e, #facc15);
          color: #0f172a; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 800; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: transform 0.15s, box-shadow 0.15s;
        }
        .confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .confirm-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(250,204,21,0.3); }
      `}</style>

      <div className="payment-page">
        <h1 className="pay-title">💳 Payment</h1>
        <p className="pay-subtitle">Choose how you&apos;d like to pay</p>

        {orderId && (
          <div className="order-pill">
            🧾 Order #{orderId.slice(0, 8).toUpperCase()}
          </div>
        )}

        {/* Method tabs */}
        <div className="methods">
          {METHODS.map(m => (
            <button
              key={m.id}
              className={`method-btn${selected === m.id ? ' active' : ''}`}
              style={{ '--mc': m.color }}
              onClick={() => setSelected(m.id)}
            >
              <span className="method-emoji">{m.emoji}</span>
              <span className="method-label">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Payment detail panel */}
        <div className="detail-card">
          {selected === 'qr' && (
            <>
              <h3>Scan QR Code</h3>
              <img
                src={ADMIN_QR_IMAGE}
                alt="Payment QR"
                className="qr-img"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="qr-fallback" style={{ display: 'none' }}>
                <span style={{ fontSize: '32px' }}>📷</span>
                <span>Add your QR image to<br />/public/images/payment-qr.png</span>
              </div>
              <p className="pay-note">
                Open any banking app, scan the QR code above, and send the exact amount.
                Screenshot your payment and contact us to confirm.
              </p>
            </>
          )}

          {selected === 'esewa' && (
            <>
              <h3>Pay via eSewa</h3>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🟢</div>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>Send payment to this eSewa ID:</p>
              <div className="pay-id-box">{ESEWA_ID}</div>
              <p className="pay-note">
                Open eSewa app → Send Money → Enter the ID above → Enter the exact amount → Send.
                Take a screenshot and contact us with your order number.
              </p>
              <a
                href={`https://esewa.com.np`}
                target="_blank"
                rel="noopener noreferrer"
                className="app-badge"
              >
                🟢 Open eSewa
              </a>
            </>
          )}

          {selected === 'khalti' && (
            <>
              <h3>Pay via Khalti</h3>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🟣</div>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>Send payment to this Khalti ID:</p>
              <div className="pay-id-box">{KHALTI_ID}</div>
              <p className="pay-note">
                Open Khalti app → Send Money → Enter the ID above → Enter the exact amount → Send.
                Take a screenshot and contact us with your order number.
              </p>
              <a
                href={`https://khalti.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="app-badge"
                style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.25)', color: '#a855f7' }}
              >
                🟣 Open Khalti
              </a>
            </>
          )}

          {selected === 'cod' && (
            <>
              <h3>Cash on Delivery</h3>
              <div className="cod-icon">💵</div>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                Pay in cash when your order arrives.<br />
                Please keep the exact amount ready.<br />
                Our delivery partner will collect payment at your door.
              </p>
            </>
          )}
        </div>

        {/* Total */}
        <div className="amount-row">
          <span className="amount-label">Amount to Pay</span>
          <span className="amount-value">Rs. {total}</span>
        </div>

        {/* Confirm button */}
        <button className="confirm-btn" onClick={handleConfirm} disabled={saving}>
          {saving
            ? '⏳ Confirming...'
            : selected === 'cod'
              ? '✓ Confirm Order (Pay on Delivery)'
              : '✓ I Have Sent the Payment'}
        </button>
      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#080d18', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15', fontFamily: 'sans-serif' }}>
        Loading...
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}