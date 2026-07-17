"use client";

import { MySeatCard } from "@/components/mypage/MySeatCard";
import { NotificationList } from "@/components/mypage/NotificationList";
import { MOCK_MY_SEAT, MOCK_NOTIFICATIONS } from "@/lib/mock-data";

/** design.md 4.7 — 마이페이지(Should, F18). TODO: 목업 대신 로그인 세션 기준 실시간 조회로 교체 */
export default function MyPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">My Page</p>
        <h1 className="text-2xl font-bold text-foreground">내 좌석</h1>
      </div>

      <div>
        <MySeatCard
          seat={MOCK_MY_SEAT}
          onCheckout={() => console.log("checkout")}
          onReturnFromAway={() => console.log("return from away")}
          onReturnFromReport={() => console.log("return from report (F11)")}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">알림</h2>
        <div className="rounded-2xl border border-border-subtle bg-white p-2 shadow-[var(--shadow-card)] sm:p-4">
          <NotificationList notifications={MOCK_NOTIFICATIONS} />
        </div>
      </div>
    </div>
  );
}
