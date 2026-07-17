"use client";

import { MySeatCard } from "@/components/mypage/MySeatCard";
import { NotificationList } from "@/components/mypage/NotificationList";
import { MOCK_MY_SEAT, MOCK_NOTIFICATIONS } from "@/lib/mock-data";

/** design.md 4.7 — 마이페이지(Should, F18). TODO: 목업 대신 로그인 세션 기준 실시간 조회로 교체 */
export default function MyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-xl font-bold">내 좌석</h1>
        <MySeatCard
          seat={MOCK_MY_SEAT}
          onCheckout={() => console.log("checkout")}
          onReturnFromAway={() => console.log("return from away")}
          onReturnFromReport={() => console.log("return from report (F11)")}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">알림</h2>
        <NotificationList notifications={MOCK_NOTIFICATIONS} />
      </div>
    </div>
  );
}
