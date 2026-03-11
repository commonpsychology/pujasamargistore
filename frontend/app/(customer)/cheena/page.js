'use client';

import { useState } from 'react';
import Link from 'next/link';
import MapHolder from '@/components/MapHolder';

const CHEENA_TYPES = [
  {
    id: 'short',
    name: 'लघु चिना',
    nameEn: 'Short Cheena',
    price: 1000,
    duration: '३०–४५ मिनेट',
    includes: [
      'जन्म राशि',
      'नक्षत्र विश्लेषण',
      'मूल स्वभाव',
      'सामान्य भविष्यफल',
    ],
  },
  {
    id: 'long',
    name: 'विस्तृत चिना',
    nameEn: 'Long Cheena',
    price: 2000,
    duration: '१–२ घण्टा',
    includes: [
      'सम्पूर्ण कुण्डली',
      'ग्रह दशा विश्लेषण',
      'विवाह योग',
      'व्यापार/शिक्षा योग',
      'उपाय सुझाव',
      'विस्तृत भविष्यफल',
    ],
  },
];

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Android Emoji",EmojiSymbols,sans-serif';

export default function CheenaPage() {
  const [selected, setSelected] = useState('short');
  const [form, setForm] = useState({
    name: '',
    nwaran: '',
    dob: '',
    tob: '',
    pob: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedType = CHEENA_TYPES.find(t => t.id === selected);

  const setField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.dob || !form.phone) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/cheena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cheena_type: selectedType.id,
          cheena_name: selectedType.name,
          price: selectedType.price,
          ...form,
        }),
      });

      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state — NO <Footer /> here, layout.js renders it globally
  if (submitted) {
    return (
      <>
        <style>{`
          :root {
            --gold: #facc15; --orange: #f97316;
            --bg: #080d18; --surface2: #111827;
          }
          .cheena-success {
            background: var(--bg);
            min-height: 70vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 60px 24px;
            font-family: 'DM Sans', sans-serif;
          }
          .success-card {
            background: var(--surface2);
            border: 1px solid var(--gold);
            padding: 50px 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 480px;
            width: 100%;
          }
          .success-card .s-emoji { font-size: 52px; margin-bottom: 16px; font-family: ${EMOJI_FONT}; }
          .success-card h2 { color: var(--gold); font-size: 28px; margin-bottom: 12px; }
          .success-card p { color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 6px; }
          .success-card button {
            margin-top: 24px; padding: 12px 28px;
            border-radius: 12px; border: none;
            background: linear-gradient(135deg, var(--gold), var(--orange));
            font-weight: 700; cursor: pointer; font-size: 14px;
            display: inline-flex; align-items: center; gap: 8px;
          }
        `}</style>
        <div className="cheena-success">
          <div className="success-card">
            <div className="s-emoji">🙏</div>
            <h2>धन्यवाद!</h2>
            <p>तपाईंको चिनाको अनुरोध सफलतापूर्वक पठाइयो।</p>
            <p>हामी छिट्टै तपाईंलाई सम्पर्क गर्नेछौं।</p>
            <button onClick={() => window.location.reload()}>
              <span style={{ fontFamily: EMOJI_FONT }}>🔄</span>
              अर्को अनुरोध गर्नुहोस्
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --gold: #facc15;
          --orange: #f97316;
          --bg: #080d18;
          --surface: #0f172a;
          --surface2: #111827;
          --text: #f1f5f9;
          --muted: #64748b;
          --dim: #1e293b;
        }

        .cheena-page {
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          padding: 60px 24px;
          font-family: 'DM Sans', sans-serif;
        }

        .cheena-page h1 {
          text-align: center;
          font-size: clamp(32px,5vw,48px);
          color: var(--gold);
          margin-bottom: 12px;
        }

        .subtitle {
          text-align: center;
          color: var(--muted);
          margin-bottom: 40px;
          font-size: 14px;
        }

        .container {
          max-width: 900px;
          margin: auto;
        }

        .types {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        @media(max-width:768px){
          .types { grid-template-columns: 1fr; }
        }

        .card {
          background: var(--surface2);
          border: 1px solid var(--dim);
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          transition: 0.2s;
        }

        .card.active {
          border-color: var(--gold);
          box-shadow: 0 0 0 2px rgba(250,204,21,0.2);
        }

        .card h3 {
          color: var(--gold);
          margin-bottom: 6px;
        }

        .price {
          font-weight: 800;
          margin-bottom: 10px;
        }

        .cheena-page ul {
          padding-left: 18px;
          color: var(--muted);
          font-size: 13px;
        }

        .form-box {
          background: var(--surface2);
          border: 1px solid var(--dim);
          border-radius: 20px;
          padding: 32px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media(max-width:768px){
          .form-grid { grid-template-columns: 1fr; }
        }

        .cheena-page input, .cheena-page textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--dim);
          background: var(--surface);
          color: var(--text);
          font-size: 14px;
        }

        .cheena-page input:focus, .cheena-page textarea:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.15);
        }

        .cheena-page textarea { resize: none; }

        .submit-btn {
          margin-top: 24px;
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          font-weight: 800;
          font-size: 15px;
          background: linear-gradient(135deg,var(--gold),var(--orange));
          color: #0f172a;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: 'DM Sans', sans-serif;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(250,204,21,0.35);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <main className="cheena-page">
        <h1>चिना सेवा</h1>
        <div className="subtitle">
          जन्मकुण्डली विश्लेषण — Personal Jyotish Birth Chart Reading
        </div>

        <div className="container">

          {/* Types */}
          <div className="types">
            {CHEENA_TYPES.map(type => (
              <div
                key={type.id}
                className={`card ${selected === type.id ? 'active' : ''}`}
                onClick={() => setSelected(type.id)}
              >
                <h3>{type.name}</h3>
                <div className="price">
                  Rs. {type.price.toLocaleString()} • {type.duration}
                </div>
                <ul>
                  {type.includes.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="form-box">
            <div className="form-grid">
              <input
                placeholder="पूरा नाम *"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
              />
              <input
                placeholder="न्वारन नाम"
                value={form.nwaran}
                onChange={e => setField('nwaran', e.target.value)}
              />
              <input
                type="date"
                value={form.dob}
                onChange={e => setField('dob', e.target.value)}
              />
              <input
                type="time"
                value={form.tob}
                onChange={e => setField('tob', e.target.value)}
              />
              <input
                placeholder="जन्म स्थान"
                value={form.pob}
                onChange={e => setField('pob', e.target.value)}
              />
              <input
                placeholder="सम्पर्क नम्बर *"
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
              />
            </div>

            <textarea
              rows="4"
              placeholder="थप जानकारी / प्रश्न"
              value={form.message}
              onChange={e => setField('message', e.target.value)}
            />

            {/* Delivery note */}
            <div style={{
              margin: '24px 0 0',
              padding: '16px 20px',
              background: 'rgba(250,204,21,0.05)',
              border: '1px solid rgba(250,204,21,0.15)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}>
              <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px', fontFamily: EMOJI_FONT }}>🪔</span>
              <div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '17px',
                  fontWeight: '700',
                  color: '#facc15',
                  marginBottom: '5px',
                  lineHeight: 1.3,
                }}>
                  ज्योतिष पुष्कर राज न्यौपाने स्वयंले
                  तपाईंको चिना तयार गरी व्यक्तिगत रूपमा प्रदान गर्नुहुनेछ।
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: 1.7,
                }}>
                  Jyotish Pushkar Raj Neupane will personally prepare and
                  deliver your Cheena reading — explained in detail, face to face.
                </p>
              </div>
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span style={{ fontFamily: EMOJI_FONT }}>⏳</span>
                  Submitting…
                </>
              ) : (
                <>
                  <span style={{ fontFamily: EMOJI_FONT }}>🤲</span>
                  चिनाको लागि अनुरोध गर्नुहोस्
                  <span style={{ fontFamily: EMOJI_FONT }}>🔮</span>
                </>
              )}
            </button>
          </div>

        </div>
      </main>
    </>
  );
}