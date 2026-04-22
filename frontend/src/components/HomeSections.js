'use client';
// src/components/HomeSections.js

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import RashifalSection from './RashifalSection';
import { useLang } from '../context/LangContext';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function WhySection() {
  const { t } = useLang();
  const [ref, visible] = useInView();
  const ITEMS = [
    { icon: '🪔', title: { en: 'Pure & Authentic', ne: 'शुद्ध सामग्री' }, titleEn: 'Pure & Authentic',
      desc: { en: 'Every item prepared the traditional way — chemical-free, pure and sattvic.',
               ne: 'हर सामग्री परम्परागत विधिबाट तयार — रसायन मुक्त, शुद्ध र सात्विक।' } },
    { icon: '🚚', title: { en: 'Fast Delivery', ne: 'द्रुत डेलिभरी' }, titleEn: 'Fast Delivery',
      desc: { en: 'Same-day delivery available across Bhaktapur and Kathmandu Valley.',
               ne: 'भक्तपुर र काठमाडौं उपत्यकामा उही दिन डेलिभरी उपलब्ध।' } },
    { icon: '🙏', title: { en: 'Expert Guidance', ne: 'विशेषज्ञ सल्लाह' }, titleEn: 'Expert Guidance',
      desc: { en: 'Personal puja guidance from Pandit Pushkar Raj Neupane.',
               ne: 'पण्डित पुष्कर राज न्यौपानेबाट व्यक्तिगत पूजा मार्गदर्शन।' } },
    { icon: '💛', title: { en: 'Trusted for Decades', ne: 'विश्वस्त सेवा' }, titleEn: 'Trusted for Decades',
      desc: { en: 'A trusted companion to thousands of families for decades.',
               ne: 'दशकौंदेखि हजारौं परिवारको भरोसायोग्य साथी।' } },
  ];
  return (
    <section ref={ref} className={`hs-section hs-why${visible ? ' hs-in' : ''}`}>
      <div className="hs-inner">
        <div className="hs-eyebrow">{t({ en: 'Why Choose Us?', ne: 'किन हामीलाई छान्ने?' })}</div>
        <h2 className="hs-heading">{t({ en: 'With Devotion — ', ne: 'श्रद्धाको साथ — ' })}<span className="hs-gold">{t({ en: 'for Every Puja', ne: 'हर पूजाको लागि' })}</span></h2>
        <div className="hs-why-grid">
          {ITEMS.map((item, i) => (
            <div key={i} className="hs-why-card" style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="hs-why-icon" style={{ fontFamily: EF }}>{item.icon}</div>
              <div>
                <div className="hs-why-title">{t(item.title)}</div>
                <div className="hs-why-title-en">{item.titleEn}</div>
                <p className="hs-why-desc">{t(item.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { t } = useLang();
  const [ref, visible] = useInView();
  const SERVICES = [
    { icon: '🛍️', label: { en: 'Puja Samagri', ne: 'पूजा सामग्री' }, sub: { en: 'Shop Products',  ne: 'उत्पादन किन्नुहोस्'  }, href: '/shop'    },
    { icon: '🔮', label: { en: 'Cheena',        ne: 'चिना सेवा'    }, sub: { en: 'Birth Chart',    ne: 'जन्मकुण्डली'         }, href: '/cheena'  },
    { icon: '🪔', label: { en: 'Book Puja',      ne: 'पूजा बुकिङ'   }, sub: { en: 'Book a Puja',   ne: 'पूजा बुक गर्नुहोस्' }, href: '/order'   },
    { icon: '📞', label: { en: 'Contact',        ne: 'सम्पर्क'      }, sub: { en: 'Get in Touch',  ne: 'सम्पर्क गर्नुहोस्'  }, href: '/contact' },
  ];
  return (
    <section ref={ref} className={`hs-section hs-services${visible ? ' hs-in' : ''}`}>
      <div className="hs-inner">
        <div className="hs-services-grid">
          {SERVICES.map((s, i) => (
            <Link key={i} href={s.href} className="hs-svc-card" style={{ transitionDelay: `${i * 0.07}s` }}>
              <div className="hs-svc-glow" />
              <span className="hs-svc-icon" style={{ fontFamily: EF }}>{s.icon}</span>
              <span className="hs-svc-label">{t(s.label)}</span>
              <span className="hs-svc-sub">{t(s.sub)}</span>
              <span className="hs-svc-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FestivalSection() {
  const { t } = useLang();
  const [ref, visible] = useInView();
  const FESTIVALS = [
    { name: { en: 'Gaijatra',       ne: 'गाईजात्रा'    }, date: { en: 'Bhadra 2082',    ne: 'भाद्र २०८२'    }, icon: '🐄' },
    { name: { en: 'Indra Jatra',    ne: 'इन्द्रजात्रा' }, date: { en: 'Bhadra 2082',    ne: 'भाद्र २०८२'    }, icon: '🎭' },
    { name: { en: 'Dashain',        ne: 'दशैं'          }, date: { en: 'Ashwin 2082',    ne: 'आश्विन २०८२'   }, icon: '🌺' },
    { name: { en: 'Tihar',          ne: 'तिहार'         }, date: { en: 'Kartik 2082',    ne: 'कार्तिक २०८२'  }, icon: '🪔' },
    { name: { en: 'Chhath',         ne: 'छठ'            }, date: { en: 'Kartik 2082',    ne: 'कार्तिक २०८२'  }, icon: '☀️' },
    { name: { en: 'Vivah Panchami', ne: 'विवाह पञ्चमी' }, date: { en: 'Mangsir 2082',   ne: 'मंसिर २०८२'    }, icon: '💐' },
  ];
  return (
    <section ref={ref} className={`hs-section hs-fest${visible ? ' hs-in' : ''}`}>
      <div className="hs-inner">
        <div className="hs-fest-top">
          <div>
            <div className="hs-eyebrow">{t({ en: 'Upcoming Festivals', ne: 'आगामी चाडपर्व' })}</div>
            <h2 className="hs-heading">{t({ en: 'Prepare for the Festival ', ne: 'पर्वको तयारी ' })}<span className="hs-gold">{t({ en: 'Now', ne: 'अहिले नै गर्नुहोस्' })}</span></h2>
          </div>
          <Link href="/shop" className="hs-fest-shopbtn">
            <span style={{ fontFamily: EF }}>🛍️</span> {t({ en: 'Browse All Items', ne: 'सबै सामग्री हेर्नुहोस्' })}
          </Link>
        </div>
        <div className="hs-fest-grid">
          {FESTIVALS.map((f, i) => (
            <div key={i} className="hs-fest-card" style={{ transitionDelay: `${i * 0.06}s` }}>
              <span className="hs-fest-icon" style={{ fontFamily: EF }}>{f.icon}</span>
              <span className="hs-fest-name">{t(f.name)}</span>
              <span className="hs-fest-date">{t(f.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PanditSection() {
  const { t } = useLang();
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className={`hs-section hs-pandit${visible ? ' hs-in' : ''}`}>
      <div className="hs-inner hs-pandit-inner">
        <div className="hs-pandit-deco">
          <div className="hs-diya-ring"><span style={{ fontSize: 72, fontFamily: EF }}>🪔</span></div>
          <div className="hs-diya-glow" />
        </div>
        <div className="hs-pandit-content">
          <div className="hs-eyebrow">{t({ en: 'About Us', ne: 'हाम्रो परिचय' })}</div>
          <h2 className="hs-heading hs-pandit-name">
            {t({ en: 'Pandit Pushkar Raj', ne: 'पण्डित पुष्कर राज' })}<br />
            <span className="hs-gold">{t({ en: 'Neupane', ne: 'न्यौपाने' })}</span>
          </h2>
          <p className="hs-pandit-bio">
            {t({ en: 'A renowned astrologer and puja specialist from Thimi, Bhaktapur with 30+ years of experience. A trusted advisor to thousands of families for Vedic birth charts, planetary peace rituals, Navagraha puja, and all samskars.',
                 ne: '३०+ वर्षको अनुभव सहित भक्तपुर, ठिमीका प्रख्यात ज्योतिषी तथा पूजा विशेषज्ञ। वैदिक परम्पराअनुसार जन्मकुण्डली, ग्रहशान्ति, नवग्रह पूजा, र समस्त संस्कारका लागि हजारौं परिवारको विश्वासिलो सल्लाहकार।' })}
          </p>
          <div className="hs-pandit-stats">
            <div className="hs-stat">
              <span className="hs-stat-n">{t({ en: '30+', ne: '३०+' })}</span>
              <span className="hs-stat-l">{t({ en: 'Years Experience', ne: 'वर्षको अनुभव' })}</span>
            </div>
            <div className="hs-stat-div" />
            <div className="hs-stat">
              <span className="hs-stat-n">{t({ en: '5000+', ne: '५०००+' })}</span>
              <span className="hs-stat-l">{t({ en: 'Happy Families', ne: 'सन्तुष्ट परिवार' })}</span>
            </div>
            <div className="hs-stat-div" />
            <div className="hs-stat">
              <span className="hs-stat-n">{t({ en: '1000+', ne: '१०००+' })}</span>
              <span className="hs-stat-l">{t({ en: 'Pujas Done', ne: 'पूजा सम्पन्न' })}</span>
            </div>
          </div>
          <div className="hs-pandit-btns">
            <Link href="/order" className="hs-btn-primary">
              <span style={{ fontFamily: EF }}>🙏</span> {t({ en: 'Book a Puja', ne: 'पूजा बुक गर्नुहोस्' })}
            </Link>
            <Link href="/cheena" className="hs-btn-secondary">
              <span style={{ fontFamily: EF }}>🔮</span> {t({ en: 'Cheena Service', ne: 'चिना सेवा' })}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const { t } = useLang();
  const TRUST = [
    { icon: '✅', text: { en: 'Certified Products',  ne: 'प्रमाणित सामग्री'  } },
    { icon: '🚚', text: { en: 'Same Day Delivery',   ne: 'उही दिन डेलिभरी'   } },
    { icon: '🔄', text: { en: '7-Day Return Policy', ne: '७ दिन फिर्ता नीति' } },
    { icon: '🔒', text: { en: 'Secure Payment',      ne: 'सुरक्षित भुक्तानी' } },
    { icon: '📞', text: { en: '24/7 Support',        ne: '२४/७ सहयोग'        } },
    { icon: '🌿', text: { en: 'Natural Ingredients', ne: 'प्राकृतिक सामग्री' } },
  ];
  return (
    <div className="hs-trust">
      <div className="hs-trust-track">
        {[...TRUST, ...TRUST].map((item, i) => (
          <div key={i} className="hs-trust-item">
            <span style={{ fontFamily: EF }}>{item.icon}</span>
            <span>{t(item.text)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTASection() {
  const { t } = useLang();
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className={`hs-section hs-cta${visible ? ' hs-in' : ''}`}>
      <div className="hs-cta-inner">
        <div className="hs-cta-bg-glow" />
        <div className="hs-cta-content">
          <div className="hs-cta-icon" style={{ fontFamily: EF }}>🪔</div>
          <h2 className="hs-cta-heading">{t({ en: 'Ready for Your Puja?', ne: 'पूजाको लागि तयार हुनुहुन्छ?' })}</h2>
          <p className="hs-cta-sub">{t({ en: 'All puja essentials in one place — pure, fresh and traditional.', ne: 'सबै प्रकारका पूजा सामग्री एकै ठाउँमा — शुद्ध, ताजा र परम्परागत।' })}</p>
          <div className="hs-cta-btns">
            <Link href="/shop" className="hs-btn-primary hs-cta-main">
              <span style={{ fontFamily: EF }}>🛍️</span> {t({ en: 'Shop Now', ne: 'अहिले किनमेल गर्नुहोस्' })}
            </Link>
            <a href="tel:9849350088" className="hs-btn-secondary hs-cta-call">
              <span style={{ fontFamily: EF }}>📞</span> ९८४९३५००८८
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeSections() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');
        .hs-section { padding:80px 24px; opacity:0; transform:translateY(28px); transition:opacity 0.65s ease,transform 0.65s ease; }
        .hs-section.hs-in { opacity:1; transform:none; }
        .hs-inner { max-width:1200px; margin:0 auto; }
        .hs-eyebrow { font-size:11px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#facc15; margin-bottom:10px; font-family:'DM Sans',sans-serif; }
        .hs-heading { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,4vw,44px); font-weight:700; color:#f1f5f9; line-height:1.2; margin-bottom:40px; }
        .hs-gold { color:#facc15; }
        .hs-why { background:#080d18; }
        .hs-why-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:20px; }
        .hs-why-card { display:flex; gap:18px; align-items:flex-start; background:linear-gradient(135deg,#0d1b2e,#080f1e); border:1px solid #1a2d4a; border-radius:18px; padding:24px 20px; transition:border-color 0.2s,transform 0.2s,opacity 0.5s; opacity:0; transform:translateY(16px); }
        .hs-section.hs-in .hs-why-card { opacity:1; transform:none; }
        .hs-why-card:hover { border-color:rgba(250,204,21,0.3); transform:translateY(-3px) !important; }
        .hs-why-icon { font-size:34px; flex-shrink:0; line-height:1; margin-top:2px; }
        .hs-why-title { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:700; color:#facc15; margin-bottom:2px; }
        .hs-why-title-en { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#334155; margin-bottom:8px; }
        .hs-why-desc { font-size:13px; color:#64748b; line-height:1.7; margin:0; }
        .hs-services { background:linear-gradient(180deg,#080d18,#060b14); padding-top:0; }
        .hs-services-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        @media(max-width:768px){ .hs-services-grid { grid-template-columns:repeat(2,1fr); } }
        .hs-svc-card { position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:32px 16px; background:linear-gradient(145deg,#0f1e35,#080d18); border:1px solid #1a2d4a; border-radius:20px; text-decoration:none; transition:all 0.25s; opacity:0; transform:translateY(16px); }
        .hs-section.hs-in .hs-svc-card { opacity:1; transform:none; }
        .hs-svc-card:hover { border-color:rgba(250,204,21,0.4); transform:translateY(-4px) !important; box-shadow:0 16px 40px rgba(0,0,0,0.4); }
        .hs-svc-glow { position:absolute; top:-40px; left:50%; transform:translateX(-50%); width:120px; height:120px; border-radius:50%; background:radial-gradient(circle,rgba(250,204,21,0.08),transparent 70%); pointer-events:none; opacity:0; transition:opacity 0.3s; }
        .hs-svc-card:hover .hs-svc-glow { opacity:1; }
        .hs-svc-icon { font-size:38px; line-height:1; }
        .hs-svc-label { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:700; color:#f1f5f9; text-align:center; }
        .hs-svc-sub { font-size:11px; color:#475569; font-weight:600; text-align:center; }
        .hs-svc-arrow { font-size:16px; color:#facc15; margin-top:4px; transition:transform 0.2s; }
        .hs-svc-card:hover .hs-svc-arrow { transform:translateX(4px); }
        .hs-fest { background:#060b14; }
        .hs-fest-top { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; flex-wrap:wrap; margin-bottom:32px; }
        .hs-fest-top .hs-heading { margin-bottom:0; }
        .hs-fest-shopbtn { display:flex; align-items:center; gap:8px; padding:10px 20px; border-radius:12px; border:1px solid rgba(250,204,21,0.3); color:#facc15; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; background:rgba(250,204,21,0.06); transition:all 0.2s; flex-shrink:0; }
        .hs-fest-shopbtn:hover { background:rgba(250,204,21,0.12); }
        .hs-fest-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
        .hs-fest-card { display:flex; flex-direction:column; align-items:center; gap:6px; padding:22px 12px; background:linear-gradient(145deg,#0d1b2e,#080f1e); border:1px solid #1a2d4a; border-radius:16px; text-align:center; transition:all 0.2s; opacity:0; transform:scale(0.95); }
        .hs-section.hs-in .hs-fest-card { opacity:1; transform:scale(1); }
        .hs-fest-card:hover { border-color:rgba(250,204,21,0.3); transform:scale(1.03) !important; }
        .hs-fest-icon { font-size:30px; line-height:1; }
        .hs-fest-name { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:700; color:#f1f5f9; }
        .hs-fest-date { font-size:11px; color:#475569; font-weight:600; }
        .hs-pandit { background:linear-gradient(135deg,#080d18 0%,#060b14 100%); position:relative; overflow:hidden; }
        .hs-pandit::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 20% 50%,rgba(250,204,21,0.04) 0%,transparent 60%); pointer-events:none; }
        .hs-pandit-inner { display:grid; grid-template-columns:280px 1fr; gap:60px; align-items:center; }
        @media(max-width:768px){ .hs-pandit-inner { grid-template-columns:1fr; text-align:center; } .hs-pandit-deco { display:flex; justify-content:center; } .hs-pandit-stats { justify-content:center; } .hs-pandit-btns { justify-content:center; } }
        .hs-pandit-deco { position:relative; display:flex; align-items:center; justify-content:center; }
        .hs-diya-ring { width:180px; height:180px; border-radius:50%; border:2px solid rgba(250,204,21,0.2); display:flex; align-items:center; justify-content:center; position:relative; z-index:1; background:radial-gradient(circle,rgba(250,204,21,0.05),transparent 70%); animation:hsDiyaPulse 3s ease-in-out infinite; }
        @keyframes hsDiyaPulse { 0%,100% { box-shadow:0 0 0 0 rgba(250,204,21,0.1); } 50% { box-shadow:0 0 0 20px rgba(250,204,21,0); } }
        .hs-diya-glow { position:absolute; width:220px; height:220px; border-radius:50%; background:radial-gradient(circle,rgba(250,204,21,0.08),transparent 70%); }
        .hs-pandit-name { margin-bottom:16px; }
        .hs-pandit-bio { font-size:14px; color:#64748b; line-height:1.8; margin-bottom:28px; max-width:520px; }
        .hs-pandit-stats { display:flex; align-items:center; gap:20px; margin-bottom:28px; flex-wrap:wrap; }
        .hs-stat { display:flex; flex-direction:column; gap:2px; }
        .hs-stat-n { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:700; color:#facc15; line-height:1; }
        .hs-stat-l { font-size:11px; color:#475569; font-weight:600; }
        .hs-stat-div { width:1px; height:36px; background:#1a2d4a; }
        .hs-pandit-btns { display:flex; gap:12px; flex-wrap:wrap; }
        .hs-btn-primary { display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:12px; background:linear-gradient(135deg,#854d0e,#facc15); color:#0f172a; font-size:14px; font-weight:800; text-decoration:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .hs-btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(250,204,21,0.35); }
        .hs-btn-secondary { display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:12px; border:1px solid rgba(250,204,21,0.3); color:#facc15; font-size:14px; font-weight:700; text-decoration:none; transition:all 0.2s; background:rgba(250,204,21,0.06); font-family:'DM Sans',sans-serif; }
        .hs-btn-secondary:hover { background:rgba(250,204,21,0.12); border-color:rgba(250,204,21,0.5); }
        .hs-trust { overflow:hidden; background:#0a1020; border-top:1px solid #1a2d4a; border-bottom:1px solid #1a2d4a; padding:16px 0; }
        .hs-trust-track { display:flex; gap:48px; animation:hsTrust 22s linear infinite; width:max-content; }
        @keyframes hsTrust { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .hs-trust-item { display:flex; align-items:center; gap:10px; font-size:13px; font-weight:700; color:#475569; white-space:nowrap; }
        .hs-trust-item span:first-child { font-size:16px; }
        .hs-cta { background:#060b14; padding:60px 24px; }
        .hs-cta-inner { max-width:720px; margin:0 auto; position:relative; background:linear-gradient(135deg,#0d1b2e,#0a1520); border:1px solid rgba(250,204,21,0.2); border-radius:28px; padding:56px 48px; text-align:center; overflow:hidden; }
        @media(max-width:560px){ .hs-cta-inner { padding:40px 24px; } }
        .hs-cta-bg-glow { position:absolute; top:-60px; left:50%; transform:translateX(-50%); width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(250,204,21,0.06),transparent 70%); pointer-events:none; }
        .hs-cta-content { position:relative; }
        .hs-cta-icon { font-size:52px; line-height:1; margin-bottom:16px; animation:hsDiyaPulse 2.5s ease-in-out infinite; }
        .hs-cta-heading { font-family:'Cormorant Garamond',serif; font-size:clamp(24px,4vw,38px); font-weight:700; color:#f1f5f9; margin-bottom:12px; }
        .hs-cta-sub { font-size:14px; color:#64748b; line-height:1.7; margin-bottom:32px; max-width:440px; margin-left:auto; margin-right:auto; }
        .hs-cta-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .hs-cta-main,.hs-cta-call { font-size:15px; padding:14px 28px; }
      `}</style>

      {/* ── RASHIFAL first ── */}
      {/* <RashifalSection /> */}

      <TrustStrip />
      <ServicesSection />
      <WhySection />
      <FestivalSection />
      <PanditSection />
      <CTASection />
    </>
  );
}