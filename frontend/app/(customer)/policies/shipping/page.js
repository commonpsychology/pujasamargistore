'use client';
// app/policies/shipping/page.js

import Link from 'next/link';

function PolicyLayout({ title, emoji, lastUpdated, children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');

        .policy-inner {
          position: relative;
          z-index: 1;
          max-width: 780px;
          margin: 0 auto;
          padding: 52px 24px 100px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 40px;
        }
        .breadcrumb a {
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .breadcrumb a:hover { color: #94a3b8; }
        .breadcrumb-sep { color: #1e293b; font-size: 14px; }
        .breadcrumb-current {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .policy-hero {
          position: relative;
          background: linear-gradient(135deg, #0f172a 0%, #080d18 60%, #0c1220 100%);
          border: 1px solid #1e2d45;
          border-radius: 20px;
          padding: 40px 44px;
          margin-bottom: 12px;
          overflow: hidden;
        }
        .policy-hero::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent);
        }
        .hero-emoji {
          font-size: 44px;
          margin-bottom: 16px;
          display: block;
          filter: drop-shadow(0 0 20px rgba(250,204,21,0.2));
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        .hero-date {
          margin-top: 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #334155;
        }
        .hero-accent {
          position: absolute;
          bottom: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border: 1px solid rgba(250,204,21,0.06);
          border-radius: 50%;
        }
        .hero-accent::before {
          content: '';
          position: absolute;
          inset: 20px;
          border: 1px solid rgba(250,204,21,0.04);
          border-radius: 50%;
        }

        .policy-body {
          background: #0c1220;
          border: 1px solid #1a2540;
          border-radius: 20px;
          padding: 44px 44px;
          position: relative;
          overflow: hidden;
        }
        .policy-body::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.08), transparent);
        }

        .section {
          padding-bottom: 28px;
          margin-bottom: 28px;
          border-bottom: 1px solid #0f1a2e;
        }
        .section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .section-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #facc15;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(250,204,21,0.5);
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          color: #facc15;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .section-body {
          color: #64748b;
          font-size: 14px;
          line-height: 1.8;
          padding-left: 16px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 36px;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: color 0.2s, gap 0.2s;
        }
        .back-link:hover { color: #facc15; gap: 12px; }
        .back-link-arrow { font-size: 16px; transition: transform 0.2s; }
        .back-link:hover .back-link-arrow { transform: translateX(-3px); }
      `}</style>

      <div className="policy-inner">
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/policies">Policies</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{title}</span>
        </nav>

        <div className="policy-hero">
          <span className="hero-emoji">{emoji}</span>
          <h1 className="hero-title">{title}</h1>
          {lastUpdated && <p className="hero-date">Last updated — {lastUpdated}</p>}
          <div className="hero-accent" />
        </div>

        <div className="policy-body">
          {children}
        </div>

        <Link href="/policies" className="back-link">
          <span className="back-link-arrow">←</span>
          All Policies
        </Link>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-dot" />
        <h3 className="section-title">{title}</h3>
      </div>
      <p className="section-body">{children}</p>
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
        Free delivery on orders above ₹1999. A flat fee of ₹60 applies to orders below ₹1999.
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