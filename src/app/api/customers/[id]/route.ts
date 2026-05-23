import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { zodFirstError } from "@/lib/zod-error";
import { CustomerRepository } from "@/repositories/customer.repository";
import { customerSchema } from "@/validations/customer.schema";

const repo = new CustomerRepository();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("customers.manage");
    await connectDB();
    const { id } = await params;
    const customer = await repo.findById(id);
    if (!customer) return apiError("Customer not found", 404);
    return apiSuccess(customer);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("customers.manage");
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) return apiError(zodFirstError(parsed.error));

    const customer = await repo.update(id, {
      ...parsed.data,
      email: parsed.data.email || undefined,
    });
    if (!customer) return apiError("Customer not found", 404);
    return apiSuccess(customer, "Customer updated");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("customers.manage");
    await connectDB();
    const { id } = await params;
    await repo.delete(id);
    return apiSuccess(null, "Customer deactivated");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}
