// app/layout.js
// Simple non-async server component — no headers() needed.
// ShellLayout (client) handles the conditional Navbar/Footer logic.

import './globals.css';
import ShellLayout from '../src/components/ShellLayout';
import { CartProvider } from '../src/context/CartContext';
import { AuthProvider } from '../src/context/AuthContext';
import { LangProvider } from '../src/context/LangContext';

export const metadata = {
  title:       'पूजा सामग्री — Puja Samagri',
  description: 'Authentic Nepali puja samagri — Bhaktapur, Thimi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ne">
      <body>
        <AuthProvider>
          <CartProvider>
            <LangProvider>
              <ShellLayout>{children}</ShellLayout>
            </LangProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}