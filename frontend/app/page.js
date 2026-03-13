'use client';
// app/page.js

import HeroSlider     from '../src/components/HeroSlider';
import NepaliCalendar from '../src/components/NepaliCalendar';
import ReviewsSlider  from '../src/components/ReviewsSlider';
import ProductCard    from '../src/components/ProductCard';
import HomeSections   from '../src/components/HomeSections';
import { PRODUCTS }   from '../src/data';
import FestivalCountdown from '../src/components/FestivalCountdown';
export default function Home() {
  return (
    <div style={{ width: '100%' }}>

      {/* ── HERO SLIDER ── */}
      <HeroSlider />

      {/* ── FEATURED PRODUCTS ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '36px 24px 20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9', marginBottom: '20px' }}>
          Featured Products
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
          gap: '14px',
        }}>
          {PRODUCTS.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* ── NEPALI CALENDAR ── */}
      <NepaliCalendar />

     
      

      {/* ── NEW SECTIONS ── */}
      <HomeSections />

 {/* ── CUSTOMER REVIEWS ── */}
      <ReviewsSlider />

    </div>
  );
}