'use client';
// app/policies/page.js

import { useState } from 'react';
import Link from 'next/link';

const POLICIES = [
  { href: '/policies/privacy',  emoji: '🔒', title: 'Privacy Policy',     desc: 'How we collect and use your data.' },
  { href: '/policies/refund',   emoji: '↩️',  title: 'Refund Policy',      desc: 'Returns, refunds and damaged items.' },
  { href: '/policies/terms',    emoji: '📜', title: 'Terms & Conditions', desc: 'Rules governing use of our store.' },
  { href: '/policies/shipping', emoji: '🚚', title: 'Shipping Policy',    desc: 'Delivery areas, times and charges.' },
];

function PolicyCard({ href, emoji, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#27272a',
          border: `1px solid ${hovered ? '#facc15' : '#3f3f46'}`,
          borderRadius: '14px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          transform: hovered ? 'translateX(4px)' : 'translateX(0)',
          transition: 'border-color 0.2s ease, transform 0.2s ease',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '28px', flexShrink: 0 }}>{emoji}</span>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '15px' }}>{title}</div>
          <div style={{ color: '#64748b', fontSize: '13px', marginTop: '3px' }}>{desc}</div>
        </div>
        <span style={{ marginLeft: 'auto', color: '#facc15', fontSize: '20px' }}>›</span>
      </div>
    </Link>
  );
}

export default function PoliciesPage() {
  return (
    // ✅ Only change from original: removed `background: '#1c1c1e'` and `minHeight: '100vh'`
    // layout.js already provides Navbar + Footer + body background for all pages
    <div>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 100px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
          Policies
        </h1>
        <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '14px' }}>
          Everything you need to know about shopping with us.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {POLICIES.map(p => (
            <PolicyCard key={p.href} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}