import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { zodFirstError } from "@/lib/zod-error";
import { EmployeeRepository } from "@/repositories/employee.repository";
import { employeeCreateSchema } from "@/validations/employee.schema";

const repo = new EmployeeRepository();

export async function GET(req: Request) {
  try {
    await requirePermission("employees.manage");
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
    await requirePermission("employees.manage");
    await connectDB();
    const body = await req.json();
    const parsed = employeeCreateSchema.safeParse(body);
    if (!parsed.success) return apiError(zodFirstError(parsed.error));

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const employee = await repo.create({
      ...parsed.data,
      password: hashedPassword,
    });

    const { password, ...result } = employee.toObject();
    return apiSuccess(result, "Employee created", 201);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 400);
  }
}
