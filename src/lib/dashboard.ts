// 자리지킴이 — 홈 대시보드/맵 개요 집계 로직 (PRD F15, 9.3)
// app/api/dashboard/summary와 app/(main)/page.tsx, map/page.tsx가 공통으로 쓴다.
import { prisma } from "@/lib/db";
import type { DashboardSummary, DashboardZoneSummary } from "@/lib/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [zones, seats, awayCount] = await Promise.all([
    prisma.zone.findMany({ orderBy: { floor: "asc" } }),
    prisma.seat.findMany(),
    prisma.awayPeriod.count({ where: { endedAt: null } }),
  ]);

  const byZone: DashboardZoneSummary[] = zones.map((zone) => {
    const zoneSeats = seats.filter((s) => s.zoneCode === zone.code);
    return {
      zoneCode: zone.code as DashboardZoneSummary["zoneCode"],
      zoneName: zone.name,
      floor: zone.floor,
      total: zoneSeats.length,
      available: zoneSeats.filter((s) => s.status === "AVAILABLE").length,
      occupied: zoneSeats.filter((s) => s.status === "OCCUPIED").length,
    };
  });

  return {
    total: byZone.reduce((sum, z) => sum + z.total, 0),
    available: byZone.reduce((sum, z) => sum + z.available, 0),
    occupied: byZone.reduce((sum, z) => sum + z.occupied, 0),
    awayCount,
    updatedAt: new Date().toISOString(),
    byZone,
  };
}
