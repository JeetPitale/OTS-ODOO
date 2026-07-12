import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = nextUrl.pathname === "/login" || isApiAuthRoute || nextUrl.pathname === "/verify-dispatch";

  // 1. Redirect unauthenticated users to login page
  if (!isLoggedIn && !isPublicRoute) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. Redirect authenticated users away from login page
  if (isLoggedIn && nextUrl.pathname === "/login") {
    const userRole = req.auth?.user?.role;
    if (userRole === "DISPATCH_MANAGER") {
      return NextResponse.redirect(new URL("/dispatch-dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 3. Role-based route guards
  if (isLoggedIn) {
    const userRole = req.auth?.user?.role;

    // Dispatch Manager role route protection:
    // If user is a DISPATCH_MANAGER, prevent accessing any unauthorized pages.
    // Authorized paths: /dispatch-dashboard, /smart-dispatch, /qr-management, /dispatch-queue, /active-dispatches, /dispatch-history, /qr-verification, /notifications, /shift-summary, /profile
    const dispatchManagerRoutes = [
      "/dispatch-dashboard",
      "/smart-dispatch",
      "/qr-management",
      "/dispatch-queue",
      "/active-dispatches",
      "/dispatch-history",
      "/qr-verification",
      "/notifications",
      "/shift-summary",
      "/profile"
    ];

    if (userRole === "DISPATCH_MANAGER") {
      const isAllowed = dispatchManagerRoutes.some(route => 
        nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
      );
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/dispatch-dashboard", nextUrl));
      }
    } else {
      // Prevent other roles from accessing the dispatch dashboard
      if (nextUrl.pathname.startsWith("/dispatch-dashboard")) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
    }

    if (nextUrl.pathname.startsWith("/settings")) {
      const allowedRoles = ["FLEET_MANAGER", "FINANCIAL_ANALYST"];
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) except auth API
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
