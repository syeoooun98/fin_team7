import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { getDashboardSummary } from "@/lib/dashboard";

/** design.md 4.8 — 홈 대시보드("/") */
export default async function DashboardPage() {
  const data = await getDashboardSummary();
  return <DashboardSummary data={data} />;
}
