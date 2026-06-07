import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

import type { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    role: UserRole;
    branchId?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      branchId?: string;
      image?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
    branchId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          const user = await User.findOne({
            email: credentials.email,
            isActive: true,
          }).select("+password");

          if (!user) {
            return null;
          }

          const validPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!validPassword) {
            return null;
          }

          user.lastLogin = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: user.branchId?.toString(),
          };
        } catch (error) {
          console.error("[Auth] authorize error:", error);
          return null;
        }
      },
    }),
  ],
});