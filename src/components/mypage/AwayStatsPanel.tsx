"use client";

import { useCallback, useEffect, useState } from "react";
import { AwayStatsDonut } from "./AwayStatsDonut";
import { LiveAwayMiniDonut } from "./LiveAwayMiniDonut";
import { AwayDailyLineChart } from "./AwayDailyLineChart";
import type { AwayDailyStats, AwayStats } from "@/lib/types";

type Range = "week" | "month";

/**
 * design.md 4.7 — 외출 태그별 주/월 통계 도넛 + (진행 중이면) 그 오른쪽 작은 실시간 진행률 도넛,
 * 그 아래 최근 7일 일별 자리비움 시간 선그래프.
 */
export function AwayStatsPanel({
  activeAway,
}: {
  activeAway: { label: string; limitMinutes: number; startedAt: string } | null;
}) {
  const [range, setRange] = useState<Range>("week");
  const [stats, setStats] = useState<AwayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<AwayDailyStats | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);

  const reload = useCallback(async (r: Range) => {
    setLoading(true);
    const res = await fetch(`/api/me/away-stats?range=${r}`);
    if (res.ok) setStats(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload(range);
  }, [range, reload]);

  useEffect(() => {
    async function loadDaily() {
      const res = await fetch("/api/me/away-daily");
      if (res.ok) setDaily(await res.json());
      setDailyLoading(false);
    }
    loadDaily();
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">외출 태그 통계</h2>
          <div className="flex gap-1 rounded-full bg-neutral-100 p-0.5 text-xs">
            {(["week", "month"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-2.5 py-1 font-medium ${
                  range === r ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                }`}
              >
                {r === "week" ? "이번 주" : "이번 달"}
              </button>
            ))}
          </div>
        </div>

        {loading || !stats ? (
          <p className="text-sm text-neutral-400">불러오는 중…</p>
        ) : (
          <div className="flex items-start justify-center gap-4">
            <AwayStatsDonut categories={stats.categories} />
            {activeAway && (
              <LiveAwayMiniDonut
                categoryLabel={activeAway.label}
                limitMinutes={activeAway.limitMinutes}
                startedAt={activeAway.startedAt}
              />
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">일별 자리비움 시간 (최근 7일)</h2>
        {dailyLoading || !daily ? (
          <p className="text-sm text-neutral-400">불러오는 중…</p>
        ) : (
          <AwayDailyLineChart days={daily.days} />
        )}
      </div>
    </div>
  );
}
