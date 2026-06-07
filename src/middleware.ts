import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { hasPermission, ROUTE_PERMISSIONS } from "@/lib/permissions";
import type { Permission, UserRole } from "@/types";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  // Public routes
  if (isPublic) {
    if (pathname === "/login" && req.auth?.user) {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }

    return NextResponse.next();
  }

  // Not authenticated
  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.url);

    if (pathname !== "/login") {
      loginUrl.searchParams.set(
        "callbackUrl",
        pathname
      );
    }

    return NextResponse.redirect(loginUrl);
  }

  // Permission checking
  const matchedRoute = Object.keys(
    ROUTE_PERMISSIONS
  ).find((route) => pathname.startsWith(route));

  if (matchedRoute) {
    const permission =
      ROUTE_PERMISSIONS[matchedRoute] as Permission;

    const role =
      req.auth.user.role as UserRole;

    // Uses role-based permissions only
    if (!hasPermission(role, permission)) {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|firebase-messaging-sw.js).*)",
  ],
};