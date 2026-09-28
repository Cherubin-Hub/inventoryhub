import { auth } from "@/lib/auth";

// This function runs on EVERY page request before the page loads.
export default auth((req) => {
  const isLoggedIn = !!req.auth; // True if the user has a valid session token
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup");

  // If the user is trying to access Login or Signup while already logged in...
  if (isAuthPage) {
    if (isLoggedIn) {
      // ...redirect them away to the dashboard.
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
    return; // Otherwise, let them see the login page.
  }

  // If the user is trying to access ANY OTHER PAGE while NOT logged in...
  if (!isLoggedIn) {
    // ...kick them out to the login page.
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

// The matcher tells Next.js which paths the middleware should run on.
// We exclude API routes and static files (like images and CSS) for performance.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
