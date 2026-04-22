// app/verify-email/layout.js
// Overrides the root layout for this route only.
// No header, no footer — just the bare page.

export const metadata = {
  title: 'Verify Email',
};

export default function VerifyEmailLayout({ children }) {
  return children;
}