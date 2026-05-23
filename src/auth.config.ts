import type { NextAuthConfig } from "next-auth";
import type { Permission, UserRole } from "@/types";

/**
 * Edge-compatible Auth.js config (no Mongoose/bcrypt).
 * Used by middleware. Full providers live in auth.ts.
 */
const authSecret =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "production" ? undefined : "dev-secret-change-in-production-use-openssl-rand");

if (!authSecret) {
  throw new Error(
    "NEXTAUTH_SECRET or AUTH_SECRET must be defined in environment variables"
  );
}

export const authConfig = {
  secret: authSecret,
  debug: process.env.NODE_ENV !== "production",
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
        token.branchId = user.branchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.permissions = (token.permissions as Permission[]) ?? [];
        session.user.branchId = token.branchId as string | undefined;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
