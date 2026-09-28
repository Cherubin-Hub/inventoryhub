import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const path = req.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isOnboardingPage = path.startsWith("/onboarding");

  // 1. Auth pages routing
  if (isAuthPage) {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.nextUrl));
    return;
  }

  // 2. Protect everything else
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  // 3. Multi-tenancy check: force users without a company to onboarding
  const hasCompany = !!user?.companyId;

  if (!hasCompany && !isOnboardingPage) {
    return Response.redirect(new URL("/onboarding", req.nextUrl));
  }

  // 4. If they have a company but try to visit onboarding, kick them to the dashboard
  if (hasCompany && isOnboardingPage) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
