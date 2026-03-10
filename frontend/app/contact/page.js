'use client';
// app/contact/page.js

import { useState } from 'react';

export default function Contact() {
  const [form, setForm]         = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      setError('Name and message are required.');
      return;
    }
    setError('');
    setSending(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');
        :root {
          --gold: #facc15; --gold-dim: rgba(250,204,21,0.12); --gold-border: rgba(250,204,21,0.18);
          --orange: #f97316; --bg: #080d18; --surface: #0f172a; --surface2: #111827;
          --text: #f1f5f9; --muted: #64748b; --dim: #1e293b;
        }
        .contact-page * { box-sizing: border-box; }
        .contact-page {
          font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text);
          min-height: 100vh; padding: 60px 24px;
        }
        .contact-page h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 60px); font-weight: 700; color: var(--gold);
          margin-bottom: 12px; text-align: center;
        }
        .contact-page .subtitle { font-size: 14px; color: var(--muted); text-align: center; margin-bottom: 40px; }
        .contact-container {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
        }
        @media (max-width: 768px) { .contact-container { grid-template-columns: 1fr; gap: 24px; } }
        .contact-info, .contact-form {
          background: var(--surface2); border: 1px solid var(--dim);
          border-radius: 20px; padding: 32px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .contact-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 700; color: var(--gold); margin-bottom: 20px;
        }
        .info-item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
        .info-item .icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
        .info-label { font-size: 11px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .info-value { font-size: 15px; font-weight: 700; color: var(--text); }
        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .form-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1px solid var(--dim); background: var(--surface);
          color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .form-input:focus { border-color: rgba(250,204,21,0.4); box-shadow: 0 0 0 3px var(--gold-dim); }
        .form-input::placeholder { color: #334155; }
        .form-input.textarea { resize: vertical; min-height: 110px; }
        .error-msg {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
          color: #ef4444; border-radius: 10px; padding: 10px 14px;
          font-size: 13px; font-weight: 600; margin-bottom: 12px;
        }
        .btn-submit {
          width: 100%; background: linear-gradient(135deg, var(--gold), var(--orange));
          color: #0f172a; font-weight: 800; font-size: 15px;
          padding: 14px 24px; border-radius: 14px; border: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(250,204,21,0.35); }
        .success-box {
          background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25);
          border-radius: 16px; padding: 28px; text-align: center;
        }
        .success-box .emoji { font-size: 40px; margin-bottom: 10px; }
        .success-box h3 { color: #22c55e; font-size: 18px; font-weight: 800; margin-bottom: 6px; }
        .success-box p { color: #64748b; font-size: 13px; }
      `}</style>

      <main className="contact-page">
        <h1>Contact Us</h1>
        <p className="subtitle">
          Have questions? Reach out — हामीसँग सम्पर्क गर्नुहोस्।
        </p>

        <div className="contact-container">
          {/* Info */}
          <div className="contact-info">
            <p className="contact-heading">Get in Touch</p>
            <div className="info-item">
              <span className="icon">📞</span>
              <div>
                <div className="info-label">Phone / फोन</div>
                <div className="info-value">9857363832</div>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">📧</span>
              <div>
                <div className="info-label">Email / इमेल</div>
                <div className="info-value">pujasamagri@gmail.com</div>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">📍</span>
              <div>
                <div className="info-label">Address / ठेगाना</div>
                <div className="info-value">Kathmandu Valley, Nepal</div>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">🕐</span>
              <div>
                <div className="info-label">Hours / समय</div>
                <div className="info-value">७ AM – ८ PM (Sun–Sat)</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form">
            <p className="contact-heading">Send a Message / सन्देश पठाउनुहोस्</p>

            {sent ? (
              <div className="success-box">
                <div className="emoji">🙏</div>
                <h3>Message Sent!</h3>
                <p>We received your message and will get back to you soon.<br />धन्यवाद!</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" placeholder="Your full name"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="your@email.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="98XXXXXXXX"
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-input textarea" rows={5}
                    placeholder="Your message / तपाईंको सन्देश"
                    value={form.message} onChange={e => set('message', e.target.value)} />
                </div>

                {error && <div className="error-msg">⚠️ {error}</div>}

                <button className="btn-submit" onClick={handleSubmit} disabled={sending}>
                  {sending ? '⏳ Sending…' : '📨 Send Message / पठाउनुहोस्'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}