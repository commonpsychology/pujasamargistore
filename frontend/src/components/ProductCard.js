'use client';

// src/components/ProductCard.js

import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const imageSrc =
    product.image_url ||
    (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.95); opacity: 0.7; }
          60%  { transform: scale(1.04); }
          100% { transform: scale(1);    opacity: 1; }
        }
        .add-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          margin-top: 14px;
          font-family: inherit;
        }
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(250,204,21,0.3);
        }
        .add-btn:active { transform: scale(0.97); }
        .add-btn.added { animation: popIn 0.3s ease; }
      `}</style>

      <div
        style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid #334155',
          borderRadius: '18px',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Image or emoji placeholder */}
        <div style={{
          height: '160px',
          background: 'linear-gradient(135deg, #1e1a0e, #2d2510)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '52px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.parentNode.dataset.fallback = 'true';
              }}
            />
          ) : (
            <span>{product.emoji || '🪔'}</span>
          )}

          {product.badge && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(250,204,21,0.15)',
              border: '1px solid rgba(250,204,21,0.3)',
              color: '#facc15',
              fontSize: '9px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '999px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              {product.badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            color: '#f1f5f9',
            fontWeight: 800,
            fontSize: '14px',
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}>
            {product.name}
          </h3>

          <p style={{
            color: '#64748b',
            fontSize: '12px',
            margin: '0 0 12px',
            lineHeight: 1.5,
            flex: 1,
          }}>
            {product.description || ''}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2px',
          }}>
            <span style={{ color: '#facc15', fontWeight: 900, fontSize: '17px' }}>
              Rs. {product.price}
            </span>
            {product.category && (
              <span style={{
                color: '#475569',
                fontSize: '10px',
                fontWeight: 600,
              }}>
                {product.category}
              </span>
            )}
          </div>

          <button
            className={`add-btn${added ? ' added' : ''}`}
            onClick={handleAdd}
            style={{
              background: added
                ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                : 'linear-gradient(135deg, #854d0e, #facc15)',
              color: added ? '#fff' : '#0f172a',
            }}
          >
            {added ? '✓ Added!' : '🛒 Add to Cart'}
          </button>
        </div>
      </div>
    </>
  );
}