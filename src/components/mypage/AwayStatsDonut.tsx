"use client";

import { useState } from "react";
import { AWAY_CATEGORY_CHART_COLORS } from "@/lib/constants";
import type { AwayStatsCategory } from "@/lib/types";

const SIZE = 160;
const STROKE_WIDTH = 22;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP_PX = 4;

function formatMinutes(totalMinutes: number) {
  if (totalMinutes < 60) return `${totalMinutes}분`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/**
 * design.md 4.7 — 외출 태그별 통계 도넛(part-to-whole, 실사용 시간 기준).
 * 색은 dataviz 스킬 categorical 팔레트 5슬롯(blue/green/magenta/yellow/aqua)을
 * away_categories.sort_order 순서로 고정 배정 — 필터링돼도 카테고리별 색은 안 바뀐다.
 * 색만으로 구분하지 않도록 범례를 항상 같이 그린다(그 범례가 곧 표 형태 대안이기도 하다).
 */
export function AwayStatsDonut({ categories }: { categories: AwayStatsCategory[] }) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const total = categories.reduce((sum, c) => sum + c.totalMinutes, 0);
  const hovered = categories.find((c) => c.code === hoveredCode) ?? null;

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {total === 0 ? (
              <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth={STROKE_WIDTH} />
            ) : (
              categories
                .filter((c) => c.totalMinutes > 0)
                .map((category) => {
                  const fraction = category.totalMinutes / total;
                  const rawLength = fraction * CIRCUMFERENCE;
                  const gap = Math.min(GAP_PX, rawLength * 0.3);
                  const visibleLength = Math.max(rawLength - gap, 0);
                  const dashOffset = -(cumulative + gap / 2);
                  cumulative += rawLength;
                  const color = AWAY_CATEGORY_CHART_COLORS[category.code]?.light ?? "#9ca3af";
                  const isHovered = hoveredCode === category.code;

                  return (
                    <circle
                      key={category.code}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={RADIUS}
                      fill="none"
                      stroke={color}
                      strokeWidth={isHovered ? STROKE_WIDTH + 4 : STROKE_WIDTH}
                      strokeDasharray={`${visibleLength} ${CIRCUMFERENCE - visibleLength}`}
                      strokeDashoffset={dashOffset}
                      tabIndex={0}
                      role="img"
                      aria-label={`${category.label} ${category.count}회, ${formatMinutes(category.totalMinutes)}`}
                      style={{ cursor: "pointer", transition: "stroke-width 120ms ease" }}
                      onMouseEnter={() => setHoveredCode(category.code)}
                      onMouseLeave={() => setHoveredCode(null)}
                      onFocus={() => setHoveredCode(category.code)}
                      onBlur={() => setHoveredCode(null)}
                    />
                  );
                })
            )}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {total === 0 ? (
            <p className="text-xs text-neutral-400">기록 없음</p>
          ) : hovered ? (
            <>
              <p className="text-sm font-semibold text-neutral-900">{hovered.label}</p>
              <p className="text-xs text-neutral-500">
                {hovered.count}회 · {formatMinutes(hovered.totalMinutes)}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-neutral-900">{formatMinutes(total)}</p>
              <p className="text-xs text-neutral-500">총 외출 시간</p>
            </>
          )}
        </div>
      </div>

      {/* 범례 겸 표 형태 대안 — 접근성 원칙(색만으로 구분 금지, 항상 범례) */}
      <ul className="w-full space-y-1.5">
        {categories.map((category) => (
          <li
            key={category.code}
            className="flex items-center justify-between rounded px-1 text-xs"
            onMouseEnter={() => setHoveredCode(category.code)}
            onMouseLeave={() => setHoveredCode(null)}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: AWAY_CATEGORY_CHART_COLORS[category.code]?.light ?? "#9ca3af" }}
              />
              <span className="text-neutral-600">{category.label}</span>
            </span>
            <span className="text-neutral-500">
              {category.count}회 · {formatMinutes(category.totalMinutes)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
