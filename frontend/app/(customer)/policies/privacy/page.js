'use client';
// app/policies/privacy/page.js

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

        /* Breadcrumb */
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

        /* Hero card */
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

        /* Content card */
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

        /* Section */
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

        /* Back link */
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
        .back-link:hover {
          color: #facc15;
          gap: 12px;
        }
        .back-link-arrow {
          font-size: 16px;
          transition: transform 0.2s;
        }
        .back-link:hover .back-link-arrow {
          transform: translateX(-3px);
        }
      `}</style>

      <div className="policy-inner">

        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/policies">Policies</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{title}</span>
        </nav>

        {/* Hero */}
        <div className="policy-hero">
          <span className="hero-emoji">{emoji}</span>
          <h1 className="hero-title">{title}</h1>
          {lastUpdated && <p className="hero-date">Last updated — {lastUpdated}</p>}
          <div className="hero-accent" />
        </div>

        {/* Body */}
        <div className="policy-body">
          {children}
        </div>

        {/* Back */}
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

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" emoji="🔒" lastUpdated="March 2026">
      <Section title="Information We Collect">
        When you place an order or subscribe to our newsletter, we collect your name, email address,
        phone number, and delivery address. We use this solely to process your order and communicate with you.
      </Section>
      <Section title="How We Use Your Information">
        Your data is used to fulfill orders, send delivery updates, and (if subscribed) share festival
        offers. We never sell your personal information to third parties.
      </Section>
      <Section title="Data Storage">
        All data is stored securely. Payment information is processed via trusted gateways and we do
        not store card details on our servers.
      </Section>
      <Section title="Cookies">
        We use essential cookies to keep your cart active during your session. No third-party
        tracking cookies are used.
      </Section>
      <Section title="Contact">
        For privacy concerns, contact us at pujasamagri@gmail.com or call ९९८४९३५८९८८.
      </Section>
    </PolicyLayout>
  );
}