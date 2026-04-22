// app/layout.js
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
    <html lang="ne" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&family=DM+Sans:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
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