import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { Brand } from "@/models/Brand";
import { brandSchema } from "@/validations/brand.schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("products.manage");
    await connectDB();

    const { id } = await params;
    const brand = await Brand.findById(id).lean();
    if (!brand) return apiError("Brand not found", 404);
    return apiSuccess(brand);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load brand", 401);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("products.manage");
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid brand data");
    }

    const data = parsed.data;
    const slug = data.slug?.trim()
      ? data.slug.trim().toLowerCase().replace(/\s+/g, "-")
      : data.name.trim().toLowerCase().replace(/\s+/g, "-");

    const updated = await Brand.findByIdAndUpdate(
      id,
      {
        name: data.name,
        slug,
        logo: data.logo,
        isActive: data.isActive ?? true,
      },
      { new: true }
    ).lean();

    if (!updated) return apiError("Brand not found", 404);
    return apiSuccess(updated, "Brand updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update brand", 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("products.manage");
    await connectDB();

    const { id } = await params;
    const deleted = await Brand.findByIdAndDelete(id).lean();
    if (!deleted) return apiError("Brand not found", 404);
    return apiSuccess(deleted, "Brand deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete brand", 400);
  }
}
