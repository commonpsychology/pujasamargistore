'use client';

// src/components/FloatingCheckoutButton.js
// Floating green checkout button — fixed bottom-left, scrolls with page

import { useState, useEffect } from 'react';

export default function FloatingCheckoutButton() {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Show after slight scroll
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pulse every 4s to draw attention
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const scrollToCart = () => {
    const cart = document.getElementById('cart-section');
    if (cart) {
      cart.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/cart';
    }
  };

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(80px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes cartPulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
          70%  { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        .checkout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 14px 22px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.3px;
          box-shadow: 0 8px 24px rgba(34,197,94,0.4), 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          white-space: nowrap;
        }
        .checkout-btn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 14px 32px rgba(34,197,94,0.55), 0 4px 12px rgba(0,0,0,0.3);
          background: linear-gradient(135deg, #15803d, #16a34a);
        }
        .checkout-btn:active {
          transform: scale(0.97);
        }
        .checkout-btn.pulse {
          animation: cartPulse 0.6s ease-out;
        }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: '28px',
        left: '24px',
        zIndex: 1000,
        transform: visible ? 'translateY(0)' : 'translateY(100px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
        <button
          className={`checkout-btn${pulse ? ' pulse' : ''}`}
          onClick={scrollToCart}
          aria-label="Go to cart"
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>🛒</span>
          <span>Checkout</span>
          <span style={{
            background: 'rgba(255,255,255,0.25)',
            borderRadius: '999px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 900,
          }}>
            ›
          </span>
        </button>
      </div>
    </>
  );
}