'use client';

// app/cart/page.js

import { useCart } from '../../src/context/CartContext';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { cartItems, removeFromCart, updateQty, total } = useCart();
  const router = useRouter();

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 8px 24px rgba(34,197,94,0.4); }
          50%      { box-shadow: 0 8px 32px rgba(34,197,94,0.7); }
        }
        .cart-row { animation: fadeIn 0.3s ease both; }
        .qty-btn {
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #1e293b;
          color: #f1f5f9;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
        }
        .qty-btn:hover { background: #334155; border-color: #475569; }
        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .remove-btn:hover { background: rgba(239,68,68,0.1); }
        .pay-btn {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 16px;
          font-size: 17px;
          font-weight: 900;
          cursor: pointer;
          color: #fff;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          animation: pulse 2s ease infinite;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .pay-btn:hover { transform: translateY(-2px); }
        .pay-btn:active { transform: scale(0.98); }
      `}</style>

      <main style={{
        minHeight: '100vh',
        background: '#080d18',
        padding: '40px 20px 80px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              color: '#f8fafc', fontWeight: 900,
              fontSize: '28px', margin: '0 0 4px',
            }}>
              🛒 Your Cart
            </h1>
            <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>
              {cartItems.length === 0
                ? 'Your cart is empty'
                : `${cartItems.reduce((s, i) => s + i.qty, 0)} items ready for checkout`}
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#1e293b',
              borderRadius: '20px',
              border: '1px solid #334155',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🪔</div>
              <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 20px' }}>
                No items yet — add some pooja essentials!
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  background: 'linear-gradient(135deg, #854d0e, #facc15)',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ← Browse Products
              </button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div style={{
                background: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '20px',
                overflow: 'hidden',
                marginBottom: '20px',
              }}>
                {cartItems.map((item, i) => (
                  <div
                    key={item.id}
                    className="cart-row"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '18px 20px',
                      borderBottom: i < cartItems.length - 1 ? '1px solid #1f2937' : 'none',
                      background: i % 2 === 0 ? '#111827' : '#0f172a',
                    }}
                  >
                    {/* Emoji icon */}
                    <div style={{
                      width: '48px', height: '48px', flexShrink: 0,
                      background: '#1e293b',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px',
                    }}>
                      {item.emoji || '🪔'}
                    </div>

                    {/* Name + price */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px' }}>
                        {item.name}
                      </div>
                      <div style={{ color: '#facc15', fontWeight: 800, fontSize: '13px', marginTop: '2px' }}>
                        Rs. {item.price} each
                      </div>
                    </div>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '15px', minWidth: '24px', textAlign: 'center' }}>
                        {item.qty}
                      </span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>

                    {/* Subtotal */}
                    <div style={{
                      color: '#22c55e', fontWeight: 900,
                      fontSize: '15px', minWidth: '72px', textAlign: 'right',
                    }}>
                      Rs. {item.price * item.qty}
                    </div>

                    {/* Remove */}
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{
                background: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '15px' }}>Total Amount</span>
                <span style={{ color: '#facc15', fontWeight: 900, fontSize: '24px' }}>Rs. {total}</span>
              </div>

              {/* Pay Now button */}
              <button className="pay-btn" onClick={() => router.push('/payment')}>
                <span style={{ fontSize: '22px' }}>💳</span>
                Pay Now — Rs. {total}
                <span style={{ fontSize: '20px' }}>→</span>
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
}