import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { zodFirstError } from "@/lib/zod-error";
import { EmployeeRepository } from "@/repositories/employee.repository";
import { employeeUpdateSchema } from "@/validations/employee.schema";

const repo = new EmployeeRepository();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("employees.manage");
    await connectDB();
    const { id } = await params;
    const employee = await repo.findById(id);
    if (!employee) return apiError("Employee not found", 404);
    return apiSuccess(employee);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("employees.manage");
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = employeeUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(zodFirstError(parsed.error));

    const updateData = {
      ...parsed.data,
      password: parsed.data.password ? await bcrypt.hash(parsed.data.password, 12) : undefined,
    };

    if (updateData.password === undefined) {
      delete updateData.password;
    }

    const employee = await repo.update(id, updateData);
    if (!employee) return apiError("Employee not found", 404);

    const { password, ...result } = employee.toObject();
    return apiSuccess(result, "Employee updated");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("employees.manage");
    await connectDB();
    const { id } = await params;
    await repo.delete(id);
    return apiSuccess(null, "Employee deactivated");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}
