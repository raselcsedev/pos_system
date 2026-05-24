import { connectDB } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-helpers";
import { User } from "@/models/User";

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth();
    await connectDB();

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const avatar = typeof body.avatar === "string" ? body.avatar : undefined;

    if (!name) {
      return apiError("Name is required", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { name, ...(avatar ? { avatar } : {}) },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return apiError("User not found", 404);
    }

    return apiSuccess({ user: updatedUser }, "Profile updated", 200);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to update profile",
      401
    );
  }
}
