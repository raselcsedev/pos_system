import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { zodFirstError } from "@/lib/zod-error";
import { BranchRepository } from "@/repositories/branch.repository";
import { branchSchema } from "@/validations/branch.schema";

const repo = new BranchRepository();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("branches.manage");
    await connectDB();
    const { id } = await params;
    const branch = await repo.findById(id);
    if (!branch) return apiError("Branch not found", 404);
    return apiSuccess(branch);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("branches.manage");
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = branchSchema.safeParse(body);
    if (!parsed.success) return apiError(zodFirstError(parsed.error));

    const branch = await repo.update(id, parsed.data);
    if (!branch) return apiError("Branch not found", 404);
    return apiSuccess(branch, "Branch updated");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("branches.manage");
    await connectDB();
    const { id } = await params;
    await repo.delete(id);
    return apiSuccess(null, "Branch deactivated");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}
