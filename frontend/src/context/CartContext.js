'use client';

// src/context/CartContext.js

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

/* ── helpers ── */
const load = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

/* ── reducer ── */
function cartReducer(state, action) {
  switch (action.type) {

    case 'ADD': {
      const key = `${action.product.id}-${action.variant ?? 'default'}`;
      const exists = state.find(i => i.key === key);
      if (exists) {
        return state.map(i =>
          i.key === key ? { ...i, qty: i.qty + (action.qty ?? 1) } : i
        );
      }
      return [...state, { key, product: action.product, variant: action.variant ?? null, qty: action.qty ?? 1 }];
    }

    case 'REMOVE':
      return state.filter(i => i.key !== action.key);

    case 'SET_QTY':
      if (action.qty <= 0) return state.filter(i => i.key !== action.key);
      return state.map(i => i.key === action.key ? { ...i, qty: action.qty } : i);

    case 'CLEAR':
      return [];

    default:
      return state;
  }
}

/* ── context ── */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(
    cartReducer,
    [],
    () => load('pooja_cart', [])
  );

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('pooja_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart      = useCallback((product, qty = 1, variant = null) =>
    dispatch({ type: 'ADD', product, qty, variant }), []);

  const removeFromCart = useCallback((key) =>
    dispatch({ type: 'REMOVE', key }), []);

  const setQty         = useCallback((key, qty) =>
    dispatch({ type: 'SET_QTY', key, qty }), []);

  const clearCart      = useCallback(() =>
    dispatch({ type: 'CLEAR' }), []);

  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);
  const cartTotal = cart.reduce((acc, i) => acc + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      itemCount: cartCount,   // ← alias so any file using itemCount still works
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

/* ── hook ── */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}