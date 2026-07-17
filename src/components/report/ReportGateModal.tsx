"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const POLL_INTERVAL_MS = 4000;

/**
 * 신고당한 사람이 로그인 상태로 앱을 쓰는 동안 어디에 있든 뜨는 강제 팝업.
 * /api/me/active-report를 주기적으로 폴링해 활성 신고를 감지하면 "자리 복귀를 인증하세요!"
 * 팝업을 띄운다. 닫기(✕) 버튼 없이 "자리 복귀"/"체크아웃" 중 하나로만 닫힌다.
 * 두 액션 모두 완료 즉시 좌석 맵 화면으로 이동한다.
 */
export function ReportGateModal() {
  const router = useRouter();
  const [seatSessionId, setSeatSessionId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dismissedSessionId = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const res = await fetch("/api/me/active-report");
      if (!res.ok || cancelled) return;
      const data: { activeReport: { reportId: number; seatSessionId: number } | null } = await res.json();

      if (!data.activeReport) {
        dismissedSessionId.current = null;
        setSeatSessionId(null);
        return;
      }

      // 방금 이 세션을 직접 처리해 닫은 직후라면(비동기 반영 지연 등) 다시 띄우지 않는다.
      if (data.activeReport.seatSessionId === dismissedSessionId.current) return;

      setSeatSessionId(data.activeReport.seatSessionId);
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (seatSessionId === null) return null;

  const handleReturn = async () => {
    setSubmitting(true);
    await fetch(`/api/seat-sessions/${seatSessionId}/return-from-report`, { method: "POST" });
    dismissedSessionId.current = seatSessionId;
    setSeatSessionId(null);
    setSubmitting(false);
    router.push("/map");
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    await fetch(`/api/seat-sessions/${seatSessionId}/checkout`, { method: "POST" });
    dismissedSessionId.current = seatSessionId;
    setSeatSessionId(null);
    setSubmitting(false);
    router.push("/map");
  };

  return (
    <Modal open onClose={() => {}} title="신고 접수" dismissible={false}>
      <div className="space-y-4">
        <p className="text-sm font-semibold text-neutral-800">자리 복귀를 인증하세요!</p>
        <p className="text-sm text-neutral-600">
          누군가 지금 좌석의 장시간 부재를 신고했습니다. 자리로 돌아왔다면 &ldquo;자리 복귀&rdquo;를,
          이미 자리를 떠난 상태라면 &ldquo;체크아웃&rdquo;을 선택해주세요.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCheckout} disabled={submitting}>
            체크아웃
          </Button>
          <Button onClick={handleReturn} disabled={submitting}>
            자리 복귀
          </Button>
        </div>
      </div>
    </Modal>
  );
}
