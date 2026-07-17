"use client";

import { Html } from "@react-three/drei";
import type { FacilityIconBlock, FacilityIconType } from "@/lib/floor-plans";
import { FLOOR_THICKNESS, computeFacilityPosition } from "./floor-geometry";

const FACILITY_META: Record<FacilityIconType, { color: string; label: string }> = {
  MALE_WC: { color: "#3E63C8", label: "남자 화장실" },
  FEMALE_WC: { color: "#E0568F", label: "여자 화장실" },
  ELEVATOR: { color: "#6F9A4C", label: "엘리베이터" },
  STAIRS: { color: "#2A8FD6", label: "비상구 계단" },
};

/** 원본 도면 범례의 픽토그램 느낌을 살린 저폴리곤 SVG 아이콘(텍스트 라벨 없음). */
function FacilityGlyph({ type, size }: { type: FacilityIconType; size: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24" } as const;

  switch (type) {
    case "MALE_WC":
      return (
        <svg {...common} fill="#fff" aria-hidden>
          <circle cx="12" cy="6" r="2.6" />
          <path d="M8.4 10.2c0-1.3 1.6-2 3.6-2s3.6 0.7 3.6 2v5.1h-1.9V22h-3.4v-6.7H8.4z" />
        </svg>
      );
    case "FEMALE_WC":
      return (
        <svg {...common} fill="#fff" aria-hidden>
          <circle cx="12" cy="6" r="2.6" />
          <polygon points="9.2,9.2 14.8,9.2 17.1,15.3 14.3,15.3 14.3,22 9.7,22 9.7,15.3 6.9,15.3" />
        </svg>
      );
    case "ELEVATOR":
      return (
        <svg {...common} fill="none" stroke="#fff" strokeWidth="1.6" aria-hidden>
          <rect x="5" y="3" width="14" height="18" rx="2.4" />
          <path d="M12 6.6l2.3 3h-4.6z" fill="#fff" stroke="none" />
          <path d="M12 17.4l-2.3-3h4.6z" fill="#fff" stroke="none" />
        </svg>
      );
    case "STAIRS":
      return (
        <svg {...common} fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3.5 20.5h4v-4h4v-4h4v-4h4.5" />
          <circle cx="17.3" cy="4.7" r="1.7" fill="#fff" stroke="none" />
          <path d="M15.8 7.6l1.3 2.2 2.4 0.9M17.6 9.9l-0.6 3.2-2.6 1.8M16.5 13.2l1.2 2.9" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * 화장실/엘리베이터/비상구계단 시설 아이콘 핀.
 * 좌석 구역이 아니므로(FLOOR_PLANS 블록이 아님) 클릭해도 어디로도 이동하지 않고,
 * 이름 텍스트 라벨도 좌석 수 배지도 없이 픽토그램만 작은 반투명 유리 배지 안에 보여준다.
 */
export function FacilityPin({ facility }: { facility: FacilityIconBlock }) {
  const { x, z } = computeFacilityPosition(facility.left, facility.top);
  const meta = FACILITY_META[facility.type];
  const size = 24;

  return (
    <Html position={[x, FLOOR_THICKNESS + 0.45, z]} center zIndexRange={[4, 0]} occlude={false}>
      <div
        role="img"
        aria-label={meta.label}
        title={meta.label}
        className="flex select-none items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${meta.color}E6 0%, ${meta.color}99 100%)`,
          backdropFilter: "blur(2px) saturate(160%)",
          WebkitBackdropFilter: "blur(2px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.55)",
          boxShadow:
            "0 2px 5px rgba(15,15,25,0.25), inset -2px -2px 3px rgba(0,0,0,0.12), inset 2px 2px 3px rgba(255,255,255,0.5)",
        }}
      >
        <FacilityGlyph type={facility.type} size={size * 0.62} />
      </div>
    </Html>
  );
}
