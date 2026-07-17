"use client";

import { Modal } from "@/components/ui/Modal";
import type { AwayCategory } from "@/lib/types";

/**
 * design.md 4.5 — 자리비움 카테고리 선택 모달.
 * 쿨다운 중이면(F8) 카드 전체를 비활성화하고 상단 배너로 잔여 쿨다운을 안내한다
 * (개별 카드가 아니라 전체 배너인 이유: "왜 아무것도 안 눌리지" 혼란 방지, design.md 4.5).
 */
export function AwayRequestModal({
  open,
  onClose,
  categories,
  cooldownRemainingSeconds,
  onSelectCategory,
}: {
  open: boolean;
  onClose: () => void;
  categories: AwayCategory[];
  cooldownRemainingSeconds: number;
  onSelectCategory: (categoryCode: AwayCategory["code"]) => void;
}) {
  const isCoolingDown = cooldownRemainingSeconds > 0;
  const cooldownMinutes = Math.ceil(cooldownRemainingSeconds / 60);

  return (
    <Modal open={open} onClose={onClose} title="자리 비움">
      {isCoolingDown && (
        <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          자리 비움은 이전 이용 종료 후 30분이 지나야 재신청할 수 있습니다 ({cooldownMinutes}분
          남음)
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {categories
          .filter((c) => c.active)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => (
            <button
              key={category.code}
              disabled={isCoolingDown}
              onClick={() => onSelectCategory(category.code)}
              className="rounded-lg border border-neutral-200 p-3 text-left text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <p className="font-medium">{category.label}</p>
              <p className="text-xs text-neutral-500">{category.limitMinutes}분</p>
            </button>
          ))}
      </div>
    </Modal>
  );
}
