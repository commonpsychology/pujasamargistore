'use client';
// src/components/Navbar.js

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const ROLE_BADGE = {
  admin:    { bg: '#7c2d12', text: '#fbbf24', label: 'Admin'    },
  delivery: { bg: '#1e3a5f', text: '#60a5fa', label: 'Delivery' },
  accounts: { bg: '#14432a', text: '#4ade80', label: 'Accounts' },
  customer: { bg: '#1a2540', text: '#94a3b8', label: 'Customer' },
};

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Android Emoji",EmojiSymbols,sans-serif';

export default function Navbar() {
  const { cartCount }              = useCart();
  const { user, profile, signOut } = useAuth();
  const { t }                      = useLang();
  const router                     = useRouter();

  const [isMounted,    setIsMounted]    = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setUserDropOpen(false);
    setMenuOpen(false);
    await signOut(router);
  };

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || '?';
  const initials    = displayName.slice(0, 2).toUpperCase();
  const roleMeta    = ROLE_BADGE[profile?.role] ?? ROLE_BADGE.customer;
  const isStaff     = profile?.role && profile.role !== 'customer';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .emoji { font-family: ${EMOJI_FONT} !important; font-style: normal; }

        .nav-announce {
          width: 100%; overflow: hidden;
          white-space: nowrap; text-overflow: ellipsis;
        }

        /* ── Navbar layout ── */
        .nav-header-outer {
          width: 100%; overflow-x: hidden; overflow-y: visible;
          position: relative; z-index: 9990;
        }
        .nav-inner {
          overflow: visible; position: relative; z-index: 9990;
        }

        /* The main nav row */
        .nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 82px;
          gap: 12px;
          max-width: 1536px;
          margin: 0 auto;
          min-width: 0;
        }
        @media (min-width: 1280px) {
          .nav-row { padding: 0 48px; height: 90px; gap: 16px; }
        }

        /* ── Brand ── */
        .nav-brand {
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0; min-width: 0;
        }
        .nav-logo-wrap {
          width: 44px; height: 44px; flex-shrink: 0;
          position: relative;
        }
        @media (min-width: 1280px) {
          .nav-logo-wrap { width: 52px; height: 52px; }
        }
        .nav-logo-inner {
          width: 100%; height: 100%; border-radius: 50%;
          overflow: hidden; border: 2px solid #facc15;
          background: #78350f; display: flex; align-items: center;
          justify-content: center; position: relative;
          box-shadow: 0 0 14px rgba(250,204,21,0.45);
        }
        .nav-logo-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 11px; height: 11px; background: #4ade80;
          border: 2px solid #111827; border-radius: 50%;
        }
        .nav-brand-text { display: flex; flex-direction: column; line-height: 1.5; min-width: 0; padding-top: 2px; }
        .nav-brand-title {
          font-size: 18px; font-weight: 800; color: #facc15;
          white-space: nowrap; overflow: visible;
          text-decoration: none; transition: color 0.2s; padding-top: 3px;
        }
        .nav-brand-title:hover { color: #fde68a; }
        @media (min-width: 1280px) {
          .nav-brand-title { font-size: 24px; }
        }
        .nav-brand-sub {
          font-size: 11px; font-weight: 600; color: #fde68a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        /* Hide phone line on tablet to save space */
        .nav-brand-phone {
          font-size: 10px; color: #854d0e; font-weight: 500;
          letter-spacing: 0.5px;
          display: none;    /* hidden until xl */
        }
        @media (min-width: 1280px) {
          .nav-brand-phone { display: block; }
        }

        /* ── Center nav links ── */
        .nav-links {
          display: none;
        }
        @media (min-width: 768px) {
          .nav-links {
            display: flex; align-items: center;
            gap: 4px;           /* tight gap on md */
            list-style: none; padding: 0; margin: 0;
            flex: 1; justify-content: center; min-width: 0;
          }
        }
        @media (min-width: 1024px) {
          .nav-links { gap: 16px; }
        }
        @media (min-width: 1280px) {
          .nav-links { gap: 24px; }
        }

        /* NavItem link */
        .nav-link {
          display: flex; align-items: center; gap: 4px;
          font-weight: 700; white-space: nowrap;
          text-decoration: none; transition: color 0.2s;
          position: relative; padding-bottom: 2px;
          font-size: 13px;    /* compact on md/lg */
        }
        @media (min-width: 1024px) { .nav-link { font-size: 14px; } }
        @media (min-width: 1280px) { .nav-link { font-size: 15px; } }
        .nav-link-underline {
          position: absolute; left: 0; bottom: -4px;
          height: 3px; width: 0; border-radius: 999px;
          transition: width 0.25s;
        }
        .nav-link:hover .nav-link-underline { width: 100%; }

        /* Hide emoji on md only (too wide) — show from lg */
        .nav-link-icon { display: none; }
        @media (min-width: 1024px) { .nav-link-icon { display: inline; } }

        /* ── Right actions ── */
        .nav-actions {
          display: flex; align-items: center;
          gap: 6px; flex-shrink: 0;
        }
        @media (min-width: 1024px) { .nav-actions { gap: 10px; } }

        /* Order Puja btn */
        .nav-order-btn {
          display: none;
        }
        @media (min-width: 640px) {
          .nav-order-btn {
            display: flex; align-items: center; gap: 6px;
            font-size: 12px; font-weight: 700;
            padding: 7px 10px; border-radius: 10px;
            border: 1px solid rgba(250,204,21,0.35);
            background: linear-gradient(135deg,rgba(250,204,21,0.1),rgba(249,115,22,0.1));
            color: #facc15; white-space: nowrap; text-decoration: none;
            transition: all 0.2s;
          }
        }
        @media (min-width: 1024px) {
          .nav-order-btn { font-size: 13px; padding: 8px 14px; }
        }
        .nav-order-btn:hover { background: linear-gradient(135deg,rgba(250,204,21,0.18),rgba(249,115,22,0.18)); }
        /* Hide text label on sm–md to save space, show from lg */
        .nav-order-label { display: none; }
        @media (min-width: 1024px) { .nav-order-label { display: inline; } }

        /* Cart btn */
        .nav-cart-btn {
          position: relative; display: flex; align-items: center; gap: 6px;
          border-radius: 10px; background: #facc15;
          padding: 7px 12px; font-size: 13px; font-weight: 800;
          color: #111827; text-decoration: none;
          box-shadow: 0 2px 12px rgba(250,204,21,0.3);
          transition: all 0.2s; flex-shrink: 0;
          white-space: nowrap;
        }
        .nav-cart-btn:hover { background: #fde047; transform: scale(1.03); }
        .nav-cart-label { display: none; }
        @media (min-width: 640px) { .nav-cart-label { display: inline; } }
        .nav-cart-badge {
          position: absolute; top: -7px; right: -7px;
          background: #ef4444; color: #fff; font-size: 10px; font-weight: 800;
          width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }

        /* ── User pill ── */
        .user-pill {
          position: relative; display: flex; align-items: center; gap: 8px;
          padding: 5px 8px 5px 5px;
          background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.18);
          border-radius: 40px; cursor: pointer;
          transition: background 0.2s, border-color 0.2s; user-select: none;
          flex-shrink: 0; z-index: 9991;
        }
        .user-pill:hover { background: rgba(250,204,21,0.12); border-color: rgba(250,204,21,0.35); }
        .user-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          overflow: hidden; flex-shrink: 0;
          border: 2px solid rgba(250,204,21,0.4);
          background: #1a2540; display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 1024px) {
          .user-avatar { width: 34px; height: 34px; }
        }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-avatar-initials { font-size: 11px; font-weight: 800; color: #facc15; }
        .user-pill-info {
          display: none;  /* hidden on md, show lg+ */
          flex-direction: column; line-height: 1.25;
        }
        @media (min-width: 1024px) { .user-pill-info { display: flex; } }
        .user-pill-name {
          font-size: 12px; font-weight: 700; color: #f1f5f9;
          max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .user-pill-role {
          font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 1px 5px; border-radius: 4px; width: fit-content; margin-top: 2px;
        }
        .user-pill-chevron {
          font-size: 10px; color: #475569; transition: transform 0.2s; margin-left: 2px;
          display: none;
        }
        @media (min-width: 1024px) { .user-pill-chevron { display: inline; } }
        .user-pill-chevron.open { transform: rotate(180deg); }

        /* ── User dropdown ── */
        .user-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          min-width: 220px; max-width: calc(100vw - 24px);
          background: #0c1525; border: 1px solid #1a2d4a;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(250,204,21,0.04);
          z-index: 9999; animation: dropIn 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-8px) scale(0.97); }
          to   { opacity:1; transform: none; }
        }
        .drop-header {
          padding: 15px 17px 13px; border-bottom: 1px solid #1a2d4a;
          background: linear-gradient(135deg, #0e1e38, #080d18);
        }
        .drop-header-name  { font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 2px; }
        .drop-header-email { font-size: 11px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .drop-items { padding: 7px; }
        .drop-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 11px; border-radius: 9px;
          font-size: 13px; font-weight: 600; color: #94a3b8;
          text-decoration: none; cursor: pointer;
          transition: background 0.15s, color 0.15s;
          border: none; background: none; width: 100%; text-align: left;
          font-family: inherit;
        }
        .drop-item:hover { background: rgba(250,204,21,0.06); color: #f1f5f9; }
        .drop-item-icon  {
          font-size: 15px; width: 20px; text-align: center; flex-shrink: 0;
          font-family: ${EMOJI_FONT} !important;
        }
        .drop-divider    { height: 1px; background: #0f1a2e; margin: 4px 7px; }
        .drop-item.logout { color: #f87171; }
        .drop-item.logout:hover { background: rgba(239,68,68,0.08); color: #fca5a5; }

        /* ── Login btn ── */
        .nav-login-btn {
          display: none;
        }
        @media (min-width: 640px) {
          .nav-login-btn {
            display: flex; align-items: center; gap: 6px;
            font-size: 12px; font-weight: 700;
            padding: 7px 10px; border-radius: 10px;
            border: 1px solid rgba(250,204,21,0.2);
            color: #facc15; white-space: nowrap; text-decoration: none;
            transition: all 0.2s; flex-shrink: 0;
          }
        }
        @media (min-width: 1024px) { .nav-login-btn { font-size: 13px; padding: 8px 14px; } }
        .nav-login-btn:hover { border-color: rgba(250,204,21,0.4); background: rgba(250,204,21,0.06); }

        /* ── Hamburger ── */
        .nav-hamburger {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.08); color: #fde68a;
          font-size: 18px; border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer; transition: background 0.2s; flex-shrink: 0;
        }
        .nav-hamburger:hover { background: rgba(255,255,255,0.15); }
        @media (min-width: 768px) { .nav-hamburger { display: none; } }

        /* ── Mobile menu ── */
        .nav-mobile-menu {
          width: 100%; overflow-x: hidden; box-sizing: border-box;
          position: relative; z-index: 9989;
        }
      `}</style>

      <header className="w-full sticky top-0 nav-header-outer" style={{ zIndex: 9990, overflow: 'visible' }}>

        {/* Announcement bar */}
        <div className="nav-announce w-full bg-yellow-400 py-1.5 text-center text-xs font-semibold text-slate-900 tracking-wide">
          <span className="emoji">🕉️</span>
          {' '}&nbsp;नित्य पूजा सामग्री उपलब्ध • Free delivery above Rs. 1999&nbsp;{' '}
          <span className="emoji">🕉️</span>
        </div>

        {/* Main nav */}
        <div className="w-full bg-[#111827] shadow-2xl border-b border-yellow-400/20 nav-inner" style={{ overflow: 'visible' }}>
          <nav className="nav-row">

            {/* LEFT: Brand */}
            <div className="nav-brand">
              <div className="nav-logo-wrap">
                <div className="nav-logo-inner">
                  <Image
                    src="/images/buba.png"
                    alt="पण्डित पुष्कर राज न्यौपाने"
                    fill priority
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.parentNode) {
                        e.target.parentNode.innerHTML = '<span style="font-size:1.6rem;line-height:1;font-family:\'Apple Color Emoji\',\'Segoe UI Emoji\',sans-serif">🙏</span>';
                      }
                    }}
                  />
                </div>
                <span className="nav-logo-dot" />
              </div>
              <div className="nav-brand-text">
                <Link href="/" className="nav-brand-title">पूजा सामग्री</Link>
                <span className="nav-brand-sub">पण्डित पुष्कर राज न्यौपाने</span>
                <span className="nav-brand-phone">ठिमी, भक्तपुर &bull; ९८४९३५००८८</span>
              </div>
            </div>

            {/* CENTER: Nav links — md+ */}
            <ul className="nav-links">
              <NavItem href="/shop"     label={`🛍️ ${t({en:'Shop',ne:'किनमेल'})}`}         special={false} />
              <NavItem href="/cheena"   label={`🔮 ${t({en:'Cheena',ne:'चिना'})}`}          special={true}  />
              <NavItem href="/about"    label={`📖 ${t({en:'About Us',ne:'हाम्रोबारे'})}`}   special={false} />
              <NavItem href="/contact"  label={`📬 ${t({en:'Contact',ne:'सम्पर्क'})}`}       special={false} />
              <NavItem href="/policies" label={`📜 ${t({en:'Policies',ne:'नीतिहरू'})}`}      special={false} />
              {isMounted && isStaff && (
                <NavItem href="/admin/orders" label="⚙️ Admin" special={true} />
              )}
            </ul>

            {/* RIGHT: Actions */}
            <div className="nav-actions">

              {/* Order Puja */}
              <Link href="/order" className="nav-order-btn">
                <span className="emoji">🙏</span>
                <span className="nav-order-label">{t({en:'Order Puja',ne:'पूजा बुक'})}</span>
              </Link>

              {/* Cart */}
              <Link href="/checkout" className="nav-cart-btn">
                <span className="emoji">🛒</span>
                <span className="nav-cart-label">{t({en:'Cart',ne:'कार्ट'})}</span>
                {isMounted && cartCount > 0 && (
                  <span className="nav-cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </Link>

              {/* User pill */}
              {isMounted && user && (
                <div className="user-pill" ref={dropRef} onClick={() => setUserDropOpen(v => !v)}>
                  <div className="user-avatar">
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt={displayName} />
                      : <span className="user-avatar-initials">{initials}</span>
                    }
                  </div>
                  <div className="user-pill-info">
                    <span className="user-pill-name">{displayName}</span>
                    <span className="user-pill-role" style={{ background: roleMeta.bg, color: roleMeta.text }}>
                      {roleMeta.label}
                    </span>
                  </div>
                  <span className={`user-pill-chevron${userDropOpen ? ' open' : ''}`}>▼</span>

                  {userDropOpen && (
                    <div className="user-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="drop-header">
                        <p className="drop-header-name">{displayName}</p>
                        <p className="drop-header-email">{user.email}</p>
                      </div>
                      <div className="drop-items">
                        <Link href="/account"        className="drop-item" onClick={() => setUserDropOpen(false)}><span className="drop-item-icon">👤</span> {t({en:'My Account',ne:'मेरो खाता'})}</Link>
                        <Link href="/account/orders" className="drop-item" onClick={() => setUserDropOpen(false)}><span className="drop-item-icon">📦</span> {t({en:'My Orders',ne:'मेरो अर्डर'})}</Link>
                        <Link href="/checkout"       className="drop-item" onClick={() => setUserDropOpen(false)}><span className="drop-item-icon">🛒</span> Cart</Link>
                        <div className="drop-divider" />
                        <button className="drop-item logout" onClick={handleSignOut}><span className="drop-item-icon">👋</span> {t({en:'Sign Out',ne:'साइन आउट'})} <span className="drop-item-icon" style={{marginLeft:'auto'}}>🚪</span></button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Login */}
              {isMounted && !user && (
                <Link href="/login" className="nav-login-btn">
                  <span className="emoji">🔑</span> Login
                </Link>
              )}

              {/* Hamburger — below lg only */}
              <button
                className="nav-hamburger md:hidden"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </nav>

          {/* Mobile menu — below lg */}
          {menuOpen && (
            <div className="md:hidden bg-[#1a2332] border-t border-yellow-400/20 px-5 py-5 flex flex-col gap-4 nav-mobile-menu">

              {isMounted && user && profile && (
                <div className="flex items-center gap-3 pb-4 border-b border-yellow-400/20">
                  <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(250,204,21,0.4)', background: '#1a2540', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <span style={{ fontSize: 13, fontWeight: 800, color: '#facc15' }}>{initials}</span>
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p className="text-yellow-300 font-bold text-sm truncate">{displayName}</p>
                    <p className="text-yellow-600 text-xs truncate">{user.email}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 5, background: roleMeta.bg, color: roleMeta.text, flexShrink: 0 }}>
                    {roleMeta.label}
                  </span>
                </div>
              )}

              {[
                { href: '/shop',     label: '🛍️ Shop',       special: false },
                { href: '/cheena',   label: '🔮 चिना',         special: true  },
                { href: '/about',    label: '📖 About Us',    special: false },
                { href: '/contact',  label: '📬 Contact',     special: false },
                { href: '/policies', label: '📜 Policies',    special: false },
                { href: '/order',    label: '🙏 Order Puja',  special: true  },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className={`font-bold text-base py-1 transition ${l.special ? 'text-amber-400 hover:text-amber-300' : 'text-yellow-200 hover:text-yellow-400'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  onClick={() => setMenuOpen(false)}
                >
                  <span style={{ fontFamily: EMOJI_FONT }}>{l.label.split(' ')[0]}</span>
                  {' '}{l.label.split(' ').slice(1).join(' ')}
                </Link>
              ))}

              {isMounted && isStaff && (
                <Link href="/admin/orders" className="font-bold text-base text-amber-400 hover:text-amber-300 py-1 transition" onClick={() => setMenuOpen(false)}>
                  <span style={{ fontFamily: EMOJI_FONT }}>⚙️</span> Admin Panel
                </Link>
              )}

              <Link href="/checkout" onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)',
                  borderRadius: 12, padding: '10px 14px',
                  color: '#facc15', fontWeight: 800, fontSize: 14, textDecoration: 'none',
                  transition: 'background 0.2s',
                }}>
                <span style={{ fontFamily: EMOJI_FONT }}>🛒</span>
                <span>कार्ट (Cart)</span>
                {isMounted && cartCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>
                    {cartCount > 9 ? '9+' : cartCount} items
                  </span>
                )}
                {isMounted && cartCount === 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#334155' }}>{t({en:'Empty',ne:'खाली'})}</span>
                )}
              </Link>

              {isMounted && user && (
                <Link href="/account/orders" className="flex items-center gap-2 text-yellow-200 font-bold text-base hover:text-yellow-400 transition py-1" onClick={() => setMenuOpen(false)}>
                  <span style={{ fontFamily: EMOJI_FONT }}>📦</span> {t({en:'My Orders',ne:'मेरो अर्डर'})}
                </Link>
              )}

              {isMounted && (user
                ? <button onClick={handleSignOut} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
                    borderRadius: 12, padding: '10px 14px', width: '100%', textAlign: 'left',
                    color: '#f87171', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.2s',
                  }}>
                    <span style={{ fontFamily: EMOJI_FONT }}>👋</span>
                    <span>{t({en:'Sign Out',ne:'साइन आउट'})}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: EMOJI_FONT }}>🚪</span>
                  </button>
                : <Link href="/login" className="font-bold text-base text-yellow-400 hover:text-yellow-300 py-1" onClick={() => setMenuOpen(false)}>
                    <span style={{ fontFamily: EMOJI_FONT }}>🔑</span> {t({en:'Sign In',ne:'साइन इन'})}
                  </Link>
              )}

              <a href="tel:9849350088"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: '#fde68a', fontWeight: 700, fontSize: 13,
                  paddingTop: 12, marginTop: 4,
                  borderTop: '1px solid rgba(250,204,21,0.15)',
                  textDecoration: 'none',
                }}>
                <span style={{ fontFamily: EMOJI_FONT }}>📞</span>
                <span>{t({en:'Contact: 9849350088',ne:'सम्पर्क गर्नुहोस् — ९८४९३५००८८'})}</span>
              </a>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

function NavItem({ href, label, special }) {
  const parts = label.split(' ');
  const icon  = parts[0];
  const text  = parts.slice(1).join(' ');
  return (
    <li style={{ listStyle: 'none', flexShrink: 0 }}>
      <Link href={href} className={`nav-link ${special ? 'text-amber-400' : 'text-yellow-100'}`}
        style={{ color: special ? '#fb923c' : '#fef9c3' }}>
        <span className="nav-link-icon" style={{ fontFamily: EMOJI_FONT }}>{icon}</span>
        {text && <span style={{ color: special ? '#fbbf24' : '#fef9c3' }}>{text}</span>}
        <span className="nav-link-underline" style={{ background: special ? '#fb923c' : '#facc15' }} />
      </Link>
    </li>
  );
}