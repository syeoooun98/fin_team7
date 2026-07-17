import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deriveDisplaySeatStatus } from "@/lib/seat-status";
import type { DashboardSummary, DashboardZoneSummary } from "@/lib/types";

/** GET /api/dashboard/summary — PRD F15, 9.3 홈 대시보드 집계 */
export async function GET() {
  const [zones, seats, awayCount] = await Promise.all([
    prisma.zone.findMany({ orderBy: { floor: "asc" } }),
    prisma.seat.findMany(),
    prisma.awayPeriod.count({ where: { endedAt: null } }),
  ]);

  const now = new Date();

  const byZone: DashboardZoneSummary[] = zones.map((zone) => {
    const zoneSeats = seats.filter((s) => s.zoneCode === zone.code);
    const statuses = zoneSeats.map((s) => deriveDisplaySeatStatus(s.status, s.statusChangedAt, now));
    return {
      zoneCode: zone.code as DashboardZoneSummary["zoneCode"],
      zoneName: zone.name,
      floor: zone.floor,
      total: zoneSeats.length,
      available: statuses.filter((s) => s === "AVAILABLE").length,
      empty: statuses.filter((s) => s === "EMPTY").length,
      occupied: statuses.filter((s) => s === "OCCUPIED").length,
    };
  });

  const summary: DashboardSummary = {
    total: byZone.reduce((sum, z) => sum + z.total, 0),
    available: byZone.reduce((sum, z) => sum + z.available, 0),
    empty: byZone.reduce((sum, z) => sum + z.empty, 0),
    occupied: byZone.reduce((sum, z) => sum + z.occupied, 0),
    awayCount,
    updatedAt: now.toISOString(),
    byZone,
  };

  return NextResponse.json(summary);
}
