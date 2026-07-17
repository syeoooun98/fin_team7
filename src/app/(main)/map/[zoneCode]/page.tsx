"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SeatGrid } from "@/components/seat-grid/SeatGrid";
import { ZONE_META } from "@/lib/mock-data";
import type { AwayCategory, AwayCategoryCode, OwnSeatDetail, PublicSeatView, ZoneCode } from "@/lib/types";

/**
 * design.md 4.3 — 구역 좌석 그리드 팝업(자체 라우트로 구현).
 * 목업 대신 실제 API(/api/seats, /api/away-categories, /api/seat-sessions, /api/away-periods,
 * /api/reports)에 연결한 버전 — 기능 테스트용.
 */
export default function ZoneSeatGridPage({
  params,
}: {
  params: Promise<{ zoneCode: string }>;
}) {
  const { zoneCode } = use(params);
  const router = useRouter();
  const zone = zoneCode.toUpperCase() as ZoneCode;
  const zoneName = ZONE_META.find((z) => z.code === zone)?.name ?? zone;

  const [seats, setSeats] = useState<PublicSeatView[]>([]);
  const [categories, setCategories] = useState<AwayCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [seatsRes, categoriesRes] = await Promise.all([
      fetch(`/api/seats?zoneCode=${zone}`),
      fetch(`/api/away-categories`),
    ]);

    if (seatsRes.status === 401) {
      setError("로그인이 필요합니다. 먼저 로그인/회원가입해주세요.");
      setLoading(false);
      return;
    }

    setSeats(seatsRes.ok ? await seatsRes.json() : []);
    setCategories(categoriesRes.ok ? await categoriesRes.json() : []);
    setError(null);
    setLoading(false);
  }, [zone]);

  useEffect(() => {
    // 마운트/구역 변경 시 1회성 데이터 페치 — reload 내부의 setState는 외부 시스템(API) 응답을
    // React 상태에 동기화하는 표준 fetch-on-mount 패턴이라 의도적으로 lint를 비활성화한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const roomNumbers: number[] | undefined = undefined;

  const ownDetailsBySeatId: Record<number, OwnSeatDetail> = {};
  for (const seat of seats) {
    if (seat.isMine) ownDetailsBySeatId[seat.id] = seat as OwnSeatDetail;
  }

  const findSeat = (seatId: number) => seats.find((s) => s.id === seatId);

  if (loading) return <p className="text-sm text-neutral-500">불러오는 중…</p>;

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push("/map")}
        className="inline-flex items-center gap-1 text-sm font-medium text-foreground-muted transition hover:text-brand"
      >
        ← 맵으로 돌아가기
      </button>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">{zone}</p>
        <h1 className="text-2xl font-bold text-foreground">{zoneName} 좌석</h1>
      </div>

      {error && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}

      <SeatGrid
        seats={seats}
        ownDetailsBySeatId={ownDetailsBySeatId}
        awayCategories={categories}
        roomNumbers={roomNumbers}
        zoneCode={zone}
        onCheckout={async (seatId) => {
          const seat = findSeat(seatId);
          if (!seat?.seatSessionId) return;
          await fetch(`/api/seat-sessions/${seat.seatSessionId}/checkout`, { method: "POST" });
          await reload();
        }}
        onRequestAway={async (seatId, categoryCode: AwayCategoryCode) => {
          const seat = findSeat(seatId);
          if (!seat?.seatSessionId) return;
          await fetch(`/api/away-periods`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seatSessionId: seat.seatSessionId, categoryCode }),
          });
          await reload();
        }}
        onReturnFromAway={async (seatId) => {
          const seat = findSeat(seatId) as OwnSeatDetail | undefined;
          if (!seat?.activeAway?.id) return;
          await fetch(`/api/away-periods/${seat.activeAway.id}/return`, { method: "POST" });
          await reload();
        }}
        onTestCheckIn={async (seatCode) => {
          await fetch(`/api/seat-sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seatCode }),
          });
          await reload();
        }}
        onReport={async (seatId) => {
          const seat = findSeat(seatId);
          if (!seat?.seatSessionId) {
            return { accepted: false, message: "신고할 수 없는 좌석입니다." };
          }
          const res = await fetch(`/api/reports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seatSessionId: seat.seatSessionId }),
          });
          const data = await res.json();
          await reload();
          return data as { accepted: boolean; message: string };
        }}
      />
    </div>
  );
}
