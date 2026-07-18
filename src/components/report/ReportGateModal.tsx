"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PhotoCaptureView } from "@/components/report/PhotoCaptureView";
import { SharePromptModal } from "@/components/community/SharePromptModal";

const POLL_INTERVAL_MS = 4000;

interface ActiveReport {
  reportId: number;
  seatSessionId: number;
  countdownEndsAt: string;
}

/**
 * 신고당한 사람이 로그인 상태로 앱을 쓰는 동안 어디에 있든 뜨는 강제 팝업.
 * /api/me/active-report를 주기적으로 폴링해 활성 신고를 감지하면 인증샷 미션을 띄운다.
 * 닫기(✕) 버튼 없이 "미션 완료"/"체크아웃" 중 하나로만 닫힌다. 미션 완료 후에는 공유
 * 여부를 묻는 팝업을 한 번 더 거친 뒤 좌석 맵으로 이동한다.
 */
export function ReportGateModal() {
  const router = useRouter();
  const [activeReport, setActiveReport] = useState<ActiveReport | null>(null);
  const [awaitingShareChoice, setAwaitingShareChoice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dismissedSessionId = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const res = await fetch("/api/me/active-report");
      if (!res.ok || cancelled) return;
      const data: { activeReport: ActiveReport | null } = await res.json();

      if (!data.activeReport) {
        dismissedSessionId.current = null;
        setActiveReport(null);
        return;
      }

      // 방금 이 세션을 직접 처리해 닫은 직후라면(비동기 반영 지연 등) 다시 띄우지 않는다.
      if (data.activeReport.seatSessionId === dismissedSessionId.current) return;

      setActiveReport(data.activeReport);
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!activeReport) return null;

  const finish = (seatSessionId: number) => {
    dismissedSessionId.current = seatSessionId;
    setActiveReport(null);
    setAwaitingShareChoice(false);
    router.push("/map");
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    await fetch(`/api/seat-sessions/${activeReport.seatSessionId}/checkout`, { method: "POST" });
    finish(activeReport.seatSessionId);
  };

  if (awaitingShareChoice) {
    return <SharePromptModal reportId={activeReport.reportId} onDone={() => finish(activeReport.seatSessionId)} />;
  }

  return (
    <Modal open onClose={() => {}} title="신고 접수" dismissible={false}>
      <div className="space-y-4">
        <p className="text-sm font-semibold text-neutral-800">자리 복귀를 인증하세요!</p>
        <p className="text-sm text-neutral-600">
          누군가 지금 좌석의 장시간 부재를 신고했습니다. 자리로 돌아왔다면 아래 미션으로 인증샷을 올려
          &ldquo;자리 복귀&rdquo;를, 이미 자리를 떠난 상태라면 &ldquo;체크아웃&rdquo;을 선택해주세요.
        </p>

        <PhotoCaptureView
          reportId={activeReport.reportId}
          seatSessionId={activeReport.seatSessionId}
          countdownEndsAt={activeReport.countdownEndsAt}
          onMissionComplete={() => setAwaitingShareChoice(true)}
        />

        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleCheckout} disabled={submitting}>
            체크아웃
          </Button>
        </div>
      </div>
    </Modal>
  );
}
