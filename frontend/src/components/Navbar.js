'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <header className="w-full sticky top-0 z-50">

        {/* TOP STRIP */}
        <div className="w-full bg-yellow-400 py-1.5 text-center text-xs font-semibold text-slate-900 tracking-wide">
          🕉️ &nbsp;नित्य पूजा सामग्री उपलब्ध • Free delivery above Rs. 1999&nbsp; 🕉️
        </div>

        {/* MAIN NAVBAR */}
        <div className="w-full bg-[#111827] shadow-2xl border-b border-yellow-400/20">
          <nav className="flex h-28 items-center justify-between px-6 md:px-12 max-w-screen-2xl mx-auto gap-6">

            {/* LEFT: AVATAR + BRAND */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.5)] bg-amber-900 flex items-center justify-center">
                  <Image
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=PuskarRajNeupane"
                    alt="पण्डित पुष्कर राज न्यौपाने"
                    fill className="object-cover" unoptimized
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
            <ul className="hidden md:flex items-center gap-10 text-base font-bold text-yellow-100" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <NavItem href="/shop"     label="🛍️ Shop" />
              <NavItem href="/order"    label="📿 Order Puja" />
              <NavItem href="/about"    label="📖 About Us" />
              <NavItem href="/contact"  label="📬 Contact" />
              <NavItem href="/policies" label="📜 Policies" />
            </ul>

            {/* RIGHT: ORDER BTN + CART + HAMBURGER */}
            <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">

              {/* ORDER PUJA BUTTON */}
              <Link
                href="/order"
                className="hidden sm:flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition border"
                style={{
                  background: 'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(249,115,22,0.12))',
                  borderColor: 'rgba(250,204,21,0.35)',
                  color: '#facc15',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(250,204,21,0.22), rgba(249,115,22,0.22))'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(249,115,22,0.12))'; }}
              >
                🙏 <span>Order Puja</span>
              </Link>

              {/* CART */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-extrabold text-[#111827] shadow-lg transition-all hover:bg-yellow-300 hover:scale-[1.04]"
              >
                🛒
                <span className="hidden sm:inline">Cart</span>
                {isMounted && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* HAMBURGER */}
              <button
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-yellow-300 text-xl border border-white/10 hover:bg-white/20 transition"
                onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu"
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </nav>

          {/* MOBILE DROPDOWN */}
          {menuOpen && (
            <div className="md:hidden bg-[#1a2332] border-t border-yellow-400/20 px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-4 border-b border-yellow-400/20">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 flex-shrink-0">
                  <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=PuskarRajNeupane" alt="Pandit" fill className="object-cover" unoptimized />
                </div>
                <div>
                  <p className="text-yellow-300 font-bold text-sm">पण्डित पुष्कर राज न्यौपाने</p>
                  <p className="text-yellow-600 text-xs">ठिमी, भक्तपुर</p>
                </div>
              </div>
              {[
                { href: '/shop',     label: '🛍️ Shop' },
                { href: '/order',    label: '📿 कर्मकाण्ड' },
                { href: '/about',    label: '📖 About Us' },
                { href: '/contact',  label: '📬 Contact' },
                { href: '/policies', label: '📜 Policies' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="text-yellow-200 font-bold text-base hover:text-yellow-400 transition py-1"
                  onClick={() => setMenuOpen(false)}>
                  {l.label}
                </Link>
              ))}
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

function NavItem({ href, label }) {
  return (
    <li className="relative group" style={{ listStyle: 'none' }}>
      <Link href={href} className="cursor-pointer text-yellow-100 transition-colors duration-300 hover:text-white">
        {label}
        <span className="absolute left-0 -bottom-2 h-[3px] w-0 rounded-full bg-yellow-400 transition-all duration-300 group-hover:w-full" />
      </Link>
    </li>
  );
}