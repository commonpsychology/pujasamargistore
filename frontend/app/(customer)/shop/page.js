'use client';

// app/(customer)/shop/page.js

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';

const CATEGORIES = ['All', 'Diyas & Lamps', 'Incense', 'Brass Items', 'Flowers & Garlands', 'Puja Kits', 'Idols', 'Cloths & Decor', 'Sweets & Prasad'];

export default function Shop() {
  const { cartCount } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []); // eslint-disable-line

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setError('Failed to load products'); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== 'All') list = list.filter(p => p.category === category);
    if (search.trim()) list = list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name')       list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, search, sort]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');

        .shop-page {
          font-family: 'DM Sans', sans-serif;
          background: #080d18;
          color: #f1f5f9;
          min-height: 100vh;
          padding: 48px 24px 80px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .shop-header {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 36px;
        }
        .cart-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #22c55e;
          font-weight: 800;
          font-size: 14px;
          padding: 10px 18px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          user-select: none;
        }
        .cart-pill:hover {
          background: rgba(34,197,94,0.18);
          border-color: rgba(34,197,94,0.5);
          transform: translateY(-1px);
        }
        .cart-pill:active { transform: scale(0.97); }
        .cart-badge {
          background: #22c55e;
          color: #0f172a;
          font-size: 11px;
          font-weight: 900;
          min-width: 20px;
          height: 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
        }
        .controls {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
          align-items: center;
        }
        .search-input {
          flex: 1;
          min-width: 200px;
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 12px;
          padding: 12px 16px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: rgba(250,204,21,0.4); }
        .search-input::placeholder { color: #334155; }
        .sort-select {
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 12px;
          padding: 12px 16px;
          color: #94a3b8;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .sort-select:focus { border-color: rgba(250,204,21,0.4); }
        .categories {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .categories::-webkit-scrollbar { display: none; }
        .cat-btn {
          white-space: nowrap;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid #1f2937;
          background: #111827;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .cat-btn:hover { border-color: rgba(250,204,21,0.3); color: #94a3b8; }
        .cat-btn.active {
          background: rgba(250,204,21,0.1);
          border-color: rgba(250,204,21,0.3);
          color: #facc15;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .state-box {
          grid-column: 1/-1;
          text-align: center;
          padding: 80px 20px;
          color: #334155;
        }
        .state-box .emoji { font-size: 48px; margin-bottom: 12px; }
        .state-box p { font-size: 15px; margin: 0; }
        @keyframes skeletonPulse {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.8; }
        }
        .skeleton {
          background: #111827;
          border-radius: 18px;
          height: 320px;
          animation: skeletonPulse 1.4s ease infinite;
        }
        .results-count {
          color: #334155;
          font-size: 12px;
          margin-bottom: 16px;
          font-weight: 600;
        }
      `}</style>

      <main className="shop-page">

        <div className="shop-header">
          {mounted && (
            <div className="cart-pill" onClick={() => router.push('/checkout')}>
              🛒
              <span>{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</span>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </div>
          )}
        </div>

        <div className="controls">
          <input
            className="search-input"
            placeholder="🔍  Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name: A → Z</option>
          </select>
        </div>

        <div className="categories">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`cat-btn${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <p className="results-count">
            Showing {filtered.length} of {products.length} products
            {category !== 'All' ? ` in "${category}"` : ''}
            {search ? ` matching "${search}"` : ''}
          </p>
        )}

        <div className="products-grid">
          {loading && Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}

          {error && (
            <div className="state-box">
              <div className="emoji">⚠️</div>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="state-box">
              <div className="emoji">🔍</div>
              <p>No products found. Try a different search or category.</p>
            </div>
          )}

          {!loading && !error && filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </main>
    </>
  );
}