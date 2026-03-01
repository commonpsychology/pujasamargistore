'use client';

// app/payment/page.js

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../src/context/CartContext';

const METHODS = [
  {
    id: 'esewa',
    label: 'eSewa',
    color: '#60bb46',
    bg: 'linear-gradient(135deg, #1a3a10, #0f2208)',
    border: '#3a7a20',
    icon: '🟢',
    desc: 'Pay instantly with your eSewa wallet',
    instructions: 'Open eSewa app → Scan QR → Confirm payment',
  },
  {
    id: 'khalti',
    label: 'Khalti',
    color: '#a855f7',
    bg: 'linear-gradient(135deg, #1e0a38, #120520)',
    border: '#6d3aad',
    icon: '🟣',
    desc: 'Pay seamlessly with Khalti digital wallet',
    instructions: 'Open Khalti app → Scan QR → Confirm payment',
  },
  {
    id: 'qr',
    label: 'Any QR / UPI',
    color: '#facc15',
    bg: 'linear-gradient(135deg, #1e1a0e, #27200a)',
    border: '#78350f',
    icon: '📷',
    desc: 'Scan with any payment app',
    instructions: 'Open any payment app → Tap Scan → Point at QR code',
  },
];

function QRPlaceholder() {
  // Replace the src below with your real QR image
  return (
    <div style={{
      width: 200, height: 200,
      background: '#fff',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 0 6px rgba(255,255,255,0.06)',
      gap: '8px',
    }}>
      <span style={{ fontSize: '64px' }}>⬛</span>
      {/* swap ⬛ for: <img src="/qr-code.png" width={180} height={180} alt="QR Code" /> */}
      <span style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>Your QR Code Here</span>
    </div>
  );
}

export default function PaymentPage() {
  const { total, clearCart } = useCart();
  const [selected, setSelected] = useState('esewa');
  const [paid, setPaid] = useState(false);
  const router = useRouter();

  const active = METHODS.find(m => m.id === selected);

  const handleConfirm = () => {
    setPaid(true);
    clearCart();
  };

  if (paid) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080d18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ color: '#22c55e', fontWeight: 900, fontSize: '30px', margin: '0 0 10px' }}>
            Payment Successful!
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 28px' }}>
            Your order has been placed. धन्यवाद! 🙏
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: '14px',
            fontWeight: 800,
            textDecoration: 'none',
            fontSize: '15px',
          }}>
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 8px 24px rgba(34,197,94,0.4); }
          50%      { box-shadow: 0 8px 36px rgba(34,197,94,0.7); }
        }
        .method-card {
          cursor: pointer;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 2px solid transparent;
          transition: all 0.25s ease;
        }
        .method-card:hover { transform: translateY(-2px); }
        .confirm-btn {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 16px;
          font-size: 17px;
          font-weight: 900;
          cursor: pointer;
          color: #fff;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          animation: glow 2s ease infinite;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .confirm-btn:hover { transform: translateY(-2px); }
        .confirm-btn:active { transform: scale(0.98); }
      `}</style>

      <main style={{
        minHeight: '100vh',
        background: '#080d18',
        padding: '40px 20px 60px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          animation: 'fadeUp 0.5s ease both',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '44px', marginBottom: '10px' }}>🔒</div>
            <h1 style={{ color: '#f8fafc', fontWeight: 900, fontSize: '26px', margin: '0 0 6px' }}>
              Secure Payment
            </h1>
            <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 16px' }}>
              Choose your preferred payment method
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(250,204,21,0.08)',
              border: '1px solid rgba(250,204,21,0.2)',
              borderRadius: '999px',
              padding: '10px 24px',
            }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Total:</span>
              <span style={{ color: '#facc15', fontWeight: 900, fontSize: '22px' }}>
                Rs. {total}
              </span>
            </div>
          </div>

          {/* Payment method cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {METHODS.map(m => (
              <div
                key={m.id}
                className="method-card"
                onClick={() => setSelected(m.id)}
                style={{
                  background: selected === m.id ? m.bg : 'rgba(255,255,255,0.03)',
                  borderColor: selected === m.id ? m.border : '#1e293b',
                  boxShadow: selected === m.id
                    ? `0 0 0 1px ${m.border}, 0 8px 24px rgba(0,0,0,0.4)`
                    : 'none',
                }}
              >
                <span style={{ fontSize: '32px' }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: selected === m.id ? m.color : '#94a3b8',
                    fontWeight: 800, fontSize: '15px', marginBottom: '3px',
                    transition: 'color 0.2s',
                  }}>
                    {m.label}
                  </div>
                  <div style={{ color: '#475569', fontSize: '12px' }}>{m.desc}</div>
                </div>
                {/* Radio */}
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: `2px solid ${selected === m.id ? m.color : '#334155'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'border-color 0.2s',
                }}>
                  {selected === m.id && (
                    <div style={{
                      width: '10px', height: '10px',
                      borderRadius: '50%',
                      background: active.color,
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* QR + instructions */}
          <div style={{
            background: active.bg,
            border: `1px solid ${active.border}`,
            borderRadius: '20px',
            padding: '28px',
            textAlign: 'center',
            marginBottom: '24px',
            transition: 'all 0.3s ease',
          }}>
            <p style={{
              color: '#64748b', fontSize: '11px',
              margin: '0 0 20px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>
              Scan to Pay with {active.label}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <QRPlaceholder />
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
            }}>
              <span style={{ fontSize: '20px' }}>📱</span>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
                {active.instructions}
              </p>
            </div>
          </div>

          {/* Confirm button */}
          <button className="confirm-btn" onClick={handleConfirm}>
            <span style={{ fontSize: '20px' }}>✅</span>
            Confirm Payment — Rs. {total}
            <span style={{ fontSize: '18px' }}>→</span>
          </button>

          <p style={{
            textAlign: 'center',
            color: '#1e293b',
            fontSize: '11px',
            marginTop: '16px',
          }}>
            🔒 256-bit encrypted · Safe & Secure
          </p>
        </div>
      </main>
    </>
  );
}