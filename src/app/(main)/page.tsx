import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { buildMockDashboardSummary } from "@/lib/mock-data";

/** design.md 4.8 — 홈 대시보드("/"). TODO: buildMockDashboardSummary를 /api/dashboard/summary 호출로 교체 */
export default function DashboardPage() {
  const data = buildMockDashboardSummary();
  return <DashboardSummary data={data} />;
}
