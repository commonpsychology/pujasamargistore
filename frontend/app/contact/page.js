'use client';

// app/contact/page.js
import Image from 'next/image';
import Link from 'next/link';

export default function Contact() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');

        :root {
          --gold: #facc15;
          --gold-dim: rgba(250,204,21,0.12);
          --gold-border: rgba(250,204,21,0.18);
          --orange: #f97316;
          --bg: #080d18;
          --surface: #0f172a;
          --surface2: #111827;
          --text: #f1f5f9;
          --muted: #64748b;
          --dim: #1e293b;
        }

        .contact-page * { box-sizing: border-box; }

        .contact-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          padding: 60px 24px;
        }

        h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 60px);
          font-weight: 700;
          color: var(--gold);
          margin-bottom: 24px;
          text-align: center;
        }

        p {
          font-size: 14px;
          color: var(--muted);
          text-align: center;
          margin-bottom: 32px;
        }

        .contact-container {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }

        @media (max-width: 768px) {
          .contact-container { grid-template-columns: 1fr; gap: 32px; }
        }

        .contact-info, .contact-form {
          background: var(--surface2);
          border: 1px solid var(--dim);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .info-item span {
          font-size: 24px;
        }

        .info-text {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 13px;
          color: var(--muted);
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        input, textarea {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid var(--dim);
          background: var(--surface);
          color: var(--text);
          font-size: 14px;
          resize: none;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 3px var(--gold-dim);
        }

        .btn-submit {
          background: linear-gradient(135deg, #facc15, #f97316);
          color: #0f172a;
          font-weight: 800;
          font-size: 14px;
          padding: 14px 24px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(250,204,21,0.35);
        }

        .contact-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--gold);
          margin-bottom: 12px;
        }

        .contact-sub {
          font-size: 13px;
          color: var(--muted);
        }
      `}</style>

      <main className="contact-page">
        <h1>Contact Us</h1>
        <p>Have questions or need assistance? Reach out to us anytime — हामीसँग सम्पर्क गर्नुहोस्।</p>

        <div className="contact-container">
          {/* Contact Info */}
          <div className="contact-info">
            <div className="info-item">
              <span>📞</span>
              <div className="info-text">
                <div className="info-label">Phone / फोन</div>
                <div className="info-value">9857363832</div>
              </div>
            </div>

            <div className="info-item">
              <span>📧</span>
              <div className="info-text">
                <div className="info-label">Email / इमेल</div>
                <div className="info-value">pujasamagri@gmail.com</div>
              </div>
            </div>

            <div className="info-item">
              <span>📍</span>
              <div className="info-text">
                <div className="info-label">Address / ठेगाना</div>
                <div className="info-value">Kathmandu Valley, Nepal</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form">
            <div className="contact-heading">Send a Message / सन्देश पठाउनुहोस्</div>
            <div className="contact-sub">Fill out the form below and we’ll get back to you soon.</div>

            <form action="mailto:pujasamagri@gmail.com" method="post" encType="text/plain">
              <input type="text" name="name" placeholder="Your Name / नाम" required />
              <input type="email" name="email" placeholder="Your Email / इमेल" required />
              <textarea name="message" placeholder="Your Message / सन्देश" rows="5" required />
              <button type="submit" className="btn-submit">Send / पठाउनुहोस्</button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}