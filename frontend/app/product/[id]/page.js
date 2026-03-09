'use client';
// app/product/[id]/page.js
// Fetches product by ID from /api/products/:id and displays full detail page

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../src/context/CartContext';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, cartCount } = useCart();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [qty, setQty]           = useState(1);
  const [added, setAdded]       = useState(false);
  const [imgIdx, setImgIdx]     = useState(0);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Product not found');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const images = product?.images?.length ? product.images : [null];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pd-page {
          font-family: 'DM Sans', sans-serif;
          background: #080d18; color: #f1f5f9;
          min-height: 100vh; padding: 48px 24px 80px;
          max-width: 1100px; margin: 0 auto;
        }

        .top-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 40px; gap: 16px;
        }
        .back-btn {
          background: #111827; border: 1px solid #1f2937; color: #94a3b8;
          padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .back-btn:hover { border-color: #334155; color: #f1f5f9; }
        .cart-pill {
          display: flex; align-items: center; gap: 8px;
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
          color: #22c55e; font-weight: 800; font-size: 13px;
          padding: 9px 16px; border-radius: 999px; cursor: pointer; transition: all 0.2s;
        }
        .cart-pill:hover { background: rgba(34,197,94,0.18); }

        /* Layout */
        .pd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        @media (max-width: 700px) { .pd-grid { grid-template-columns: 1fr; } }

        /* Image panel */
        .img-main {
          aspect-ratio: 1; border-radius: 20px; overflow: hidden;
          background: linear-gradient(135deg, #1e1a0e, #2d2510);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #1e293b; margin-bottom: 10px;
        }
        .img-main img { width: 100%; height: 100%; object-fit: cover; }
        .img-main .placeholder-emoji { font-size: 80px; }
        .img-thumbs { display: flex; gap: 8px; }
        .img-thumb {
          width: 64px; height: 64px; border-radius: 10px; overflow: hidden;
          background: #111827; border: 2px solid transparent;
          cursor: pointer; transition: border-color 0.15s;
          display: flex; align-items: center; justify-content: center; font-size: 24px;
        }
        .img-thumb.active { border-color: #facc15; }
        .img-thumb img { width: 100%; height: 100%; object-fit: cover; }

        /* Info panel */
        .pd-info { display: flex; flex-direction: column; gap: 18px; }
        .pd-category {
          font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
          color: #facc15;
        }
        .pd-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 40px); font-weight: 700; color: #f8fafc;
          line-height: 1.15;
        }
        .pd-price { font-size: 32px; font-weight: 900; color: #facc15; }
        .pd-badge {
          display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; padding: 4px 12px; border-radius: 999px;
          background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.25); color: #facc15;
        }
        .pd-desc { color: #64748b; font-size: 14px; line-height: 1.8; }
        .pd-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .pd-tag {
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px;
          background: rgba(255,255,255,0.04); border: 1px solid #1e293b; color: #475569;
        }

        .qty-row { display: flex; align-items: center; gap: 12px; }
        .qty-label { font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #475569; }
        .qty-controls { display: flex; align-items: center; gap: 10px; }
        .qty-btn {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid #334155;
          background: #111827; color: #94a3b8; font-size: 18px; font-weight: 800;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; font-family: inherit;
        }
        .qty-btn:hover { border-color: #facc15; color: #facc15; }
        .qty-num { font-size: 16px; font-weight: 900; color: #f1f5f9; min-width: 32px; text-align: center; }

        .add-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #854d0e, #facc15);
          color: #0f172a; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 900; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: transform 0.15s, box-shadow 0.15s;
        }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(250,204,21,0.3); }
        .add-btn.success { background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; }

        /* Loading / error states */
        .state-box { text-align: center; padding: 100px 20px; color: #334155; }
        .state-box .emoji { font-size: 52px; margin-bottom: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 36px; height: 36px; border: 3px solid rgba(250,204,21,0.15);
          border-top-color: #facc15; border-radius: 50%;
          animation: spin 0.7s linear infinite; margin: 0 auto 16px;
        }
      `}</style>

      <div className="pd-page">
        <div className="top-bar">
          <button className="back-btn" onClick={() => router.push('/shop')}>← Back to Shop</button>
          <div className="cart-pill" onClick={() => router.push('/checkout')}>
            🛒 {cartCount} in cart
          </div>
        </div>

        {loading && (
          <div className="state-box"><div className="spinner" /><p>Loading product…</p></div>
        )}

        {error && (
          <div className="state-box">
            <div className="emoji">⚠️</div>
            <p>{error}</p>
            <button className="back-btn" style={{ marginTop: 20 }} onClick={() => router.push('/shop')}>
              ← Back to Shop
            </button>
          </div>
        )}

        {!loading && !error && product && (
          <div className="pd-grid">

            {/* Images */}
            <div>
              <div className="img-main">
                {images[imgIdx]
                  ? <img src={images[imgIdx]} alt={product.name} />
                  : <span className="placeholder-emoji">🪔</span>}
              </div>
              {images.length > 1 && (
                <div className="img-thumbs">
                  {images.map((src, i) => (
                    <div key={i} className={`img-thumb${imgIdx === i ? ' active' : ''}`} onClick={() => setImgIdx(i)}>
                      {src ? <img src={src} alt="" /> : '🪔'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="pd-info">
              <p className="pd-category">{product.category}</p>
              <h1 className="pd-name">{product.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="pd-price">Rs. {Number(product.price).toLocaleString()}</span>
                {product.badge && <span className="pd-badge">{product.badge}</span>}
              </div>

              <p className="pd-desc">{product.description}</p>

              {product.tags?.length > 0 && (
                <div className="pd-tags">
                  {product.tags.map(t => <span key={t} className="pd-tag">#{t}</span>)}
                </div>
              )}

              <div className="qty-row">
                <span className="qty-label">Qty</span>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span className="qty-num">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                </div>
              </div>

              <button
                className={`add-btn${added ? ' success' : ''}`}
                onClick={handleAddToCart}
              >
                {added ? '✓ Added to Cart!' : `🛒 Add to Cart · Rs. ${(Number(product.price) * qty).toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}