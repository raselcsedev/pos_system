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
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublic) {
    if (pathname === "/login" && req.auth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((route) =>
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    const permission = ROUTE_PERMISSIONS[matchedRoute] as Permission;
    const role = req.auth.user?.role as UserRole;
    const perms = req.auth.user?.permissions as Permission[] | undefined;

    if (!hasPermission(role, permission, perms)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|firebase-messaging-sw.js).*)",
  ],
};
