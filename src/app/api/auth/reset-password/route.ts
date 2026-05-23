import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { zodFirstError } from "@/lib/zod-error";
import { User } from "@/models/User";
import { resetPasswordSchema } from "@/validations/auth.schema";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error));
    }

    const user = await User.findOne({
      resetToken: parsed.data.token,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return apiError("Invalid or expired reset token", 400);
    }

    user.password = await bcrypt.hash(parsed.data.password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return apiSuccess(null, "Password reset successfully");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 500);
  }
}
