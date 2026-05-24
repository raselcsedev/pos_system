import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { zodFirstError } from "@/lib/zod-error";
import { BranchRepository } from "@/repositories/branch.repository";
import { branchSchema } from "@/validations/branch.schema";

const repo = new BranchRepository();

export async function GET(req: Request) {
  try {
    await requirePermission("branches.manage");
    await connectDB();
    const { searchParams } = new URL(req.url);
    const result = await repo.paginate({
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 50),
      search: searchParams.get("search") ?? undefined,
    });
    return apiSuccess(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission("branches.manage");
    await connectDB();
    const body = await req.json();
    const parsed = branchSchema.safeParse(body);
    if (!parsed.success) return apiError(zodFirstError(parsed.error));

    const branch = await repo.create(parsed.data);
    return apiSuccess(branch, "Branch created", 201);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 400);
  }
}
