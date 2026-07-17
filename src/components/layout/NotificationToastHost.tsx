"use client";

import { useState } from "react";
import { Toast, type ToastPayload } from "@/components/ui/Toast";

/**
 * design.md 5절 토스트 채널의 자리표시자.
 * TODO: 실시간 갱신 방식(폴링/웹소켓/SSE, PRD 13절 미확정)이 정해지면
 * 그 소스에서 이벤트를 구독해 `setToasts`를 채우도록 교체한다.
 */
export function NotificationToastHost() {
  const [toasts] = useState<ToastPayload[]>([]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
