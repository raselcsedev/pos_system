// src/types/next-auth.d.ts

import { DefaultSession } from "next-auth";
import { Permission, UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      permissions?: Permission[];
      branchId?: string;
    } & DefaultSession["user"];
  }
}