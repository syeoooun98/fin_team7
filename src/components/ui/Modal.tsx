"use client";

import type { ReactNode } from "react";

/** design.md 4.5~4.6: 자리비움/신고 모달, 좌석 상세 바텀시트가 공통으로 쓰는 오버레이 껍데기 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl border border-border-subtle bg-white p-5 shadow-[0_24px_48px_-20px_rgba(43,45,90,0.32)] sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-subtle transition hover:bg-surface-soft hover:text-foreground"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
