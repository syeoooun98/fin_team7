import { SEAT_STATUS_STYLE } from "@/lib/constants";
import { MOCKUP2_COLORS, type SeatColorScheme } from "./SeatChip";

const NAV_ITEMS = ["대시보드", "좌석 맵", "마이페이지"];

/**
 * mockup.png(팀 전체 디자인) 톤 재현: 보라 그라데이션 로고 + 필 형태 탭 상단바,
 * 보라 킥커 라벨 + 큰 제목 헤더, 좌석 상태 범례.
 * 범례는 scheme="mockup2"(기본, mockup2.png 블루/그레이 필 배지) 또는 "design"(민트/그레이, 2Fmain 전용).
 * 이 화면은 앱의 다른 라우트와 연결되지 않은 독립 목업이므로 상단 탭은 시각적 재현일 뿐 링크가 아니다.
 */
export function FloorHeader({
  title,
  floorLabel,
  scheme = "mockup2",
  showAway = false,
}: {
  title: string;
  floorLabel: string;
  scheme?: SeatColorScheme;
  showAway?: boolean;
}) {
  return (
    <div className="border-b border-gray-100 bg-gradient-to-b from-[#F4F2FF] to-white">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4C8DFF] text-sm font-bold text-white">
            자
          </span>
          <span className="text-lg font-bold text-gray-900">자리지킴이</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                item === "좌석 맵"
                  ? "bg-white text-[#7C3AED] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between px-8 pb-6 pt-2">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#7C3AED]">SEAT MAP</p>
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{floorLabel}</p>
        </div>
        {scheme === "design" ? (
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: SEAT_STATUS_STYLE.AVAILABLE.bg, border: `2px solid ${SEAT_STATUS_STYLE.AVAILABLE.border}` }}
              />
              사용가능
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: SEAT_STATUS_STYLE.OCCUPIED.bg, border: `2px solid ${SEAT_STATUS_STYLE.OCCUPIED.border}` }}
              />
              사용중
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className="rounded-full border px-3 py-1"
              style={{
                backgroundColor: MOCKUP2_COLORS.AVAILABLE.bg,
                borderColor: MOCKUP2_COLORS.AVAILABLE.border,
                color: MOCKUP2_COLORS.AVAILABLE.text,
              }}
            >
              예약 가능
            </span>
            <span
              className="rounded-full border px-3 py-1"
              style={{
                backgroundColor: MOCKUP2_COLORS.OCCUPIED.bg,
                borderColor: MOCKUP2_COLORS.OCCUPIED.border,
                color: MOCKUP2_COLORS.OCCUPIED.text,
              }}
            >
              이용중
            </span>
            {showAway && (
              <span
                className="flex items-center gap-1 rounded-full border px-3 py-1"
                style={{
                  backgroundColor: MOCKUP2_COLORS.AWAY.bg,
                  borderColor: MOCKUP2_COLORS.AWAY.border,
                  color: MOCKUP2_COLORS.AWAY.text,
                }}
              >
                <span className="text-[10px] leading-none">🚶</span>
                이용중(외출중)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
