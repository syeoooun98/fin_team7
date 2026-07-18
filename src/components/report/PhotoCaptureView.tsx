"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRemainingSecondsUntil } from "@/lib/useRemainingSeconds";

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * 신고당한 좌석의 "자리 복귀" 미션 — getUserMedia로 앱 안에서 카메라를 직접 띄워 그 자리에서
 * 촬영한 프레임만 인증샷으로 쓸 수 있게 한다(파일 입력을 쓰지 않으므로 갤러리의 기존 사진을
 * 업로드할 방법이 없다). 셔터음은 일부러 그대로 둔다(무음 촬영은 몰카 방지 규제·관행과 충돌해
 * 의도적으로 구현하지 않음).
 */
export function PhotoCaptureView({
  reportId,
  seatSessionId,
  countdownEndsAt,
  missionLabel,
  onMissionComplete,
}: {
  reportId: number;
  seatSessionId: number;
  countdownEndsAt: string;
  missionLabel: string;
  onMissionComplete: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const remainingSeconds = useRemainingSecondsUntil(new Date(countdownEndsAt).getTime());

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  useEffect(() => {
    if (previewUrl) return;

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      } catch {
        if (!cancelled) setError("카메라를 켤 수 없어요. 카메라 접근 권한을 허용해주세요.");
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [previewUrl, facingMode]);

  const handleSwitchCamera = () => {
    setError(null);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const setPhoto = (blob: Blob) => {
    const captured = new File([blob], "verification.jpg", { type: "image/jpeg" });
    setFile(captured);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();
    canvas.toBlob((blob) => {
      if (blob) setPhoto(blob);
    }, "image/jpeg", 0.92);
  };

  const handleRetake = () => {
    setError(null);
    setFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
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
      const { photoPath, passed, reason } = (await uploadRes.json()) as {
        photoPath: string;
        passed: boolean;
        reason: string;
      };
      if (!passed) {
        throw new Error(reason || "미션에 맞는 사진이 아니에요. 다시 찍어주세요.");
      }

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
        <p className="text-sm font-semibold text-amber-900">미션: {missionLabel}</p>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-bold text-amber-900 shadow-sm">
          {formatSeconds(remainingSeconds)}
        </span>
      </div>

      {!previewUrl && (
        <div className="space-y-3">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-xl border border-border-subtle bg-black object-cover"
            />
            <button
              type="button"
              onClick={handleSwitchCamera}
              disabled={submitting}
              aria-label="전면/후면 카메라 전환"
              className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-lg text-white"
            >
              🔄
            </button>
          </div>
          <Button className="w-full py-3 text-base" onClick={handleCapture} disabled={submitting || !cameraReady}>
            📸 사진 찍기
          </Button>
        </div>
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
