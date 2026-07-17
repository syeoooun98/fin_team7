"use client";

import type { ReactNode } from "react";

/** design.md 4.5~4.6: 자리비움/신고 모달, 좌석 상세 바텀시트가 공통으로 쓰는 오버레이 껍데기 */
export function Modal({
  open,
  onClose,
  title,
  children,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** false면 닫기(✕) 버튼을 숨긴다 — 반드시 버튼 액션으로만 닫혀야 하는 강제 팝업(예: 신고 확인 인증)용 */
  dismissible?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          {dismissible && (
            <button
              onClick={onClose}
              aria-label="닫기"
              className="text-neutral-400 hover:text-neutral-700"
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
