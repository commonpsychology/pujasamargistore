'use client';
// app/policies/shipping/page.js
// ✅ Self-contained — no external component imports needed

import Link from 'next/link';

function PolicyLayout({ title, emoji, lastUpdated, children }) {
  return (
    <div style={{ background: '#1c1c1e', minHeight: '100vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <Link href="/" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: '#475569' }}>›</span>
          <Link href="/policies" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>Policies</Link>
          <span style={{ color: '#475569' }}>›</span>
          <span style={{ color: '#f1f5f9', fontSize: '13px' }}>{title}</span>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid #334155', borderRadius: '16px', padding: '36px 40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>{emoji}</div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#f8fafc', margin: 0 }}>{title}</h1>
          {lastUpdated && <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>Last updated: {lastUpdated}</p>}
        </div>
        <div style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: '16px', padding: '36px 40px' }}>
          {children}
        </div>
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link href="/policies" style={{ color: '#facc15', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>← Back to all policies</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#facc15', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '14px', margin: 0 }}>{children}</p>
    </div>
  );
}

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy" emoji="🚚" lastUpdated="March 2026">
      <Section title="Delivery Areas">
        We currently deliver within the Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur). Orders
        to other districts may be arranged — contact us for availability.
      </Section>
      <Section title="Same-Day Delivery">
        Orders placed before 2:00 PM are eligible for same-day delivery within the valley. Orders
        after 2 PM are delivered the next business day.
      </Section>
      <Section title="Delivery Charges">
        Free delivery on orders above ₹499. A flat fee of ₹60 applies to orders below ₹499.
      </Section>
      <Section title="Delivery Time">
        Standard: 1–2 business days. Same-day: within 4–6 hours of order confirmation.
      </Section>
      <Section title="Order Tracking">
        Once dispatched, you will receive an SMS with your delivery status. Call ९९८४९३५८९८८ for
        live updates.
      </Section>
      <Section title="Failed Delivery">
        If delivery fails due to wrong address or unavailability, we attempt redelivery once. After
        two failed attempts the order is returned and refunded minus delivery charges.
      </Section>
    </PolicyLayout>
  );
}