import { auth } from "@/auth";
import { hasPermission } from "@/lib/permissions";
import type { Permission } from "@/types";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const allowed = hasPermission(
    session.user.role,
    permission,
  );
  if (!allowed) throw new Error("Forbidden");
  return session;
}
