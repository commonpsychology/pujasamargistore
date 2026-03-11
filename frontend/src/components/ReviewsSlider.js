'use client';
// src/components/ReviewsSlider.js

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const REVIEWS = [
  {
    id: 1,
    name: 'Sita Sharma',
    location: 'Kathmandu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SitaSharma',
    rating: 5,
    text: 'The puja thali set I ordered arrived the same day before my morning ritual. Everything was beautifully packed and the brass quality is exceptional. Will definitely order again for Dashain!',
    product: 'Brass Puja Thali',
    date: 'February 2026',
  },
  {
    id: 2,
    name: 'Rajesh Pradhan',
    location: 'Bhaktapur',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshPradhan',
    rating: 5,
    text: 'पण्डित जीको सेवा अतुलनीय छ। सामग्रीको गुणस्तर एकदमै राम्रो छ। समयमै डेलिभरी भयो र पैकेजिङ पनि सुन्दर थियो।',
    product: 'Deluxe Pooja Kit',
    date: 'January 2026',
  },
  {
    id: 3,
    name: 'Priya Thapa',
    location: 'Lalitpur',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaThapa',
    rating: 5,
    text: 'I ordered the Diwali Special Kit and it exceeded all expectations. The rangoli colors were vibrant, diyas were gorgeous, and everything smelled divine. Perfect for the festival season!',
    product: 'Diwali Special Kit',
    date: 'October 2025',
  },
  {
    id: 4,
    name: 'Bikash Karmacharya',
    location: 'Thimi, Bhaktapur',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BikashKarmacharya',
    rating: 5,
    text: 'The premium agarbatti pack is absolutely wonderful. The fragrance fills the entire house and lasts so long. I have been buying from here for 3 years and the quality never disappoints.',
    product: 'Premium Agarbatti Pack',
    date: 'December 2025',
  },
  {
    id: 5,
    name: 'Anita Maharjan',
    location: 'Patan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnitaMaharjan',
    rating: 5,
    text: 'Same-day delivery is a game changer. I forgot to arrange puja items the morning of Teej and they delivered within 3 hours. Lifesaver! The tulsi mala quality is also top notch.',
    product: 'Special Pooja Items',
    date: 'November 2025',
  },
];

function StarRating({ count }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < count ? '#facc15' : '#3f3f46', fontSize: '14px' }}>★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review, position }) {
  const transforms = {
    center: 'translateX(0) scale(1)',
    left:   'translateX(-108%) scale(0.88)',
    right:  'translateX(108%) scale(0.88)',
    hidden: 'translateX(0) scale(0.7)',
  };
  const opacities = { center: 1, left: 0, right: 0, hidden: 0 };
  const zIndexes  = { center: 10, left: 5, right: 5, hidden: 0 };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      transform: transforms[position] || transforms.hidden,
      opacity: opacities[position] ?? 0,
      zIndex: zIndexes[position] ?? 0,
      transition: 'all 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: position === 'center' ? 'auto' : 'none',
      padding: '0 2px',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #27272a, #1f1f22)',
        border: '1px solid #3f3f46',
        borderRadius: '20px',
        /* FIX: responsive padding */
        padding: 'clamp(20px, 5vw, 36px) clamp(18px, 5vw, 40px) clamp(18px, 4vw, 32px)',
        boxShadow: position === 'center'
          ? '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,204,21,0.08)'
          : '0 8px 20px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gold glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '120px', height: '120px',
          background: 'radial-gradient(circle, rgba(250,204,21,0.06), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Quote mark */}
        <div style={{
          position: 'absolute', top: '12px', left: '20px',
          fontSize: '64px', color: 'rgba(250,204,21,0.08)',
          fontFamily: 'Georgia, serif', lineHeight: 1,
          userSelect: 'none', pointerEvents: 'none',
        }}>
          &ldquo;
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '52px', height: '52px', flexShrink: 0,
            borderRadius: '50%',
            border: '2px solid #facc15',
            boxShadow: '0 0 12px rgba(250,204,21,0.3)',
            overflow: 'hidden',
            background: '#1c1c1e',
            position: 'relative',
          }}>
            <Image
              src={review.avatar}
              alt={review.name}
              width={52}
              height={52}
              unoptimized
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;background:#292524">🙏</div>`;
              }}
            />
          </div>

          {/* Name + location + stars */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '15px' }}>{review.name}</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>📍 {review.location}</div>
            <StarRating count={review.rating} />
          </div>

          {/* Product badge + date */}
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(250,204,21,0.08)',
              border: '1px solid rgba(250,204,21,0.15)',
              borderRadius: '6px',
              padding: '3px 8px',
              color: '#facc15',
              fontSize: '10px', fontWeight: 600,
              marginBottom: '4px',
              /* FIX: allow wrapping on very small screens */
              whiteSpace: 'normal',
              maxWidth: '120px',
              textAlign: 'right',
            }}>
              {review.product}
            </div>
            <div style={{ color: '#475569', fontSize: '11px' }}>{review.date}</div>
          </div>
        </div>

        {/* Review text */}
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          lineHeight: 1.75,
          fontStyle: 'italic',
          margin: 0,
          paddingTop: '12px',
          borderTop: '1px solid #2e2e32',
        }}>
          &ldquo;{review.text}&rdquo;
        </p>

        {/* Verified */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: '#22c55e',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', color: 'white', fontWeight: 800,
          }}>✓</span>
          <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 600 }}>Verified Purchase</span>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardHeight, setCardHeight] = useState(300);
  const total = REVIEWS.length;

  const goTo = useCallback((idx) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((idx + total) % total);
    setTimeout(() => setIsAnimating(false), 550);
  }, [isAnimating, total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  // Dynamically measure card height so the slider container is always tall enough
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      // Rough responsive height estimates
      if (w < 400) setCardHeight(360);
      else if (w < 640) setCardHeight(320);
      else setCardHeight(280);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const getPosition = (idx) => {
    if (idx === current) return 'center';
    if (idx === (current - 1 + total) % total) return 'left';
    if (idx === (current + 1) % total) return 'right';
    return 'hidden';
  };

  return (
    <section style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '60px 0 80px',
      /* FIX: prevent this section from causing horizontal scroll */
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', padding: '0 24px' }}>
        <p style={{
          fontSize: '11px', fontWeight: 700,
          letterSpacing: '3px', color: '#facc15',
          textTransform: 'uppercase', marginBottom: '10px',
        }}>
          What our customers say
        </p>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 900, color: '#f8fafc',
          margin: 0, lineHeight: 1.2,
        }}>
          Trusted by Thousands
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
          Real reviews from our devotees across the Kathmandu Valley
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          marginTop: '16px',
          background: 'rgba(250,204,21,0.06)',
          border: '1px solid rgba(250,204,21,0.15)',
          borderRadius: '999px',
          padding: '8px 20px',
        }}>
          <span style={{ color: '#facc15', fontSize: '16px', letterSpacing: '-1px' }}>★★★★★</span>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px' }}>5.0</span>
          <span style={{ color: '#64748b', fontSize: '13px' }}>· 500+ reviews</span>
        </div>
      </div>

      {/* Slider area */}
      <div style={{ position: 'relative', padding: '0 16px' }}>
        {/* overflow:hidden clips side-cards so they never cause horizontal scroll */}
        <div style={{ position: 'relative', height: `${cardHeight}px`, overflow: 'hidden', margin: '0 32px' }}>
          {REVIEWS.map((review, idx) => (
            <ReviewCard
              key={review.id}
              review={review}
              position={getPosition(idx)}
            />
          ))}
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous review"
          style={{
            position: 'absolute', left: '0', top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: 'rgba(39,39,42,0.95)',
            border: '1px solid #3f3f46',
            color: '#f1f5f9', fontSize: '20px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.2s, background 0.2s',
            backdropFilter: 'blur(4px)',
          }}
        >
          ‹
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next review"
          style={{
            position: 'absolute', right: '0', top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: 'rgba(39,39,42,0.95)',
            border: '1px solid #3f3f46',
            color: '#f1f5f9', fontSize: '20px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.2s, background 0.2s',
            backdropFilter: 'blur(4px)',
          }}
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        gap: '8px', marginTop: '28px',
      }}>
        {REVIEWS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Review ${idx + 1}`}
            style={{
              width: idx === current ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: idx === current ? '#facc15' : '#3f3f46',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}