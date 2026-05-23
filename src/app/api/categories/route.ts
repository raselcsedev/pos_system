import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth, requirePermission } from "@/lib/auth-helpers";
import { Category } from "@/models/Category";
import { categorySchema } from "@/validations/category.schema";

export async function GET() {
  try {
    await requireAuth();
    await connectDB();
    const categories = await Category.find({ isActive: true }).select("name slug description image isActive").lean();
    return apiSuccess(categories);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed to load categories", 401);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission("products.manage");
    await connectDB();

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid category data");
    }

    const data = parsed.data;
    const slug = data.slug?.trim()
      ? data.slug.trim().toLowerCase().replace(/\s+/g, "-")
      : data.name.trim().toLowerCase().replace(/\s+/g, "-");

    const category = await Category.create({
      name: data.name,
      slug,
      description: data.description,
      image: data.image,
      parentId: data.parentId ? new mongoose.Types.ObjectId(data.parentId) : undefined,
      isActive: data.isActive ?? true,
      branchId: data.branchId ? new mongoose.Types.ObjectId(data.branchId) : undefined,
    });

    return apiSuccess(category, "Category created", 201);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed to create category", 400);
  }
}
