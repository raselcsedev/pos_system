import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requirePermission("products.manage");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return apiError("No file provided");

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return apiError("Only JPEG, PNG, WebP, and GIF images are allowed");
    }

    if (file.size > 5 * 1024 * 1024) {
      return apiError("File must be under 5MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (isCloudinaryConfigured()) {
      const url = await uploadImage(buffer);
      return apiSuccess({ url, provider: "cloudinary" });
    }

    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return apiSuccess({
      url: dataUrl,
      provider: "local",
      note: "Cloudinary not configured — using base64 embed",
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Upload failed", 500);
  }
}
