'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ConditionalShell({ children }) {
  const pathname = usePathname();
  const isHidden = pathname?.startsWith('/admin') || pathname === '/login';

  return (
    <>
      {!isHidden && <Navbar />}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!isHidden && <Footer />}
    </>
  );
}