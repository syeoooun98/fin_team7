"use client";

import { useCallback, useEffect, useState } from "react";
import { MySeatCard } from "@/components/mypage/MySeatCard";
import { NotificationList } from "@/components/mypage/NotificationList";
import { AwayStatsPanel } from "@/components/mypage/AwayStatsPanel";
import { ProfileBadges } from "@/components/mypage/ProfileBadges";
import type { NotificationItem, OwnSeatDetail } from "@/lib/types";

const POLL_INTERVAL_MS = 5000;

/** design.md 4.7 — 마이페이지(Should, F18). 내 좌석/알림을 실시간(폴링)으로 조회한다. */
export default function MyPage() {
  const [seat, setSeat] = useState<OwnSeatDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [seatRes, notificationsRes] = await Promise.all([
      fetch("/api/me/seat"),
      fetch("/api/notifications"),
    ]);
    if (seatRes.ok) {
      const data: { seat: OwnSeatDetail | null } = await seatRes.json();
      setSeat(data.seat);
    }
    if (notificationsRes.ok) setNotifications(await notificationsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // 최초 로드 + 주기적 재조회 — 외출 잔여시간의 초 단위 표시는 AwayCountdown이 자체적으로
    // 째깍이고, 여기서는 자동반납/체크아웃 등 서버 상태 변화를 따라잡기 위해 폴링한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    const interval = setInterval(reload, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [reload]);

  if (loading) return <p className="text-sm text-neutral-500">불러오는 중…</p>;

  return (
    <div className="space-y-8">
      <ProfileBadges />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">My Page</p>
            <h1 className="mb-3 text-2xl font-bold text-foreground">내 좌석</h1>
            <MySeatCard
              seat={seat}
              onCheckout={async () => {
                if (!seat?.seatSessionId) return;
                await fetch(`/api/seat-sessions/${seat.seatSessionId}/checkout`, { method: "POST" });
                await reload();
              }}
              onReturnFromAway={async () => {
                if (!seat?.activeAway?.id) return;
                await fetch(`/api/away-periods/${seat.activeAway.id}/return`, { method: "POST" });
                await reload();
              }}
              onReturnFromReport={async () => {
                if (!seat?.seatSessionId) return;
                await fetch(`/api/seat-sessions/${seat.seatSessionId}/return-from-report`, {
                  method: "POST",
                });
                await reload();
              }}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">알림</h2>
            <div className="rounded-2xl border border-border-subtle bg-white p-2 shadow-[var(--shadow-card)] sm:p-4">
              <NotificationList notifications={notifications} />
            </div>
          </div>
        </div>

        {/* 통계는 화면 오른쪽에 — 진행 중인 외출이 있으면 작은 실시간 도넛을 그 옆에 같이 띄운다 */}
        <div className="w-full lg:w-72 lg:shrink-0">
          <AwayStatsPanel activeAway={seat?.activeAway ?? null} />
        </div>
      </div>
    </div>
  );
}
