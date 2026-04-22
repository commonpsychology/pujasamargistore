// middleware.js
// Place at: D:\pujasamagri\frontend\middleware.js  (project root, next to package.json)
//
// Your project uses custom Supabase auth (AuthContext.js) — NOT next-auth.
// This middleware does ONE thing: passes every request through untouched.
// Admin auth is handled by each /admin/* page checking sessionStorage.
// Customer auth is handled by AuthContext.js on the client.

export function middleware() {
  // No-op — let all requests pass through.
  // Add route protection here in future if needed.
}

export const config = {
  matcher: [],  // empty = middleware runs on nothing = effectively disabled
};