"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRemainingSecondsUntil } from "@/lib/useRemainingSeconds";

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * 신고당한 좌석의 "자리 복귀" 미션 — 셔터음은 일부러 그대로 둔다(무음 촬영은 몰카 방지
 * 규제·관행과 충돌해 의도적으로 구현하지 않음). 네이티브 카메라 앱의 촬영/재촬영 UI를
 * 그대로 쓰고, 그 위에 우리 앱만의 확인/다시 찍기 한 단계를 더해 실수 업로드를 막는다.
 */
export function PhotoCaptureView({
  reportId,
  seatSessionId,
  countdownEndsAt,
  onMissionComplete,
}: {
  reportId: number;
  seatSessionId: number;
  countdownEndsAt: string;
  onMissionComplete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingSeconds = useRemainingSecondsUntil(new Date(countdownEndsAt).getTime());

  const handleFileChange = (selected: File | null) => {
    setError(null);
    setFile(selected);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return selected ? URL.createObjectURL(selected) : null;
    });
  };

  const handleRetake = () => {
    handleFileChange(null);
    inputRef.current?.click();
  };

  const handleConfirm = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const uploadForm = new FormData();
      uploadForm.set("reportId", String(reportId));
      uploadForm.set("photo", file);
      const uploadRes = await fetch("/api/verification-photos", { method: "POST", body: uploadForm });
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => null);
        throw new Error(data?.message ?? "인증샷 업로드에 실패했어요.");
      }
      const { photoPath } = (await uploadRes.json()) as { photoPath: string };

      const returnRes = await fetch(`/api/seat-sessions/${seatSessionId}/return-from-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoPath }),
      });
      if (!returnRes.ok) {
        const data = await returnRes.json().catch(() => null);
        throw new Error(data?.message ?? "자리 복귀 처리에 실패했어요.");
      }

      onMissionComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-warn-amber/30 bg-amber-50 px-3 py-2">
        <p className="text-sm font-semibold text-amber-900">미션: 자리에 앉아서 책과 함께 인증샷 찍기</p>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-bold text-amber-900 shadow-sm">
          {formatSeconds(remainingSeconds)}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />

      {!previewUrl && (
        <Button className="w-full py-3 text-base" onClick={() => inputRef.current?.click()} disabled={submitting}>
          📸 사진 찍기
        </Button>
      )}

      {previewUrl && (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- 업로드 전 로컬 미리보기(object URL)라 next/image 최적화 대상이 아님 */}
          <img src={previewUrl} alt="인증샷 미리보기" className="w-full rounded-xl border border-border-subtle object-cover" />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleRetake} disabled={submitting}>
              다시 찍기
            </Button>
            <Button className="flex-1" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "업로드 중…" : "확인"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger-muted">{error}</p>}
    </div>
  );
}
