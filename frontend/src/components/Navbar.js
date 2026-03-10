'use client';
// src/components/Navbar.js

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ROLE_BADGE = {
  admin:    { bg: '#7c2d12', text: '#fbbf24', label: 'Admin'    },
  delivery: { bg: '#1e3a5f', text: '#60a5fa', label: 'Delivery' },
  accounts: { bg: '#14432a', text: '#4ade80', label: 'Accounts' },
  customer: { bg: '#1a2540', text: '#94a3b8', label: 'Customer' },
};

export default function Navbar() {
  const { cartCount }              = useCart();
  const { user, profile, signOut } = useAuth();
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
        .user-pill {
          position: relative; display: flex; align-items: center; gap: 10px;
          padding: 6px 10px 6px 6px;
          background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.18);
          border-radius: 40px; cursor: pointer;
          transition: background 0.2s, border-color 0.2s; user-select: none;
        }
        .user-pill:hover { background: rgba(250,204,21,0.12); border-color: rgba(250,204,21,0.35); }
        .user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          overflow: hidden; flex-shrink: 0;
          border: 2px solid rgba(250,204,21,0.4);
          background: #1a2540; display: flex; align-items: center; justify-content: center;
        }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-avatar-initials { font-size: 12px; font-weight: 800; color: #facc15; letter-spacing: 0.5px; }
        .user-pill-info { display: flex; flex-direction: column; line-height: 1.25; }
        .user-pill-name {
          font-size: 12px; font-weight: 700; color: #f1f5f9;
          max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .user-pill-role {
          font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 1px 5px; border-radius: 4px; width: fit-content; margin-top: 2px;
        }
        .user-pill-chevron { font-size: 10px; color: #475569; transition: transform 0.2s; margin-left: 2px; }
        .user-pill-chevron.open { transform: rotate(180deg); }
        .user-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          min-width: 220px;
          background: #0c1525; border: 1px solid #1a2d4a;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(250,204,21,0.04);
          z-index: 200; animation: dropIn 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-8px) scale(0.97); }
          to   { opacity:1; transform: none; }
        }
        .drop-header {
          padding: 15px 17px 13px;
          border-bottom: 1px solid #1a2d4a;
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
        .drop-item-icon  { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
        .drop-divider    { height: 1px; background: #0f1a2e; margin: 4px 7px; }
        .drop-item.logout { color: #f87171; }
        .drop-item.logout:hover { background: rgba(239,68,68,0.08); color: #fca5a5; }
        @media(max-width: 640px) {
          .user-pill-info { display: none; }
          .user-pill-chevron { display: none; }
          .user-pill { padding: 4px; }
        }
      `}</style>

      <header className="w-full sticky top-0 z-50">

        <div className="w-full bg-yellow-400 py-1.5 text-center text-xs font-semibold text-slate-900 tracking-wide">
          🕉️ &nbsp;नित्य पूजा सामग्री उपलब्ध • Free delivery above Rs. 1999&nbsp; 🕉️
        </div>

        <div className="w-full bg-[#111827] shadow-2xl border-b border-yellow-400/20">
          <nav className="flex h-28 items-center justify-between px-6 md:px-12 max-w-screen-2xl mx-auto gap-6">

            {/* LEFT: BRAND */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* FIX: outer div has relative, inner div also needs relative for Image fill */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                <div
                  className="w-full h-full rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.5)] bg-amber-900 flex items-center justify-center"
                  style={{ position: 'relative' }}
                >
                  <Image
                    src='/images/buba.png'
                    alt="पण्डित पुष्कर राज न्यौपाने"
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<span style="font-size:2rem;line-height:1">🙏</span>';
                    }}
                  />
                </div>
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-[#111827] rounded-full" />
              </div>
              <div className="flex flex-col leading-tight">
                <Link href="/" className="text-2xl md:text-3xl font-extrabold tracking-wide text-yellow-400 hover:text-yellow-300 transition">
                  पूजा सामग्री
                </Link>
                <span className="text-xs md:text-sm font-semibold text-yellow-200 mt-0.5">पण्डित पुष्कर राज न्यौपाने</span>
                <span className="text-[10px] text-yellow-600 font-medium tracking-wide mt-0.5 hidden md:block">ठिमी, भक्तपुर &bull; ९८४९३५००८८</span>
              </div>
            </div>

            {/* CENTER: NAV LINKS */}
            <ul className="hidden md:flex items-center gap-8 text-base font-bold text-yellow-100" style={{ listStyle:'none', padding:0, margin:0 }}>
              <NavItem href="/shop"     label="🛍️ Shop" />
              <NavItem href="/cheena"   label="🔮 चिना" special />
              <NavItem href="/about"    label="📖 About Us" />
              <NavItem href="/contact"  label="📬 Contact" />
              <NavItem href="/policies" label="📜 Policies" />
              {isMounted && isStaff && (
                <NavItem href="/admin/orders" label="⚙️ Admin" special />
              )}
            </ul>

            {/* RIGHT: BUTTONS */}
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">

              <Link
                href="/order"
                className="hidden sm:flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition border"
                style={{ background:'linear-gradient(135deg,rgba(250,204,21,0.12),rgba(249,115,22,0.12))', borderColor:'rgba(250,204,21,0.35)', color:'#facc15' }}
                onMouseEnter={e => e.currentTarget.style.background='linear-gradient(135deg,rgba(250,204,21,0.22),rgba(249,115,22,0.22))'}
                onMouseLeave={e => e.currentTarget.style.background='linear-gradient(135deg,rgba(250,204,21,0.12),rgba(249,115,22,0.12))'}
              >
                🙏 <span>Order Puja</span>
              </Link>

              <Link
                href="/checkout"
                className="relative flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-extrabold text-[#111827] shadow-lg transition-all hover:bg-yellow-300 hover:scale-[1.04]"
              >
                🛒
                <span className="hidden sm:inline">Cart</span>
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

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
                        <Link href="/account" className="drop-item" onClick={() => setUserDropOpen(false)}>
                          <span className="drop-item-icon">👤</span> My Account
                        </Link>
                        <Link href="/account/orders" className="drop-item" onClick={() => setUserDropOpen(false)}>
                          <span className="drop-item-icon">📦</span> My Orders
                        </Link>
                        <Link href="/checkout" className="drop-item" onClick={() => setUserDropOpen(false)}>
                          <span className="drop-item-icon">🛒</span> Cart
                        </Link>
                        <div className="drop-divider" />
                        <button className="drop-item logout" onClick={handleSignOut}>
                          <span className="drop-item-icon">🚪</span> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isMounted && !user && (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition"
                  style={{ color:'#facc15', border:'1px solid rgba(250,204,21,0.2)' }}
                >
                  🔑 Login
                </Link>
              )}

              <button
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-yellow-300 text-xl border border-white/10 hover:bg-white/20 transition"
                onClick={() => setMenuOpen(v => !v)}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </nav>

          {/* MOBILE MENU */}
          {menuOpen && (
            <div className="md:hidden bg-[#1a2332] border-t border-yellow-400/20 px-6 py-5 flex flex-col gap-4">
              {isMounted && user && profile && (
                <div className="flex items-center gap-3 pb-4 border-b border-yellow-400/20">
                  <div style={{ width:40, height:40, borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(250,204,21,0.4)', background:'#1a2540', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />
                      : <span style={{fontSize:13,fontWeight:800,color:'#facc15'}}>{initials}</span>
                    }
                  </div>
                  <div>
                    <p className="text-yellow-300 font-bold text-sm">{displayName}</p>
                    <p className="text-yellow-600 text-xs">{user.email}</p>
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:9, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', padding:'2px 7px', borderRadius:5, background:roleMeta.bg, color:roleMeta.text }}>
                    {roleMeta.label}
                  </span>
                </div>
              )}

              {[
                { href:'/shop',     label:'🛍️ Shop',    special:false },
                { href:'/cheena',   label:'🔮 चिना',     special:true  },
                { href:'/about',    label:'📖 About Us', special:false },
                { href:'/contact',  label:'📬 Contact',  special:false },
                { href:'/policies', label:'📜 Policies', special:false },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className={`font-bold text-base py-1 transition ${l.special ? 'text-amber-400 hover:text-amber-300' : 'text-yellow-200 hover:text-yellow-400'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ))}

              {isMounted && isStaff && (
                <Link href="/admin/orders" className="font-bold text-base text-amber-400 hover:text-amber-300 py-1 transition" onClick={() => setMenuOpen(false)}>
                  ⚙️ Admin Panel
                </Link>
              )}

              <Link href="/checkout" className="flex items-center gap-2 text-yellow-200 font-bold text-base hover:text-yellow-400 transition py-1" onClick={() => setMenuOpen(false)}>
                🛒 Cart
                {isMounted && cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </Link>

              {isMounted && (user
                ? <button onClick={handleSignOut} className="flex items-center gap-2 font-bold text-base text-red-400 hover:text-red-300 transition py-1 text-left">
                    🚪 Sign Out
                  </button>
                : <Link href="/login" className="font-bold text-base text-yellow-400 hover:text-yellow-300 py-1" onClick={() => setMenuOpen(false)}>
                    🔑 Sign In
                  </Link>
              )}

              <a href="tel:9849350088" className="text-yellow-300 font-semibold hover:text-yellow-400 transition text-sm pt-2 border-t border-yellow-400/20">
                📞 ९८४९३५००८८
              </a>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

function NavItem({ href, label, special }) {
  return (
    <li className="relative group" style={{ listStyle:'none' }}>
      <Link href={href} className={`cursor-pointer transition-colors duration-300 ${special ? 'text-amber-400 hover:text-amber-300' : 'text-yellow-100 hover:text-white'}`}>
        {label}
        <span className={`absolute left-0 -bottom-2 h-[3px] w-0 rounded-full transition-all duration-300 group-hover:w-full ${special ? 'bg-amber-400' : 'bg-yellow-400'}`} />
      </Link>
    </li>
  );
}