import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { User } from "@/models/User";
import { zodFirstError } from "@/lib/zod-error";
import { forgotPasswordSchema } from "@/validations/auth.schema";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error, "Invalid email"));
    }

    const user = await User.findOne({ email: parsed.data.email });
    if (!user) {
      return apiSuccess(null, "If the email exists, a reset link was sent");
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    console.log("[DEV] Password reset URL:", resetUrl);

    return apiSuccess(null, "If the email exists, a reset link was sent");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 500);
  }
}
