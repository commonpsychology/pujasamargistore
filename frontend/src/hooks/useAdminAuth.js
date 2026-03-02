'use client';

// src/hooks/useAdminAuth.js
// Drop this hook into any admin page to guard it.
// Usage:  const { user, logout } = useAdminAuth();
// If not logged in, redirects to /login automatically.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('puja_user');
    if (!saved) {
      router.replace('/login');
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      setUser(parsed);
    } catch (_) {
      router.replace('/login');
    } finally {
      setChecked(true);
    }
  }, [router]);

  const logout = () => {
    sessionStorage.removeItem('puja_user');
    router.push('/login');
  };

  return { user, logout, checked };
}