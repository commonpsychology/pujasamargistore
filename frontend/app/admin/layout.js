// app/admin/layout.js
// This layout OVERRIDES the global layout for all /admin/* routes.
// No navbar, no footer — just the admin UI in isolation.

export const metadata = {
  title: 'Admin — Orders',
  robots: { index: false, follow: false }, // keep admin out of search engines
};

export default function AdminLayout({ children }) {
  return (
    <div style={{ isolation: 'isolate' }}>
      {children}
    </div>
  );
}