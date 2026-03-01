'use client';
// app/policies/terms/page.js
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

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms & Conditions" emoji="📜" lastUpdated="March 2026">
      <Section title="Acceptance of Terms">
        By browsing or purchasing from पूजा सामग्री, you agree to these terms. If you disagree,
        please do not use this website.
      </Section>
      <Section title="Products & Pricing">
        All prices are in Nepalese Rupees (₹ NPR). We reserve the right to update prices without
        prior notice. Product availability is subject to stock.
      </Section>
      <Section title="Orders">
        An order confirmation indicates we received your order, not that it has been accepted. We
        reserve the right to cancel any order due to pricing errors, stock issues, or suspected fraud.
      </Section>
      <Section title="Intellectual Property">
        All content — text, images, branding — is the property of पूजा सामग्री and may not be used
        without written permission.
      </Section>
      <Section title="Limitation of Liability">
        We are not liable for indirect or consequential damages beyond the original purchase price.
      </Section>
      <Section title="Governing Law">
        These terms are governed by the laws of Nepal. Disputes shall be resolved in the courts of
        Bhaktapur, Nepal.
      </Section>
    </PolicyLayout>
  );
}