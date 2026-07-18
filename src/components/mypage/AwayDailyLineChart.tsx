"use client";

import { useState } from "react";
import type { AwayDailyPoint } from "@/lib/types";

const WIDTH = 280;
const HEIGHT = 130;
const MARGIN = { top: 20, right: 40, bottom: 24, left: 8 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const LINE_COLOR = "#2a78d6"; // dataviz 스킬 categorical 슬롯1(blue) — 단일 시리즈 트렌드 기본색
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatMinutes(totalMinutes: number) {
  if (totalMinutes < 60) return `${totalMinutes}분`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

function formatDateLabel(dateKey: string) {
  const [, m, d] = dateKey.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/**
 * design.md 4.7 — 일별 자리비움 시간 선그래프(최근 7일 고정).
 * dataviz 스킬: trend-over-time = line, 단일 시리즈라 색 하나 + area wash, legend 불필요(제목이 대신함).
 * 끝점에 직접 라벨, 호버/포커스 시 세로 크로스헤어 + 툴팁(값은 어차피 항상 라벨/이 컴포넌트 밖에서도
 * 도넛·범례로 확인 가능하므로 툴팁은 보조 수단).
 */
export function AwayDailyLineChart({ days }: { days: AwayDailyPoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = Math.max(1, ...days.map((d) => d.totalMinutes));
  const domainMax = maxValue * 1.15;

  const xFor = (i: number) => MARGIN.left + (days.length > 1 ? (i / (days.length - 1)) * PLOT_WIDTH : PLOT_WIDTH / 2);
  const yFor = (value: number) => MARGIN.top + PLOT_HEIGHT - (value / domainMax) * PLOT_HEIGHT;
  const baselineY = MARGIN.top + PLOT_HEIGHT;

  const linePath = days.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d.totalMinutes)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(days.length - 1)} ${baselineY} L ${xFor(0)} ${baselineY} Z`;

  const lastPoint = days[days.length - 1];
  const hovered = hoveredIndex !== null ? days[hoveredIndex] : null;
  const bandWidth = days.length > 0 ? PLOT_WIDTH / days.length : PLOT_WIDTH;

  return (
    <div className="relative">
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="overflow-visible">
        {/* 기준선(0) — recessive hairline, 대시 없음 */}
        <line x1={MARGIN.left} y1={baselineY} x2={WIDTH - MARGIN.right} y2={baselineY} stroke="#e5e7eb" strokeWidth={1} />

        <path d={areaPath} fill={LINE_COLOR} fillOpacity={0.1} stroke="none" />
        <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* 크로스헤어 — 호버/포커스 중인 날짜 위치 */}
        {hoveredIndex !== null && (
          <line
            x1={xFor(hoveredIndex)}
            y1={MARGIN.top}
            x2={xFor(hoveredIndex)}
            y2={baselineY}
            stroke="#c3c2b7"
            strokeWidth={1}
          />
        )}

        {days.map((d, i) => {
          const isLast = i === days.length - 1;
          const isHovered = hoveredIndex === i;
          return (
            <g key={d.date}>
              {(isLast || isHovered) && (
                <circle cx={xFor(i)} cy={yFor(d.totalMinutes)} r={4} fill={LINE_COLOR} stroke="#fff" strokeWidth={2} />
              )}
              {/* 요일 라벨 */}
              <text x={xFor(i)} y={HEIGHT - 6} textAnchor="middle" fontSize={10} fill="#898781">
                {WEEKDAY_LABELS[new Date(d.date).getDay()]}
              </text>
              {/* 호버 히트 영역 — 마크보다 넉넉하게, 키보드 포커스도 동일하게 반응 */}
              <rect
                x={xFor(i) - bandWidth / 2}
                y={0}
                width={bandWidth}
                height={HEIGHT}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${formatDateLabel(d.date)} ${formatMinutes(d.totalMinutes)}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(i)}
                onBlur={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}

        {/* 끝점 직접 라벨 — 텍스트는 시리즈 색이 아니라 잉크 톤으로(마크가 색을 담당) */}
        <text
          x={xFor(days.length - 1) + 6}
          y={yFor(lastPoint.totalMinutes) + 4}
          fontSize={11}
          fontWeight={600}
          fill="#0b0b0b"
        >
          {formatMinutes(lastPoint.totalMinutes)}
        </text>
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs shadow-sm"
          style={{ left: xFor(hoveredIndex!) }}
        >
          <span className="font-semibold text-neutral-900">{formatMinutes(hovered.totalMinutes)}</span>
          <span className="ml-1 text-neutral-500">{formatDateLabel(hovered.date)}</span>
        </div>
      )}
    </div>
  );
}
