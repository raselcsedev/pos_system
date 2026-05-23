import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-helpers";
import { DashboardService } from "@/services/dashboard.service";

const dashboardService = new DashboardService();

export async function GET() {
  try {
    const session = await requireAuth();
    const [overview, chart] = await Promise.all([
      dashboardService.getOverview(session.user.branchId),
      dashboardService.getSalesChart(7, session.user.branchId),
    ]);
    return apiSuccess({ overview, chart });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}
