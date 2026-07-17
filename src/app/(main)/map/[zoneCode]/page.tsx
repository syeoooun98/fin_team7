"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SeatGrid } from "@/components/seat-grid/SeatGrid";
import { MOCK_AWAY_CATEGORIES, MOCK_MY_SEAT, buildMockSeatsForZone } from "@/lib/mock-data";
import type { ZoneCode } from "@/lib/types";

/**
 * design.md 4.3 — 구역 좌석 그리드 팝업(자체 라우트로 구현). GS는 룸 선택 탭이 함께 노출된다.
 * TODO: 아래 fetch 호출 대상 API 라우트(app/api/seat-sessions, /away-periods, /reports)를
 * 실제 DB 연동 후 구현하고, 목업 좌석 데이터를 실시간 조회로 교체한다.
 */
export default function ZoneSeatGridPage({
  params,
}: {
  params: Promise<{ zoneCode: string }>;
}) {
  const { zoneCode } = use(params);
  const router = useRouter();
  const zone = zoneCode.toUpperCase() as ZoneCode;

  const seats = useMemo(() => buildMockSeatsForZone(zone), [zone]);
  const roomNumbers = zone === "GS" ? Array.from({ length: 10 }, (_, i) => i + 1) : undefined;
  const ownDetailsBySeatId = { [MOCK_MY_SEAT.id]: MOCK_MY_SEAT };

  return (
    <div className="space-y-4">
      <button onClick={() => router.push("/map")} className="text-sm text-neutral-500 hover:text-neutral-800">
        ← 맵으로 돌아가기
      </button>
      <h1 className="text-xl font-bold">{zone} 좌석</h1>

      <SeatGrid
        seats={seats}
        ownDetailsBySeatId={ownDetailsBySeatId}
        awayCategories={MOCK_AWAY_CATEGORIES}
        roomNumbers={roomNumbers}
        onCheckout={(seatId) => {
          // TODO: POST /api/seat-sessions/[id]/checkout
          console.log("checkout", seatId);
        }}
        onRequestAway={(seatId, categoryCode) => {
          // TODO: POST /api/away-periods { seatId, categoryCode }
          console.log("request away", seatId, categoryCode);
        }}
        onReturnFromAway={(seatId) => {
          // TODO: POST /api/away-periods/[id]/return
          console.log("return from away", seatId);
        }}
        onReport={async (seatId) => {
          // TODO: POST /api/reports { seatId } — 서버가 F13 중복 신고면 accepted:false 응답
          console.log("report", seatId);
          return { accepted: true, message: "신고가 접수되었습니다." };
        }}
      />
    </div>
  );
}
