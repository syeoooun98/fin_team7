"use client";

import { useEffect, useRef, useState } from "react";
import { Toast, type ToastPayload } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { NotificationType } from "@/lib/types";

const POLL_INTERVAL_MS = 4000;
const TOAST_DURATION_MS = 3000;
/** 액션(F22 "바로 이용하기") 버튼이 있는 토스트는 더 오래 보여준다 — 3초는 누르기엔 너무 짧다. */
const ACTIONABLE_TOAST_DURATION_MS = 12000;

interface NotificationRow {
  id: number;
  type: NotificationType;
  message: string;
  seatCode: string | null;
}

/**
 * design.md 5절 토스트 채널. /api/notifications를 주기적으로 폴링해 새로 생긴 알림을
 * 화면 상단에 토스트로 띄운다. 실시간 동기화 기술(폴링/웹소켓/SSE)은 PRD 13절 기준
 * 여전히 미확정이라, 우선 폴링으로 구현한 잠정치다.
 *
 * F22 — SEAT_WATCH_AVAILABLE 알림은 "바로 이용하기" 액션 버튼을 달고 있고, 누르면
 * "예약하시겠습니까?" 확인 모달을 거쳐 곧바로 체크인(POST /api/seat-sessions)한다.
 */
export function NotificationToastHost() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const [confirmSeatCode, setConfirmSeatCode] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const seenIds = useRef<Set<number>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      // cache:no-store 필수 — 없으면 브라우저가 동일 URL GET을 캐싱해 4초마다 폴링해도
      // 계속 같은(오래된) 응답을 재사용해서 새 알림이 영영 "새 알림"으로 안 잡히는 버그가 있었다.
      const res = await fetch("/api/notifications", { cache: "no-store" });
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

      const freshToasts: ToastPayload[] = fresh.map((n) => {
        const isWatchAvailable = n.type === "SEAT_WATCH_AVAILABLE" && n.seatCode;
        return {
          id: String(n.id),
          message: n.message,
          action: isWatchAvailable
            ? {
                label: "바로 이용하기",
                onClick: () => {
                  setConfirmSeatCode(n.seatCode);
                  setToasts((prev) => prev.filter((t) => t.id !== String(n.id)));
                },
              }
            : undefined,
        };
      });

      setToasts((prev) => [...prev, ...freshToasts]);
      fresh.forEach((n) => {
        const duration = n.type === "SEAT_WATCH_AVAILABLE" ? ACTIONABLE_TOAST_DURATION_MS : TOAST_DURATION_MS;
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== String(n.id)));
        }, duration);
      });
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleConfirmReserve = async () => {
    if (!confirmSeatCode) return;
    setConfirming(true);
    try {
      const res = await fetch("/api/seat-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatCode: confirmSeatCode }),
      });
      const data = await res.json().catch(() => null);
      const resultMessage = res.ok
        ? `${confirmSeatCode} 좌석에 체크인했습니다.`
        : (data?.message ?? "체크인에 실패했습니다.");
      const resultId = `reserve-result-${Date.now()}`;
      setToasts((prev) => [...prev, { id: resultId, message: resultMessage, tone: res.ok ? "info" : "warning" }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== resultId));
      }, TOAST_DURATION_MS);
    } finally {
      setConfirming(false);
      setConfirmSeatCode(null);
    }
  };

  return (
    <>
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast {...toast} />
            </div>
          ))}
        </div>
      )}

      <Modal open={confirmSeatCode !== null} onClose={() => setConfirmSeatCode(null)} title="좌석 예약">
        <p className="mb-4 text-sm leading-relaxed text-foreground-muted">
          {confirmSeatCode} 좌석이 방금 비었어요. 지금 예약(체크인)하시겠습니까?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmSeatCode(null)} disabled={confirming}>
            아니오
          </Button>
          <Button onClick={handleConfirmReserve} disabled={confirming}>
            네
          </Button>
        </div>
      </Modal>
    </>
  );
}
