import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { zodFirstError } from "@/lib/zod-error";
import { SupplierRepository } from "@/repositories/supplier.repository";
import { supplierSchema } from "@/validations/supplier.schema";

const repo = new SupplierRepository();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("suppliers.manage");
    await connectDB();
    const { id } = await params;
    const supplier = await repo.findById(id);
    if (!supplier) return apiError("Supplier not found", 404);
    return apiSuccess(supplier);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("suppliers.manage");
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = supplierSchema.safeParse(body);
    if (!parsed.success) return apiError(zodFirstError(parsed.error));

    const supplier = await repo.update(id, {
      ...parsed.data,
      email: parsed.data.email || undefined,
    });
    if (!supplier) return apiError("Supplier not found", 404);
    return apiSuccess(supplier, "Supplier updated");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("suppliers.manage");
    await connectDB();
    const { id } = await params;
    await repo.delete(id);
    return apiSuccess(null, "Supplier deactivated");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}
