"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const SUCCESS_DISPLAY_MS = 2000;

interface ReportConfirmModalProps {
  open: boolean;
  onClose: () => void;
  /** 실제 신고 접수 API 호출. 서버가 F13(중복 신고)이면 accepted:false로 응답한다. */
  onSubmit: () => Promise<{ accepted: boolean; message: string }>;
}

/**
 * design.md 4.6 — 신고 확인 모달.
 * 중복 신고 거부(F13) 같은 동기적 피드백은 토스트가 아니라 이 모달 안에 바로 표시한다(design.md 5절).
 * 신고 접수 성공 시에는 "신고가 완료되었습니다." 안내를 2초간 보여준 뒤 자동으로 닫는다.
 */
export function ReportConfirmModal({ open, onClose, onSubmit }: ReportConfirmModalProps) {
  const [rejection, setRejection] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setRejection(null);
    setSubmitted(false);
    onClose();
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    const result = await onSubmit();
    setSubmitting(false);
    if (result.accepted) {
      setSubmitted(true);
    } else {
      setRejection(result.message);
    }
  };

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(handleClose, SUCCESS_DISPLAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  return (
    <Modal open={open} onClose={handleClose} title="좌석 신고">
      {submitted ? (
        <p className="rounded-lg bg-neutral-100 p-3 text-center text-sm text-neutral-700">
          신고가 완료되었습니다.
        </p>
      ) : rejection ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-surface-soft p-3 text-sm text-foreground">{rejection}</p>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleClose}>
              닫기
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm leading-relaxed text-foreground-muted">
            이 좌석에 대해 장시간 부재를 신고하시겠어요? 신고는 익명으로 처리되며, 상대방에게는
            신고자 정보가 전달되지 않습니다.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              취소
            </Button>
            <Button variant="danger" onClick={handleConfirm} disabled={submitting}>
              신고하기
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
