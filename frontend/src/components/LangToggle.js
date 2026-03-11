'use client';
// src/components/LangToggle.js
// Floating bottom-right language switcher button.
// Drop into your root layout.js alongside <Footer />.

import { useLang } from '../context/LangContext';

export default function LangToggle() {
  const { lang, toggleLang } = useLang();

  return (
    <>
      <style>{`
        .lang-toggle {
          position: fixed;
          bottom: 28px;
          right: 24px;
          z-index: 9980;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px;
          background: #0c1525;
          border: 1px solid rgba(250,204,21,0.35);
          border-radius: 999px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: #facc15;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(250,204,21,0.08);
          transition: all 0.2s;
          user-select: none;
        }
        .lang-toggle:hover {
          background: #111f35;
          border-color: rgba(250,204,21,0.6);
          box-shadow: 0 6px 32px rgba(0,0,0,0.6), 0 0 16px rgba(250,204,21,0.12);
          transform: translateY(-2px);
        }
        .lang-toggle:active { transform: translateY(0); }

        .lang-toggle-flag {
          font-size: 16px;
          line-height: 1;
          font-family: "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;
        }
        .lang-toggle-divider {
          width: 1px; height: 14px;
          background: rgba(250,204,21,0.2);
          margin: 0 2px;
        }
        .lang-toggle-active {
          color: #facc15;
        }
        .lang-toggle-inactive {
          color: #334155;
        }
        .lang-toggle-arrow {
          font-size: 10px;
          color: #475569;
          margin-left: 2px;
        }

        @media (max-width: 480px) {
          .lang-toggle {
            bottom: 20px;
            right: 16px;
            padding: 9px 13px;
            font-size: 12px;
          }
        }
      `}</style>

      <button className="lang-toggle" onClick={toggleLang} title="Toggle language / भाषा परिवर्तन">
        <span className="lang-toggle-flag">{lang === 'ne' ? '🇳🇵' : '🇬🇧'}</span>
        <span className={lang === 'ne' ? 'lang-toggle-active' : 'lang-toggle-inactive'}>नेपाली</span>
        <span className="lang-toggle-divider" />
        <span className={lang === 'en' ? 'lang-toggle-active' : 'lang-toggle-inactive'}>EN</span>
        <span className="lang-toggle-arrow">⇄</span>
      </button>
    </>
  );
}