import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { InventoryService } from "@/services/inventory.service";
import { zodFirstError } from "@/lib/zod-error";
import { z } from "zod";

const inventoryService = new InventoryService();

const adjustSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  type: z.enum(["adjustment", "damage", "return", "transfer"]),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requirePermission("inventory.manage");
    const body = await req.json();
    const parsed = adjustSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error));
    }

    const product = await inventoryService.adjustStock({
      ...parsed.data,
      createdBy: session.user.id,
      branchId: session.user.branchId,
    });

    return apiSuccess(product, "Stock adjusted");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 400);
  }
}
