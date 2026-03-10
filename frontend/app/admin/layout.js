'use client';
// app/admin/layout.js
//
// Shared layout for all /admin/* pages.
// Renders a sidebar nav. Auth check is done by each page individually.

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/admin/orders',   icon: '🛒', label: 'Shop Orders'  },
  { href: '/admin/bookings', icon: '🪔', label: 'Bookings'     },
  { href: '/admin/messages', icon: '✉️',  label: 'Messages'     },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [staff,     setStaff]     = useState(null);
  const [sideOpen,  setSideOpen]  = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('admin_staff');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (s) setStaff(JSON.parse(s));
    } catch {}
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_staff');
    router.replace('/admin-login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;600;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #facc15; --green: #22c55e; --red: #f87171;
          --bg: #080d18; --surface: #0c1220; --surface2: #111827;
          --border: #1a2540; --border2: #1e293b;
          --muted: #475569; --text: #f1f5f9;
          --sidebar-w: 220px;
        }

        body { background: var(--bg); margin: 0; }

        /* ── Sidebar ── */
        .adm-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: var(--sidebar-w);
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          z-index: 100;
          transition: transform 0.25s ease;
        }
        .adm-sidebar.closed { transform: translateX(calc(-1 * var(--sidebar-w))); }

        .adm-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
        }
        .adm-logo-eye  { font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 4px; }
        .adm-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 700; color: var(--text);
        }

        .adm-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 4px; }

        .adm-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 700;
          color: var(--muted); text-decoration: none;
          transition: all 0.15s;
        }
        .adm-nav-link:hover  { background: rgba(255,255,255,0.03); color: #94a3b8; }
        .adm-nav-link.active { background: rgba(250,204,21,0.07); color: var(--gold); }
        .adm-nav-link .nav-icon { font-size: 16px; width: 22px; text-align: center; }

        .adm-footer {
          padding: 16px 10px;
          border-top: 1px solid var(--border);
        }
        .adm-staff-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; margin-bottom: 6px;
        }
        .adm-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(250,204,21,0.1);
          border: 1px solid rgba(250,204,21,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: var(--gold);
          flex-shrink: 0;
        }
        .adm-staff-info { min-width: 0; }
        .adm-staff-name { font-size: 12px; font-weight: 700; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adm-staff-role { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }

        .adm-logout-btn {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 9px 12px; border-radius: 10px;
          background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.12);
          color: var(--red); font-size: 12px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .adm-logout-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); }

        /* ── Mobile hamburger ── */
        .adm-hamburger {
          display: none;
          position: fixed; top: 14px; left: 14px; z-index: 200;
          background: var(--surface); border: 1px solid var(--border2);
          border-radius: 10px; padding: 8px 10px;
          cursor: pointer; font-size: 18px; line-height: 1;
          color: var(--text);
        }
        .adm-overlay {
          display: none;
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 99;
        }

        /* ── Main content ── */
        .adm-main {
          margin-left: var(--sidebar-w);
          min-height: 100vh;
          background: var(--bg);
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .adm-hamburger { display: block; }
          .adm-sidebar   { transform: translateX(calc(-1 * var(--sidebar-w))); }
          .adm-sidebar.open { transform: translateX(0); }
          .adm-overlay.open { display: block; }
          .adm-main { margin-left: 0; }
        }
      `}</style>

      {/* Mobile hamburger */}
      <button className="adm-hamburger" onClick={() => setSideOpen(o => !o)}>☰</button>

      {/* Overlay for mobile */}
      <div
        className={`adm-overlay${sideOpen ? ' open' : ''}`}
        onClick={() => setSideOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`adm-sidebar${sideOpen ? ' open' : ''}`}>
        <div className="adm-logo">
          <p className="adm-logo-eye">Admin Panel</p>
          <p className="adm-logo-name">पूजा सामग्री</p>
        </div>

        <nav className="adm-nav">
          {NAV.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`adm-nav-link${pathname === href ? ' active' : ''}`}
              onClick={() => setSideOpen(false)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="adm-footer">
          {staff && (
            <div className="adm-staff-row">
              <div className="adm-avatar">{staff.name?.[0]?.toUpperCase() ?? 'A'}</div>
              <div className="adm-staff-info">
                <div className="adm-staff-name">{staff.name}</div>
                <div className="adm-staff-role">{staff.role}</div>
              </div>
            </div>
          )}
          <button className="adm-logout-btn" onClick={handleLogout}>
            🔒 Logout
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="adm-main">
        {children}
      </main>
    </>
  );
}