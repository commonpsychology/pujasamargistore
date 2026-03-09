// app/layout.js
// Added AuthProvider wrapping CartProvider so auth is available everywhere

import './globals.css';
import { CartProvider } from '../src/context/CartContext';
import { AuthProvider }  from '../src/context/AuthContext';
import ConditionalShell  from '../src/components/ConditionalShell';

export const metadata = {
  title: 'पूजा सामग्री — पण्डित पुष्कर राज न्यौपाने',
  description: 'Authentic pooja essentials and festive kits from Thimi, Bhaktapur.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ne">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <ConditionalShell>
              {children}
            </ConditionalShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}