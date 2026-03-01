'use client';

// app/order/page.js
// Puja & Karma Kanda ordering page
// On card click → modal form → saves name, location, puja type to DB via /api/puja-orders

import { useState, useCallback } from 'react';

const PUJAS = [
  // Festivals
  { id: 1,  type: 'festival', emoji: '🪔', name: 'Tihar Puja',         nameNe: 'तिहार पूजा',          duration: '3–5 days',  price: 'From Rs. 2100', desc: 'Lakshmi Puja, Gobardhan, Bhai Tika with full ritual setup and materials.' },
  { id: 2,  type: 'festival', emoji: '⚔️', name: 'Dashain Puja',       nameNe: 'दशैं पूजा',           duration: '10 days',   price: 'From Rs. 3500', desc: 'Ghatasthapana to Vijaya Dashami — complete Navaratri and tika ceremony.' },
  { id: 3,  type: 'festival', emoji: '🌊', name: 'Chhath Puja',        nameNe: 'छठ पूजा',             duration: '4 days',    price: 'From Rs. 1800', desc: 'Surya Shashthi vrat with evening and morning arghya at river or kunda.' },
  { id: 4,  type: 'festival', emoji: '🐍', name: 'Nag Panchami',       nameNe: 'नाग पञ्चमी',          duration: '1 day',     price: 'From Rs. 800',  desc: 'Naga deity worship with milk offering, protective rituals for the home.' },
  { id: 5,  type: 'festival', emoji: '🌸', name: 'Teej Puja',          nameNe: 'तीज पूजा',            duration: '1 day',     price: 'From Rs. 1100', desc: 'Haritalika Teej vrat for married women — Shiva-Parvati puja with darshan.' },
  { id: 6,  type: 'festival', emoji: '🌕', name: 'Kojagrat Purnima',   nameNe: 'कोजाग्रत पूर्णिमा',   duration: '1 night',   price: 'From Rs. 1200', desc: 'Lakshmi Puja on the full moon night with all-night jagaran rituals.' },
  { id: 7,  type: 'festival', emoji: '🎋', name: 'Krishna Janmashtami',nameNe: 'कृष्ण जन्माष्टमी',    duration: '1 day',     price: 'From Rs. 950',  desc: 'Midnight birth celebration of Lord Krishna with janma abhishek.' },
  { id: 8,  type: 'festival', emoji: '☀️', name: 'Makar Sankranti',    nameNe: 'माघे सङ्क्रान्ति',    duration: '1 day',     price: 'From Rs. 700',  desc: 'Holy dip at river confluence, til-ghee havan, and Surya Narayan puja.' },
  { id: 9,  type: 'festival', emoji: '🌺', name: 'Ram Navami Puja',    nameNe: 'राम नवमी पूजा',       duration: '1 day',     price: 'From Rs. 900',  desc: 'Lord Rama birth anniversary puja with recitation of Ramacharitmanas.' },
  { id: 10, type: 'festival', emoji: '🔱', name: 'Maha Shivratri',     nameNe: 'महाशिवरात्री',        duration: '1 night',   price: 'From Rs. 1300', desc: 'All-night Shiva jagaran, Rudrabhishek with Panchamrit, 108 diya offering.' },

  // Karma Kanda (Life Rituals)
  { id: 11, type: 'karma',    emoji: '🏠', name: 'Griha Pravesh',       nameNe: 'गृहप्रवेश',           duration: '1 day',     price: 'From Rs. 4500', desc: 'Complete housewarming — Vastu puja, kalash sthapana, and grihashanti havan.' },
  { id: 12, type: 'karma',    emoji: '👶', name: 'Nwaran (Baby Naming)',nameNe: 'न्वारन संस्कार',       duration: 'Half day',  price: 'From Rs. 2800', desc: 'Traditional Nwaran ceremony — naming, sun darshan, rice feeding ritual.' },
  { id: 13, type: 'karma',    emoji: '✂️', name: 'Chudakarma',          nameNe: 'चूडाकर्म संस्कार',    duration: 'Half day',  price: 'From Rs. 2200', desc: 'First hair-cutting ritual for boys with havan and family blessing.' },
  { id: 14, type: 'karma',    emoji: '📿', name: 'Bratabandha',         nameNe: 'ब्रतबन्ध',            duration: '1 day',     price: 'From Rs. 6500', desc: 'Sacred thread ceremony — upanayana, yagyopavit, and Gayatri mantra initiation.' },
  { id: 15, type: 'karma',    emoji: '💍', name: 'Vivah (Wedding Puja)',nameNe: 'विवाह पूजा',          duration: '2 days',    price: 'From Rs. 9500', desc: 'Full Vedic wedding — lagna puja, saptapadi, sindur daan and bidaai.' },
  { id: 16, type: 'karma',    emoji: '🌾', name: 'Pasni (Rice Feeding)',nameNe: 'पस्नी',               duration: 'Half day',  price: 'From Rs. 2500', desc: 'Annaprashana — first solid food ceremony for baby with family havan.' },
  { id: 17, type: 'karma',    emoji: '📖', name: 'Vidyarambha',         nameNe: 'विद्यारम्भ',          duration: 'Half day',  price: 'From Rs. 1800', desc: 'Saraswati puja and first writing initiation for children starting school.' },
  { id: 18, type: 'karma',    emoji: '🕊️', name: 'Shraddha & Pinda',   nameNe: 'श्राद्ध पूजा',        duration: '1 day',     price: 'From Rs. 3200', desc: 'Pitru tarpan, pinda daan, and annual shraddha for ancestors at home or ghat.' },
  { id: 19, type: 'karma',    emoji: '🔥', name: 'Havan & Yagya',       nameNe: 'हवन यज्ञ',           duration: '2–4 hrs',   price: 'From Rs. 2000', desc: 'Customized havan for health, prosperity, or any occasion with pandit.' },
  { id: 20, type: 'karma',    emoji: '🏡', name: 'Vastu Shanti',        nameNe: 'वास्तु शान्ति',       duration: '1 day',     price: 'From Rs. 3800', desc: 'Vastu dosha removal, directional puja, and shanti havan for peace at home.' },
  { id: 21, type: 'karma',    emoji: '🌙', name: 'Satyanarayan Katha',  nameNe: 'सत्यनारायण कथा',     duration: '3–4 hrs',   price: 'From Rs. 1500', desc: 'Lord Vishnu Satyanarayan Vrat katha with prasad, kalash, and panchamrit.' },
  { id: 22, type: 'karma',    emoji: '💫', name: 'Navagrah Puja',       nameNe: 'नवग्रह पूजा',         duration: '2–3 hrs',   price: 'From Rs. 2400', desc: 'Nine planetary deity worship to remove dosh and bring astrological harmony.' },
];

const TYPE_LABELS = { festival: '🎪 Festival', karma: '🕉️ Karma Kanda' };

export default function OrderPage() {
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState(null); // puja being ordered
  const [form, setForm]           = useState({ name: '', phone: '', location: '', date: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  const filtered = filter === 'all' ? PUJAS : PUJAS.filter(p => p.type === filter);

  const openModal = useCallback((puja) => {
    setSelected(puja);
    setForm({ name: '', phone: '', location: '', date: '', note: '' });
    setSuccess(false);
    setError('');
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
    setSuccess(false);
    setError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.location.trim() || !form.date) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/puja-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puja_id:    selected.id,
          puja_name:  selected.name,
          puja_name_ne: selected.nameNe,
          name:       form.name.trim(),
          phone:      form.phone.trim(),
          location:   form.location.trim(),
          date:       form.date,
          note:       form.note.trim(),
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setSuccess(true);
    } catch {
      setError('Failed to submit order. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  }, [form, selected]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');

        :root {
          --gold: #facc15;
          --orange: #f97316;
          --bg: #080d18;
          --surface: #0f172a;
          --surface2: #111827;
          --border: #1e293b;
          --muted: #64748b;
          --text: #f1f5f9;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes overlayIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes modalIn {
          from { opacity:0; transform:translateY(32px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        @keyframes rotateSlow {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .order-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          padding: 56px 24px 80px;
        }

        /* Hero header */
        .hero {
          text-align: center;
          margin-bottom: 52px;
          position: relative;
          animation: fadeUp 0.6s ease both;
        }
        .hero-ring {
          position: absolute;
          width: 420px; height: 420px;
          border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.07);
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          animation: rotateSlow 40s linear infinite;
          pointer-events: none;
        }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(250,204,21,0.1);
          border: 1px solid rgba(250,204,21,0.2);
          border-radius: 999px;
          padding: 6px 18px;
          font-size: 11px; font-weight: 800;
          color: var(--gold); letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 18px;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 6vw, 68px);
          font-weight: 700; line-height: 1.05;
          color: var(--text); margin: 0 0 12px;
        }
        .hero-title em {
          font-style: italic;
          background: linear-gradient(90deg, var(--gold), var(--orange), var(--gold));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .hero-sub {
          color: var(--muted); font-size: 15px; margin: 0 auto;
          max-width: 520px; line-height: 1.7;
        }

        /* Filter tabs */
        .filter-tabs {
          display: flex; justify-content: center; gap: 10px;
          margin-bottom: 44px; flex-wrap: wrap;
        }
        .tab-btn {
          padding: 10px 24px; border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface2);
          color: var(--muted);
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .tab-btn:hover { border-color: rgba(250,204,21,0.3); color: #94a3b8; }
        .tab-btn.active {
          background: rgba(250,204,21,0.1);
          border-color: rgba(250,204,21,0.35);
          color: var(--gold);
        }

        /* Section label */
        .section-label {
          font-size: 11px; font-weight: 800;
          letter-spacing: 3px; color: var(--gold);
          text-transform: uppercase;
          margin: 0 0 20px 2px;
        }

        /* Grid */
        .pujas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          max-width: 1300px; margin: 0 auto;
        }

        /* Card */
        @keyframes cardIn {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .puja-card {
          background: linear-gradient(145deg, #111827, #0f172a);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 28px 24px 22px;
          cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
          animation: cardIn 0.4s ease both;
          position: relative;
          overflow: hidden;
        }
        .puja-card::before {
          content: '';
          position: absolute; top: 0; right: 0;
          width: 100px; height: 100px;
          background: radial-gradient(circle, rgba(250,204,21,0.05), transparent 70%);
          pointer-events: none;
        }
        .puja-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(250,204,21,0.1);
          border-color: rgba(250,204,21,0.25);
        }
        .card-type-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 9px; font-weight: 800;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 3px 10px; border-radius: 999px;
          margin-bottom: 16px;
        }
        .card-type-badge.festival {
          background: rgba(249,115,22,0.12);
          border: 1px solid rgba(249,115,22,0.25);
          color: #f97316;
        }
        .card-type-badge.karma {
          background: rgba(250,204,21,0.1);
          border: 1px solid rgba(250,204,21,0.22);
          color: var(--gold);
        }
        .card-emoji {
          font-size: 44px; margin-bottom: 14px;
          display: block; line-height: 1;
        }
        .card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 700;
          color: var(--text); margin: 0 0 3px; line-height: 1.2;
        }
        .card-name-ne {
          font-size: 13px; color: var(--gold);
          font-style: italic; margin: 0 0 12px;
        }
        .card-desc {
          font-size: 12px; color: var(--muted);
          line-height: 1.65; margin: 0 0 18px;
        }
        .card-meta {
          display: flex; gap: 10px; flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .meta-pill {
          font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          color: #475569;
        }
        .meta-pill.price { color: var(--gold); border-color: rgba(250,204,21,0.15); background: rgba(250,204,21,0.06); }
        .book-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #854d0e, #facc15);
          color: #0f172a; font-weight: 900; font-size: 13px;
          border: none; border-radius: 12px; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
        }
        .book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(250,204,21,0.3);
        }
        .book-btn:active { transform: scale(0.98); }

        /* Modal overlay */
        .overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: overlayIn 0.25s ease both;
        }
        .modal {
          background: #0f172a;
          border: 1px solid rgba(250,204,21,0.2);
          border-radius: 24px;
          width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
          padding: 36px 32px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7);
          animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          scrollbar-width: thin;
          scrollbar-color: rgba(250,204,21,0.2) transparent;
          position: relative;
        }
        .modal-close {
          position: absolute; top: 16px; right: 20px;
          background: rgba(255,255,255,0.06); border: 1px solid var(--border);
          color: var(--muted); font-size: 16px;
          width: 32px; height: 32px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; font-family: inherit;
        }
        .modal-close:hover { background: rgba(255,255,255,0.12); color: var(--text); }
        .modal-puja-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 700;
          color: var(--text); margin: 0 0 4px;
        }
        .modal-puja-ne {
          color: var(--gold); font-style: italic;
          font-size: 13px; margin: 0 0 24px;
        }

        /* Form */
        .form-group { margin-bottom: 18px; }
        .form-label {
          display: block; font-size: 12px; font-weight: 700;
          color: #64748b; margin-bottom: 7px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .form-label span { color: #ef4444; margin-left: 2px; }
        .form-input, .form-textarea {
          width: 100%; background: #111827;
          border: 1px solid var(--border); border-radius: 12px;
          padding: 12px 16px; color: var(--text);
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: rgba(250,204,21,0.5);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.08);
        }
        .form-input::placeholder, .form-textarea::placeholder { color: #334155; }
        .form-textarea { resize: vertical; min-height: 80px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } .modal { padding: 24px 20px; } }

        .error-msg {
          color: #ef4444; font-size: 12px; font-weight: 600;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; padding: 10px 14px; margin-bottom: 16px;
        }
        .submit-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff; font-weight: 900; font-size: 15px;
          border: none; border-radius: 14px; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(34,197,94,0.4);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        /* Success */
        .success-box {
          text-align: center; padding: 16px 0 8px;
          animation: fadeUp 0.4s ease both;
        }
        .success-emoji { font-size: 64px; margin-bottom: 16px; display: block; }
        .success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 700;
          color: #22c55e; margin: 0 0 8px;
        }
        .success-sub { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        .success-close {
          display: inline-block; padding: 12px 28px;
          background: rgba(250,204,21,0.1);
          border: 1px solid rgba(250,204,21,0.25);
          color: var(--gold); font-weight: 800; font-size: 14px;
          border-radius: 12px; cursor: pointer;
          transition: background 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .success-close:hover { background: rgba(250,204,21,0.18); }

        /* Divider */
        .section-divider {
          border: none; border-top: 1px solid var(--border);
          margin: 36px 0 28px; max-width: 1300px;
        }
      `}</style>

      <main className="order-page">

        {/* Hero */}
        <div className="hero">
          <div className="hero-ring" />
          <div className="eyebrow">🕉️ Pandit Puskar Raj Neupane</div>
          <h1 className="hero-title">
            Book a <em>Puja</em><br />or Karma Kanda
          </h1>
          <p className="hero-sub">
            Select your ceremony below. Panditji will come to your home with all required materials.
            Same-week availability across Kathmandu Valley.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {[['all','🙏 All Pujas'],['festival','🎪 Festivals'],['karma','🕉️ Karma Kanda']].map(([val, label]) => (
            <button key={val} className={`tab-btn${filter === val ? ' active' : ''}`} onClick={() => setFilter(val)}>
              {label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          {(filter === 'all' || filter === 'festival') && (
            <>
              {filter === 'all' && <p className="section-label">🎪 Festivals & Parva</p>}
              <div className="pujas-grid" style={{ marginBottom: filter === 'all' ? 0 : 0 }}>
                {PUJAS.filter(p => p.type === 'festival').map((puja, i) => (
                  <PujaCard key={puja.id} puja={puja} delay={i * 0.06} onBook={openModal} />
                ))}
              </div>
            </>
          )}

          {filter === 'all' && <hr className="section-divider" />}

          {(filter === 'all' || filter === 'karma') && (
            <>
              {filter === 'all' && <p className="section-label">🕉️ Karma Kanda & Sanskar</p>}
              <div className="pujas-grid">
                {PUJAS.filter(p => p.type === 'karma').map((puja, i) => (
                  <PujaCard key={puja.id} puja={puja} delay={i * 0.06} onBook={openModal} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Contact strip */}
        <div style={{
          maxWidth: '1300px', margin: '56px auto 0',
          background: 'linear-gradient(135deg, #1e1a0e, #27200a)',
          border: '1px solid #78350f', borderRadius: '20px',
          padding: '28px 32px',
          display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '36px' }}>📞</span>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ color: '#fef9c3', fontWeight: 800, fontSize: '15px', margin: '0 0 4px' }}>
              Want to discuss before booking?
            </p>
            <p style={{ color: '#92400e', fontSize: '13px', margin: 0 }}>
              Call Panditji directly — ९८४९३५००८८ &bull; Available 6 AM – 9 PM
            </p>
          </div>
          <a href="tel:9849350088" style={{
            background: 'linear-gradient(90deg, #facc15, #f97316)',
            color: '#0f172a', fontWeight: 900, fontSize: '13px',
            padding: '12px 24px', borderRadius: '12px',
            textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            📞 Call Now
          </a>
        </div>
      </main>

      {/* BOOKING MODAL */}
      {selected && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>✕</button>

            {success ? (
              <div className="success-box">
                <span className="success-emoji">🙏</span>
                <h2 className="success-title">Order Received!</h2>
                <p className="success-sub">
                  Your booking for <strong style={{ color: '#facc15' }}>{selected.name}</strong> has been submitted.<br />
                  Panditji will call you within 2 hours to confirm.
                </p>
                <button className="success-close" onClick={closeModal}>← Browse More Pujas</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '36px' }}>{selected.emoji}</span>
                  <div>
                    <h2 className="modal-puja-name">{selected.name}</h2>
                    <p className="modal-puja-ne">{selected.nameNe} &bull; {selected.price}</p>
                  </div>
                </div>

                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6,
                  padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px', border: '1px solid var(--border)' }}>
                  {selected.desc}
                </p>

                {error && <p className="error-msg">⚠️ {error}</p>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name <span>*</span></label>
                    <input className="form-input" placeholder="Eg. Ram Bahadur Shrestha"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number <span>*</span></label>
                    <input className="form-input" placeholder="98XXXXXXXX" type="tel"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Address / Location <span>*</span></label>
                  <input className="form-input" placeholder="Eg. Thimi-6, Bhaktapur near school"
                    value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Date <span>*</span></label>
                  <input className="form-input" type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ colorScheme: 'dark' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Notes (optional)</label>
                  <textarea className="form-textarea"
                    placeholder="Any special requirements, auspicious time (muhurat), family size, etc."
                    value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
                </div>

                <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? <><span className="spinner" /> Submitting…</>
                    : <>🙏 Confirm Puja Booking</>
                  }
                </button>

                <p style={{ color: '#334155', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
                  Panditji will call you within 2 hours to confirm &bull; No advance payment required
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PujaCard({ puja, delay, onBook }) {
  return (
    <div className="puja-card" style={{ animationDelay: `${delay}s` }}
      onClick={() => onBook(puja)}>
      <span className={`card-type-badge ${puja.type}`}>
        {TYPE_LABELS[puja.type]}
      </span>
      <span className="card-emoji">{puja.emoji}</span>
      <h3 className="card-name">{puja.name}</h3>
      <p className="card-name-ne">{puja.nameNe}</p>
      <p className="card-desc">{puja.desc}</p>
      <div className="card-meta">
        <span className="meta-pill">⏱ {puja.duration}</span>
        <span className="meta-pill price">💰 {puja.price}</span>
      </div>
      <button className="book-btn" onClick={(e) => { e.stopPropagation(); onBook(puja); }}>
        🙏 Book This Puja
      </button>
    </div>
  );
}