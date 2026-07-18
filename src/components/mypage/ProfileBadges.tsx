"use client";

import { useEffect, useState } from "react";
import type { BadgeCode, BadgeStatus } from "@/lib/types";

/**
 * design.md 4.7 — 마이페이지 프로필 배지/칭호. 4종 전부를 항상 보여주되(획득 못 한 건 흐리게),
 * 불명예 칭호(바람과 함께 사라지다)도 겁주는 톤이 아니라 귀여운 이모지로 가볍게 표시한다.
 * 획득한 배지 중 하나를 눌러 "장착"하면 좌석 이용 중일 때 다른 이용자에게도 보인다
 * (아이콘+제목만 노출, 학번/이름 등 신원 정보는 절대 포함하지 않음 — F14).
 */
export function ProfileBadges() {
  const [badges, setBadges] = useState<BadgeStatus[] | null>(null);
  const [equippedCode, setEquippedCode] = useState<BadgeCode | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/me/badges");
      if (res.ok) {
        const data: { badges: BadgeStatus[]; equippedBadgeCode: BadgeCode | null } = await res.json();
        setBadges(data.badges);
        setEquippedCode(data.equippedBadgeCode);
      }
    }
    load();
  }, []);

  if (!badges) return null;

  const earnedCount = badges.filter((b) => b.earned).length;

  const handleClick = async (badge: BadgeStatus) => {
    if (!badge.earned || pending) return;
    const next = equippedCode === badge.code ? null : badge.code;
    setPending(true);
    setEquippedCode(next); // 낙관적 업데이트
    const res = await fetch("/api/me/badges/equip", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badgeCode: next }),
    });
    if (!res.ok) setEquippedCode(equippedCode); // 실패 시 원복
    setPending(false);
  };

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">내 칭호</h2>
        <span className="text-xs text-neutral-400">
          {earnedCount}/{badges.length} 획득
        </span>
      </div>
      <p className="mb-3 text-xs text-neutral-400">
        획득한 배지를 눌러 장착하면 좌석 이용 중일 때 다른 이용자에게도 보여요.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {badges.map((badge) => {
          const isEquipped = equippedCode === badge.code;
          return (
            <button
              key={badge.code}
              type="button"
              disabled={!badge.earned}
              onClick={() => handleClick(badge)}
              className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition ${
                badge.earned
                  ? badge.dishonor
                    ? "border-amber-200 bg-amber-50 hover:opacity-90"
                    : "border-neutral-200 bg-white hover:opacity-90"
                  : "cursor-not-allowed border-neutral-100 bg-neutral-50 opacity-40 grayscale"
              } ${isEquipped ? "ring-2 ring-self-ring" : ""}`}
              title={badge.description}
            >
              {isEquipped && (
                <span className="absolute -top-2 -right-2 rounded-full bg-self-ring px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  장착중
                </span>
              )}
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs font-semibold text-neutral-800">{badge.title}</span>
              {badge.dishonor && badge.earned && (
                <span className="text-[10px] text-amber-600">(불명예 칭호)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
