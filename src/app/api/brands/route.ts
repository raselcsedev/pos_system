import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { Brand } from "@/models/Brand";
import { brandSchema } from "@/validations/brand.schema";

export async function GET() {
  try {
    await requirePermission("products.manage");
    await connectDB();
    const brands = await Brand.find().sort({ name: 1 }).lean();
    return apiSuccess(brands);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load brands", 401);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission("products.manage");
    await connectDB();

    const body = await req.json();
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid brand data");
    }

    const data = parsed.data;
    const slug = data.slug?.trim()
      ? data.slug.trim().toLowerCase().replace(/\s+/g, "-")
      : data.name.trim().toLowerCase().replace(/\s+/g, "-");

    const brand = await Brand.create({
      name: data.name,
      slug,
      logo: data.logo,
      isActive: data.isActive ?? true,
    });

    return apiSuccess(brand, "Brand created", 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create brand", 400);
  }
}
