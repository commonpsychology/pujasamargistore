'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const imageSrc =
    product.image_url ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null);

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
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .product-card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid #334155;
          border-radius: 18px;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,204,21,0.15);
          border-color: rgba(250,204,21,0.25);
        }
        .add-btn {
          width: 100%;
          padding: 11px;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 12px;
          font-family: inherit;
          letter-spacing: 0.3px;
        }
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(250,204,21,0.35);
        }
        .add-btn:active { transform: scale(0.97); }
        .add-btn.added  { animation: popIn 0.3s ease; }
        .price-tag {
          background: linear-gradient(
            90deg,
            #facc15 0%, #fde68a 40%, #facc15 60%, #854d0e 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="product-card">
        {/* Image area */}
        <div style={{
          height: '160px',
          background: 'linear-gradient(135deg, #1a1708, #2d2510)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '54px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              onError={e => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <span style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
              {product.emoji || '🪔'}
            </span>
          )}

          {/* Gradient overlay at bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'linear-gradient(to top, rgba(15,23,42,0.6), transparent)',
            pointerEvents: 'none',
          }} />

          {product.badge && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(250,204,21,0.12)',
              border: '1px solid rgba(250,204,21,0.35)',
              color: '#facc15',
              fontSize: '9px',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '999px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              backdropFilter: 'blur(6px)',
            }}>
              {product.badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            color: '#f1f5f9',
            fontWeight: 800,
            fontSize: '13.5px',
            margin: '0 0 5px',
            lineHeight: 1.35,
          }}>
            {product.name}
          </h3>

          <p style={{
            color: '#64748b',
            fontSize: '11.5px',
            margin: '0 0 12px',
            lineHeight: 1.55,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.description || ''}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2px',
          }}>
            <span className="price-tag" style={{ fontWeight: 900, fontSize: '16px' }}>
              Rs. {product.price}
            </span>
            {product.category && (
              <span style={{
                color: '#475569',
                fontSize: '10px',
                fontWeight: 600,
                background: 'rgba(71,85,105,0.15)',
                padding: '2px 7px',
                borderRadius: '6px',
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
                : 'linear-gradient(135deg, #92400e, #facc15)',
              color: added ? '#fff' : '#0f172a',
              boxShadow: added
                ? '0 4px 14px rgba(34,197,94,0.3)'
                : '0 4px 14px rgba(250,204,21,0.2)',
            }}
          >
            {added ? '✓  Added to Cart!' : '🛒  Add to Cart'}
          </button>
        </div>
      </div>
    </>
  );
}