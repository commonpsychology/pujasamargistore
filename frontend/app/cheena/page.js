'use client';

// app/cheena/page.js

import { useState } from 'react';

const CHEENA_TYPES = [
  {
    id: 'short',
    name: 'लघु चिना',
    nameEn: 'Short Cheena',
    price: 1000,
    duration: '~३०–४५ मिनेट',
    includes: ['जन्म राशि', 'नक्षत्र विश्लेषण', 'मूल स्वभाव', 'सामान्य भविष्यफल'],
  },
  {
    id: 'long',
    name: 'विस्तृत चिना',
    nameEn: 'Long Cheena',
    price: 2000,
    duration: '~१–२ घण्टा',
    includes: ['सम्पूर्ण कुण्डली', 'ग्रह दशा विश्लेषण', 'विवाह योग', 'व्यापार/शिक्षा योग', 'उपाय सुझाव', 'विस्तृत भविष्यफल'],
  },
];

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
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.dob || !form.phone.trim()) return;
    setSubmitting(true);
    // Simulate submission — wire to /api/cheena or email service later
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const selectedType = CHEENA_TYPES.find(t => t.id === selected);

  if (submitted) {
    return (
      <div style={{
        fontFamily: "'Tiro Devanagari Sanskrit', 'Noto Serif Devanagari', serif",
        background: '#0a0700',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Stars bg */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 65%)' }} />

        <div style={{
          position: 'relative', zIndex: 1,
          background: 'linear-gradient(160deg, #1c1400, #0f0d00)',
          border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: '28px',
          padding: '56px 40px',
          maxWidth: '480px', width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 80px rgba(251,191,36,0.06)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', lineHeight: 1 }}>🙏</div>
          <h2 style={{ color: '#fbbf24', fontSize: '28px', margin: '0 0 12px', fontWeight: 700 }}>
            धन्यवाद!
          </h2>
          <p style={{ color: '#92400e', fontSize: '15px', lineHeight: 1.8, margin: '0 0 8px' }}>
            तपाईंको चिनाको अनुरोध प्राप्त भयो।
          </p>
          <p style={{ color: '#78350f', fontSize: '13px', lineHeight: 1.8, margin: '0 0 32px' }}>
            पण्डित पुष्कर राज न्यौपानेले छिट्टै तपाईंलाई सम्पर्क गर्नुहुनेछ।<br />
            चिना व्यक्तिगत रूपमा प्रदान गरिनेछ।
          </p>
          <div style={{
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.15)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '32px',
            fontSize: '13px',
            color: '#d97706',
            lineHeight: 1.8,
          }}>
            📞 ९८४९३५००८८<br />
            📍 ठिमी, भक्तपुर
          </div>
          <button
            onClick={() => { setSubmitted(false); setForm({ name:'',nwaran:'',dob:'',tob:'',pob:'',phone:'',message:'' }); }}
            style={{
              background: 'linear-gradient(135deg, #92400e, #fbbf24)',
              color: '#0a0700', border: 'none', padding: '13px 28px',
              borderRadius: '12px', fontSize: '14px', fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            अर्को अनुरोध गर्नुहोस्
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit:ital@0;1&family=Noto+Serif+Devanagari:wght@400;600;700&family=DM+Sans:wght@400;600;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cheena-page {
          font-family: 'DM Sans', sans-serif;
          background: #0a0700;
          color: #e2c97e;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Atmospheric background ── */
        .bg-glow {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 80% 40% at 50% -10%, rgba(251,191,36,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(180,83,9,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 70%, rgba(251,191,36,0.04) 0%, transparent 60%);
        }

        /* Subtle star dots */
        .stars {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            radial-gradient(1px 1px at 15% 20%, rgba(251,191,36,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 8%, rgba(251,191,36,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 15%, rgba(251,191,36,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 5%, rgba(251,191,36,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 25%, rgba(251,191,36,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 55%, rgba(251,191,36,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 60%, rgba(251,191,36,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 45%, rgba(251,191,36,0.1) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 75%, rgba(251,191,36,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 85%, rgba(251,191,36,0.15) 0%, transparent 100%);
        }

        .content {
          position: relative; z-index: 1;
          max-width: 740px; margin: 0 auto; padding: 60px 24px 100px;
        }

        /* ── Hero ── */
        .hero { text-align: center; margin-bottom: 56px; }

        .om-symbol {
          font-size: 52px; line-height: 1; margin-bottom: 24px;
          display: block;
          animation: omPulse 3s ease-in-out infinite;
        }
        @keyframes omPulse {
          0%, 100% { opacity: 0.7; text-shadow: 0 0 20px rgba(251,191,36,0.3); }
          50% { opacity: 1; text-shadow: 0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.2); }
        }

        .hero-divider {
          display: flex; align-items: center; gap: 16px;
          justify-content: center; margin-bottom: 20px;
        }
        .divider-line {
          width: 60px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,0.4));
        }
        .divider-line.right { background: linear-gradient(90deg, rgba(251,191,36,0.4), transparent); }
        .divider-dot { width: 4px; height: 4px; background: #fbbf24; border-radius: 50%; }

        .hero-title {
          font-family: 'Tiro Devanagari Sanskrit', serif;
          font-size: clamp(42px, 7vw, 72px);
          font-weight: 400;
          color: #fbbf24;
          line-height: 1.1;
          margin-bottom: 10px;
          text-shadow: 0 0 40px rgba(251,191,36,0.2);
          letter-spacing: 2px;
        }
        .hero-subtitle-nep {
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 16px; color: #92400e; margin-bottom: 6px;
        }
        .hero-subtitle-en {
          font-size: 12px; color: #44301a; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;
        }

        .pandit-credit {
          margin-top: 24px;
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(251,191,36,0.06);
          border: 1px solid rgba(251,191,36,0.12);
          border-radius: 999px;
          padding: 8px 18px;
          font-size: 13px; color: #92400e; font-weight: 600;
        }

        /* ── Description block ── */
        .desc-block {
          background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(251,191,36,0.02));
          border: 1px solid rgba(251,191,36,0.1);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 48px;
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 15px; color: #78350f; line-height: 1.9;
          text-align: center;
        }

        /* ── Price cards ── */
        .price-section { margin-bottom: 48px; }
        .section-label {
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          color: #44301a; font-weight: 800; margin-bottom: 16px; text-align: center;
        }
        .price-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 500px) { .price-cards { grid-template-columns: 1fr; } }

        .price-card {
          background: linear-gradient(160deg, #140f00, #0d0900);
          border: 2px solid rgba(251,191,36,0.1);
          border-radius: 20px; padding: 24px;
          cursor: pointer; transition: all 0.25s;
          position: relative; overflow: hidden;
        }
        .price-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at top left, rgba(251,191,36,0.06), transparent 60%);
          opacity: 0; transition: opacity 0.25s;
        }
        .price-card:hover::before { opacity: 1; }
        .price-card.active {
          border-color: rgba(251,191,36,0.45);
          background: linear-gradient(160deg, #1c1400, #100c00);
          box-shadow: 0 0 40px rgba(251,191,36,0.08), inset 0 1px 0 rgba(251,191,36,0.1);
        }
        .price-card.active::before { opacity: 1; }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .card-name-nep {
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 18px; color: #fbbf24; font-weight: 700;
        }
        .card-name-en { font-size: 11px; color: #78350f; margin-top: 2px; }
        .card-price {
          font-size: 22px; font-weight: 900; color: #fbbf24;
          text-align: right;
        }
        .card-price span { font-size: 12px; font-weight: 600; color: #78350f; display: block; }

        .card-duration {
          font-size: 12px; color: #92400e; margin-bottom: 14px;
          font-family: 'Noto Serif Devanagari', serif;
        }
        .card-includes { list-style: none; }
        .card-includes li {
          font-size: 12px; color: #78350f; padding: 3px 0;
          font-family: 'Noto Serif Devanagari', serif;
          display: flex; gap: 8px; align-items: flex-start;
        }
        .card-includes li::before { content: '•'; color: rgba(251,191,36,0.4); flex-shrink: 0; }

        .selected-indicator {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.25);
          color: #fbbf24; font-size: 11px; font-weight: 800;
          padding: 4px 10px; border-radius: 999px; margin-top: 14px;
        }

        /* ── Form ── */
        .form-section {
          background: linear-gradient(160deg, #140f00, #0d0900);
          border: 1px solid rgba(251,191,36,0.12);
          border-radius: 24px; padding: 36px 32px;
          margin-bottom: 32px;
        }
        @media (max-width: 520px) { .form-section { padding: 24px 18px; } }

        .form-title {
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 20px; color: #fbbf24; margin-bottom: 24px; font-weight: 700;
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 520px) { .form-grid { grid-template-columns: 1fr; } }
        .form-full { grid-column: 1 / -1; }

        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label {
          font-size: 11px; font-weight: 800; color: #78350f;
          text-transform: uppercase; letter-spacing: 0.5px;
          font-family: 'Noto Serif Devanagari', serif;
        }
        .form-label span { color: #fbbf24; margin-left: 2px; }
        .form-input, .form-textarea {
          background: rgba(251,191,36,0.03);
          border: 1px solid rgba(251,191,36,0.12);
          border-radius: 10px; padding: 11px 14px;
          color: #e2c97e; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s, background 0.2s;
          width: 100%;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: rgba(251,191,36,0.35);
          background: rgba(251,191,36,0.05);
        }
        .form-input::placeholder, .form-textarea::placeholder { color: #44301a; }
        .form-textarea { resize: vertical; min-height: 90px; }

        /* ── Delivery note ── */
        .delivery-note {
          background: rgba(251,191,36,0.04);
          border: 1px solid rgba(251,191,36,0.1);
          border-left: 3px solid rgba(251,191,36,0.4);
          border-radius: 12px; padding: 18px 20px;
          margin-bottom: 28px;
        }
        .delivery-note p {
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 14px; color: #92400e; line-height: 1.8; margin: 0;
        }
        .delivery-note p strong { color: #d97706; }

        /* ── Submit button ── */
        .submit-btn {
          width: 100%; padding: 18px;
          background: linear-gradient(135deg, #92400e, #fbbf24, #d97706);
          background-size: 200% 100%;
          background-position: 0% 50%;
          color: #0a0700; border: none; border-radius: 14px;
          font-size: 17px; font-weight: 800; cursor: pointer;
          font-family: 'Noto Serif Devanagari', serif;
          transition: background-position 0.4s, transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.5px;
        }
        .submit-btn:hover {
          background-position: 100% 50%;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(251,191,36,0.25);
        }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Contact strip ── */
        .contact-strip {
          text-align: center; margin-top: 40px;
          display: flex; align-items: center; justify-content: center;
          gap: 28px; flex-wrap: wrap;
        }
        .contact-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #78350f; font-weight: 600;
          text-decoration: none; transition: color 0.2s;
        }
        .contact-item:hover { color: #fbbf24; }
      `}</style>

      <div className="cheena-page">
        <div className="bg-glow" />
        <div className="stars" />

        <div className="content">

          {/* ── Hero ── */}
          <div className="hero">
            <span className="om-symbol">ॐ</span>
            <div className="hero-divider">
              <div className="divider-line" />
              <div className="divider-dot" />
              <div className="divider-line right" />
            </div>
            <h1 className="hero-title">चिना</h1>
            <p className="hero-subtitle-nep">जन्मकुण्डली विश्लेषण सेवा</p>
            <p className="hero-subtitle-en">Jyotish · Birth Chart Reading</p>
            <div className="pandit-credit">
              <span>🙏</span>
              <span>पण्डित पुष्कर राज न्यौपाने, ठिमी भक्तपुर</span>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="desc-block">
            चिना भनेको जन्मको समय, मिति र स्थानको आधारमा तयार पारिएको ज्योतिषीय कुण्डली हो।
            यसले तपाईंको जीवनको विभिन्न पक्षहरू — स्वास्थ्य, विवाह, व्यापार, शिक्षा र भविष्यफलको
            गहन विश्लेषण प्रदान गर्दछ। पण्डितजीले दशकौँको अनुभव र परम्परागत ज्ञानका आधारमा
            तपाईंको चिना तयार पार्नुहुनेछ।
          </div>

          {/* ── Price cards ── */}
          <div className="price-section">
            <p className="section-label">चिनाको प्रकार छान्नुहोस्</p>
            <div className="price-cards">
              {CHEENA_TYPES.map(t => (
                <div
                  key={t.id}
                  className={`price-card${selected === t.id ? ' active' : ''}`}
                  onClick={() => setSelected(t.id)}
                >
                  <div className="card-top">
                    <div>
                      <div className="card-name-nep">{t.name}</div>
                      <div className="card-name-en">{t.nameEn}</div>
                    </div>
                    <div className="card-price">
                      Rs. {t.price.toLocaleString()}
                      <span>मूल्य</span>
                    </div>
                  </div>
                  <div className="card-duration">⏱ {t.duration}</div>
                  <ul className="card-includes">
                    {t.includes.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {selected === t.id && (
                    <div className="selected-indicator">✓ चयन गरिएको</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Form ── */}
          <div className="form-section">
            <p className="form-title">📋 विवरण भर्नुहोस्</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">पूरा नाम <span>*</span></label>
                <input className="form-input" placeholder="तपाईंको पूरा नाम" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">न्वारन नाम</label>
                <input className="form-input" placeholder="न्वारनमा राखिएको नाम" value={form.nwaran} onChange={e => set('nwaran', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">जन्म मिति <span>*</span></label>
                <input className="form-input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                  style={{ colorScheme: 'dark' }} />
              </div>

              <div className="form-group">
                <label className="form-label">जन्म समय</label>
                <input className="form-input" type="time" value={form.tob} onChange={e => set('tob', e.target.value)}
                  style={{ colorScheme: 'dark' }} placeholder="यदि थाहा छ भने" />
              </div>

              <div className="form-group form-full">
                <label className="form-label">जन्म स्थान</label>
                <input className="form-input" placeholder="जिल्ला, गाउँ वा शहर (जस्तै: भक्तपुर, काठमाडौँ)" value={form.pob} onChange={e => set('pob', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">सम्पर्क नम्बर <span>*</span></label>
                <input className="form-input" placeholder="९८XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">चिनाको प्रकार</label>
                <input className="form-input"
                  value={`${selectedType.name} — Rs. ${selectedType.price.toLocaleString()}`}
                  readOnly
                  style={{ color: '#fbbf24', fontWeight: 700 }}
                />
              </div>

              <div className="form-group form-full">
                <label className="form-label">थप जानकारी / प्रश्न</label>
                <textarea className="form-textarea" placeholder="यदि कुनै विशेष प्रश्न वा जानकारी छ भने यहाँ लेख्नुहोस्..." value={form.message} onChange={e => set('message', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── Delivery note ── */}
          <div className="delivery-note">
            <p>
              🪔 <strong>व्यक्तिगत सेवा:</strong> चिना तयार भएपछि पण्डितजीले तपाईंलाई
              <strong> व्यक्तिगत रूपमा भेटेर विस्तृत व्याख्या गर्नुहुनेछ।</strong><br />
              चिना व्यक्तिगत रूपमा प्रदान गरी व्याख्या गरिनेछ।
            </p>
          </div>

          {/* ── Submit ── */}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim() || !form.dob || !form.phone.trim()}
          >
            {submitting ? '⏳ पठाउँदैछ...' : '🙏 चिनाको लागि अनुरोध गर्नुहोस्'}
          </button>

          {/* ── Contact ── */}
          <div className="contact-strip">
            <a href="tel:9849350088" className="contact-item">📞 ९८४९३५००८८</a>
            <span style={{ color: '#1c1400' }}>·</span>
            <span className="contact-item">📍 ठिमी, भक्तपुर</span>
            <span style={{ color: '#1c1400' }}>·</span>
            <span className="contact-item">🕐 बिहान ६ — साँझ ७</span>
          </div>

        </div>
      </div>
    </>
  );
}