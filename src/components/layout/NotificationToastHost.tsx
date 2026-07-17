"use client";

import { useEffect, useRef, useState } from "react";
import { Toast, type ToastPayload } from "@/components/ui/Toast";

const POLL_INTERVAL_MS = 4000;
const TOAST_DURATION_MS = 3000;

interface NotificationRow {
  id: number;
  message: string;
}

/**
 * design.md 5절 토스트 채널. /api/notifications를 주기적으로 폴링해 새로 생긴 알림을
 * 화면 상단에 3초짜리 토스트로 띄운다. 실시간 동기화 기술(폴링/웹소켓/SSE)은 PRD 13절 기준
 * 여전히 미확정이라, 우선 폴링으로 구현한 잠정치다.
 */
export function NotificationToastHost() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const seenIds = useRef<Set<number>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const res = await fetch("/api/notifications");
      if (!res.ok || cancelled) return;
      const notifications: NotificationRow[] = await res.json();

      if (!initialized.current) {
        // 최초 로드 시 기존 알림을 전부 "이미 본 것"으로 표시 — 처음 열자마자 과거 알림이
        // 한꺼번에 토스트로 쏟아지는 것을 방지한다.
        notifications.forEach((n) => seenIds.current.add(n.id));
        initialized.current = true;
        return;
      }

      const fresh = notifications.filter((n) => !seenIds.current.has(n.id));
      if (fresh.length === 0) return;
      fresh.forEach((n) => seenIds.current.add(n.id));

      setToasts((prev) => [...prev, ...fresh.map((n) => ({ id: String(n.id), message: n.message }))]);
      fresh.forEach((n) => {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== String(n.id)));
        }, TOAST_DURATION_MS);
      });
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

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
