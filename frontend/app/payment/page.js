'use client';

// app/payment/page.js

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ADMIN_QR_IMAGE = '/images/payment-qr.png';
const ESEWA_ID       = '9849350088';
const KHALTI_ID      = '9849350088';

function generatePaymentCode(orderId) {
  const short = (orderId || 'XXXX').slice(0, 4).toUpperCase();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `PAY-${short}-${today}`;
}

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const METHODS = [
  { id: 'qr',     label: 'QR Code',         emoji: '📷', color: '#6366f1', rgb: '99,102,241'  },
  { id: 'esewa',  label: 'eSewa',            emoji: '🟢', color: '#22c55e', rgb: '34,197,94'   },
  { id: 'khalti', label: 'Khalti',           emoji: '🟣', color: '#a855f7', rgb: '168,85,247'  },
  { id: 'cod',    label: 'Cash on Delivery', emoji: '💵', color: '#facc15', rgb: '250,204,21'  },
];

function PaymentContent() {
  const router  = useRouter();
  const params  = useSearchParams();

  const orderId = params.get('orderId') || '';
  const total   = params.get('total')   || '0';
  const name    = params.get('name')    || '';
  const phone   = params.get('phone')   || '';
  const address = params.get('address') || '';

  const [selected, setSelected] = useState('qr');
  const [saving, setSaving]     = useState(false);
  const [done, setDone]         = useState(false);
  const [orderTime]             = useState(() => Date.now());
  const paymentCode             = generatePaymentCode(orderId);

  const [copied, setCopied] = useState('');
  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: selected === 'cod' ? 'cod_pending' : 'payment_pending',
          paymentMethod: selected,
        }),
      });
    } catch (_) {}
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');

          @keyframes pay-popIn  { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
          @keyframes pay-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }

          .pay-success-wrap {
            font-family: 'DM Sans', sans-serif;
            background: #080d18;
            min-height: 60vh;
            display: flex; align-items: center; justify-content: center; padding: 48px 24px;
          }
          .pay-success-card {
            background: linear-gradient(160deg, #0c1a2e, #080d18);
            border: 1px solid #1a2540; border-radius: 28px;
            padding: 52px 36px; text-align: center; max-width: 440px; width: 100%;
            position: relative; overflow: hidden;
          }
          .pay-success-card::before {
            content: ''; position: absolute; inset: 0;
            background: radial-gradient(ellipse at 50% 0%, rgba(250,204,21,0.06) 0%, transparent 70%);
            pointer-events: none;
          }
          .pay-success-emoji  { font-size: 72px; animation: pay-popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
          .pay-success-title  {
            font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 700;
            color: #facc15; margin: 16px 0 8px; animation: pay-fadeUp 0.4s 0.15s ease both;
          }
          .pay-success-sub    { color: #475569; font-size: 13px; margin-bottom: 28px; animation: pay-fadeUp 0.4s 0.2s ease both; }
          .pay-success-ref    {
            background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.15);
            border-radius: 14px; padding: 16px 20px; margin-bottom: 28px;
            animation: pay-fadeUp 0.4s 0.25s ease both;
          }
          .pay-success-ref-label { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #475569; margin-bottom: 6px; }
          .pay-success-ref-code  { font-size: 20px; font-weight: 800; color: #facc15; letter-spacing: 2px; }
          .pay-success-msg    { color: #64748b; font-size: 13px; line-height: 1.7; margin-bottom: 32px; animation: pay-fadeUp 0.4s 0.3s ease both; }
          .pay-home-btn {
            width: 100%; background: linear-gradient(135deg, #854d0e, #facc15);
            color: #0f172a; border: none; padding: 15px 32px;
            border-radius: 14px; font-size: 15px; font-weight: 800;
            cursor: pointer; font-family: inherit; transition: transform 0.15s, box-shadow 0.15s;
            animation: pay-fadeUp 0.4s 0.35s ease both;
          }
          .pay-home-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(250,204,21,0.25); }
        `}</style>
        <div className="pay-success-wrap">
          <div className="pay-success-card">
            <div className="pay-success-emoji">🎉</div>
            <h2 className="pay-success-title">Order Confirmed!</h2>
            <p className="pay-success-sub">
              {selected === 'cod' ? 'Pay cash at your door.' : "We'll verify your payment shortly."}
            </p>
            <div className="pay-success-ref">
              <div className="pay-success-ref-label">Payment Reference</div>
              <div className="pay-success-ref-code">{paymentCode}</div>
            </div>
            <p className="pay-success-msg">
              {selected === 'cod'
                ? `Thank you, ${name}! Your order is placed. Keep Rs. ${total} ready for the delivery person.`
                : `Thank you, ${name}! Screenshot your payment and share it with us. We'll confirm your order at ${phone}.`}
            </p>
            <button className="pay-home-btn" onClick={() => router.push('/')}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');

        @keyframes pay-fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes pay-shimmer { from{background-position:-200% center} to{background-position:200% center} }

        /* ── Page wrapper — scoped, never touches Navbar/Footer ── */
        .pay-page {
          font-family: 'DM Sans', sans-serif;
          background: #080d18;
          color: #f1f5f9;
          padding: 48px 24px 100px;
          max-width: 600px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .pay-page *, .pay-page *::before, .pay-page *::after {
          box-sizing: border-box;
        }

        /* Header */
        .pay-page .pay-header      { margin-bottom: 36px; animation: pay-fadeUp 0.35s ease both; }
        .pay-page .pay-eyebrow     { font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: #facc15; margin-bottom: 6px; }
        .pay-page .pay-title       { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: #f1f5f9; line-height: 1.1; }

        /* Order details card */
        .pay-page .od-card {
          background: linear-gradient(145deg, #0d1829, #080d18);
          border: 1px solid #1a2540; border-radius: 20px;
          padding: 22px 24px; margin-bottom: 20px;
          animation: pay-fadeUp 0.35s 0.05s ease both;
          position: relative; overflow: hidden;
        }
        .pay-page .od-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.4), transparent);
        }
        .pay-page .od-title        { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #334155; margin-bottom: 16px; }
        .pay-page .od-grid         { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pay-page .od-field        { display: flex; flex-direction: column; gap: 4px; }
        .pay-page .od-field.full   { grid-column: 1 / -1; }
        .pay-page .od-label        { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #334155; }
        .pay-page .od-value        { font-size: 13px; font-weight: 700; color: #94a3b8; }

        /* Payment code box */
        .pay-page .pc-box {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(250,204,21,0.05); border: 1px solid rgba(250,204,21,0.15);
          border-radius: 12px; padding: 12px 16px; margin-top: 14px; gap: 12px;
        }
        .pay-page .pc-left         { display: flex; flex-direction: column; gap: 3px; }
        .pay-page .pc-label        { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #334155; }
        .pay-page .pc-code         { font-size: 16px; font-weight: 900; color: #facc15; letter-spacing: 2px; }

        /* Copy button */
        .pay-page .copy-btn {
          background: rgba(250,204,21,0.08); border: 1px solid rgba(250,204,21,0.2);
          color: #facc15; font-size: 11px; font-weight: 800;
          padding: 6px 12px; border-radius: 8px; cursor: pointer;
          transition: all 0.15s; font-family: inherit; white-space: nowrap;
        }
        .pay-page .copy-btn:hover          { background: rgba(250,204,21,0.14); }
        .pay-page .copy-btn.copied         { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.25); color: #22c55e; }

        /* Method selector */
        .pay-page .section-label   { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #334155; margin-bottom: 12px; }
        .pay-page .methods         { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; animation: pay-fadeUp 0.35s 0.1s ease both; }
        @media (max-width: 480px)  { .pay-page .methods { grid-template-columns: repeat(2,1fr); } }

        .pay-page .method-btn {
          background: #0c1220; border: 1.5px solid #1e293b;
          border-radius: 14px; padding: 14px 10px;
          cursor: pointer; transition: all 0.2s; text-align: center;
          font-family: inherit; display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .pay-page .method-btn:hover        { border-color: #334155; transform: translateY(-1px); }
        .pay-page .method-btn.active       {
          border-color: var(--mc);
          background: rgba(var(--mc-rgb), 0.07);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(var(--mc-rgb), 0.15);
        }
        .pay-page .method-emoji    { font-size: 24px; line-height: 1; }
        .pay-page .method-label    { font-size: 11px; font-weight: 800; color: #64748b; }
        .pay-page .method-btn.active .method-label { color: var(--mc); }

        /* Payment panel */
        .pay-page .pay-panel {
          background: linear-gradient(145deg, #0d1829, #080d18);
          border: 1px solid #1a2540; border-radius: 20px;
          padding: 28px; margin-bottom: 20px; text-align: center;
          animation: pay-fadeUp 0.35s 0.15s ease both;
        }
        .pay-page .pay-panel-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #facc15; margin-bottom: 20px; }
        .pay-page .qr-wrap         { width: 200px; height: 200px; margin: 0 auto 16px; border-radius: 16px; border: 2px solid #1e293b; background: white; padding: 8px; overflow: hidden; }
        .pay-page .qr-wrap img     { width: 100%; height: 100%; object-fit: contain; }
        .pay-page .qr-fallback     {
          width: 200px; height: 200px; border-radius: 16px; border: 2px dashed #1e293b;
          background: #0c1220; display: none; flex-direction: column;
          align-items: center; justify-content: center; color: #334155; font-size: 12px; margin: 0 auto 16px; gap: 8px;
        }
        .pay-page .pay-id-row      { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .pay-page .pay-id-badge    { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 10px 18px; font-size: 20px; font-weight: 900; color: #f1f5f9; letter-spacing: 1px; }
        .pay-page .pay-note        { color: #475569; font-size: 12px; line-height: 1.7; max-width: 340px; margin: 0 auto; }
        .pay-page .app-link        { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; padding: 7px 16px; border-radius: 999px; margin-top: 14px; text-decoration: none; border: 1px solid; transition: opacity 0.15s; }
        .pay-page .app-link:hover  { opacity: 0.8; }
        .pay-page .big-emoji       { font-size: 60px; margin-bottom: 12px; display: block; }
        .pay-page .cod-text        { color: #94a3b8; font-size: 14px; line-height: 1.8; }

        /* Amount bar */
        .pay-page .amount-bar {
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(250,204,21,0.05); border: 1px solid rgba(250,204,21,0.15);
          border-radius: 14px; padding: 16px 20px; margin-bottom: 20px;
          animation: pay-fadeUp 0.35s 0.2s ease both;
        }
        .pay-page .amount-label    { color: #475569; font-size: 13px; font-weight: 700; }
        .pay-page .amount-value    { color: #facc15; font-size: 22px; font-weight: 900; }

        /* Confirm button */
        .pay-page .confirm-btn {
          width: 100%; padding: 17px;
          background: linear-gradient(135deg, #854d0e, #facc15);
          color: #0f172a; border: none; border-radius: 16px;
          font-size: 16px; font-weight: 800; cursor: pointer;
          font-family: inherit; transition: transform 0.15s, box-shadow 0.15s;
          animation: pay-fadeUp 0.35s 0.25s ease both;
        }
        .pay-page .confirm-btn:disabled            { opacity: 0.6; cursor: not-allowed; }
        .pay-page .confirm-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(250,204,21,0.3); }
      `}</style>

      <div className="pay-page">

        <div className="pay-header">
          <p className="pay-eyebrow">Step 2 of 2</p>
          <h1 className="pay-title">💳 Payment</h1>
        </div>

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
              <span className="od-value">#{(orderId || '').slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="od-field">
              <span className="od-label">Date & Time</span>
              <span className="od-value">{formatDateTime(orderTime)}</span>
            </div>
          </div>
          <div className="pc-box">
            <div className="pc-left">
              <span className="pc-label">Payment Reference</span>
              <span className="pc-code">{paymentCode}</span>
            </div>
            <button
              className={`copy-btn${copied === 'code' ? ' copied' : ''}`}
              onClick={() => copy(paymentCode, 'code')}
            >
              {copied === 'code' ? '✓ Copied' : '⎘ Copy'}
            </button>
          </div>
        </div>

        <p className="section-label">Choose Payment Method</p>
        <div className="methods">
          {METHODS.map(m => (
            <button
              key={m.id}
              className={`method-btn${selected === m.id ? ' active' : ''}`}
              style={{ '--mc': m.color, '--mc-rgb': m.rgb }}
              onClick={() => setSelected(m.id)}
            >
              <span className="method-emoji">{m.emoji}</span>
              <span className="method-label">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="pay-panel">
          {selected === 'qr' && (
            <>
              <p className="pay-panel-title">Scan & Pay</p>
              <div className="qr-wrap">
                <img
                  src={ADMIN_QR_IMAGE}
                  alt="Payment QR"
                  onError={e => {
                    e.target.parentElement.style.display = 'none';
                    e.target.parentElement.nextElementSibling.style.display = 'flex';
                  }}
                />
              </div>
              <div className="qr-fallback">
                <span style={{ fontSize: '28px' }}>📷</span>
                <span>Add QR to<br />/public/images/payment-qr.png</span>
              </div>
              <p className="pay-note">
                Open any banking app, scan the QR code, and send exactly <strong style={{ color: '#facc15' }}>Rs. {total}</strong>.
                Include your payment reference <strong style={{ color: '#facc15' }}>{paymentCode}</strong> in the note.
              </p>
            </>
          )}

          {selected === 'esewa' && (
            <>
              <p className="pay-panel-title">Pay via eSewa</p>
              <span className="big-emoji">🟢</span>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '10px' }}>Send to this eSewa ID:</p>
              <div className="pay-id-row">
                <span className="pay-id-badge">{ESEWA_ID}</span>
                <button className={`copy-btn${copied === 'esewa' ? ' copied' : ''}`} onClick={() => copy(ESEWA_ID, 'esewa')}>
                  {copied === 'esewa' ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
              <p className="pay-note">
                eSewa → Send Money → Enter ID above → Enter <strong style={{ color: '#facc15' }}>Rs. {total}</strong> → Add reference <strong style={{ color: '#facc15' }}>{paymentCode}</strong> → Send.
              </p>
              <a href="https://esewa.com.np" target="_blank" rel="noopener noreferrer" className="app-link"
                style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)', color: '#22c55e' }}>
                🟢 Open eSewa
              </a>
            </>
          )}

          {selected === 'khalti' && (
            <>
              <p className="pay-panel-title">Pay via Khalti</p>
              <span className="big-emoji">🟣</span>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '10px' }}>Send to this Khalti ID:</p>
              <div className="pay-id-row">
                <span className="pay-id-badge">{KHALTI_ID}</span>
                <button className={`copy-btn${copied === 'khalti' ? ' copied' : ''}`} onClick={() => copy(KHALTI_ID, 'khalti')}>
                  {copied === 'khalti' ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
              <p className="pay-note">
                Khalti → Send Money → Enter ID above → Enter <strong style={{ color: '#facc15' }}>Rs. {total}</strong> → Add reference <strong style={{ color: '#facc15' }}>{paymentCode}</strong> → Send.
              </p>
              <a href="https://khalti.com" target="_blank" rel="noopener noreferrer" className="app-link"
                style={{ background: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.25)', color: '#a855f7' }}>
                🟣 Open Khalti
              </a>
            </>
          )}

          {selected === 'cod' && (
            <>
              <p className="pay-panel-title">Cash on Delivery</p>
              <span className="big-emoji">💵</span>
              <p className="cod-text">
                Your order will be delivered to:<br />
                <strong style={{ color: '#f1f5f9' }}>{address}</strong><br /><br />
                Please keep exactly <strong style={{ color: '#facc15' }}>Rs. {total}</strong> ready.<br />
                Our delivery partner will collect payment at your door.
              </p>
            </>
          )}
        </div>

        <div className="amount-bar">
          <span className="amount-label">Total Amount Due</span>
          <span className="amount-value">Rs. {total}</span>
        </div>

        <button className="confirm-btn" onClick={handleConfirm} disabled={saving}>
          {saving
            ? '⏳ Confirming…'
            : selected === 'cod'
              ? '✓ Confirm Order — Pay on Delivery'
              : "✓ I've Sent the Payment — Confirm & Exit"}
        </button>

      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{
        background: '#080d18', minHeight: '60vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#facc15', fontFamily: 'sans-serif', fontSize: '14px',
      }}>
        Loading payment…
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}