// 자리지킴이 — 초기 시드 데이터
// zones 값은 실제 Supabase DB(nigefilyramspwrmobyb) 기준(PRD 6.2, 2026-07-17 갱신).
// away_categories는 DB.md 2.4절 INSERT문 그대로.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 2026-07-17 실제 2~5층 방 이름 기준(1차) → 2026-07-17(2차) 더 상세한 2F~5F.png 반영해 24개 구역으로 확장.
// 좌석 수는 전부 0(TBD) — 실측 전까지 임의로 채우지 않는다. 확정되면 seatCount만 갱신하면
// buildSeatsForZone이 그만큼 좌석을 생성한다.
const ZONES = [
  { code: "F2F1", name: "제1자유열람실", floor: 2, colorRef: "coral", description: null, seatCount: 0 },
  { code: "F2SQ", name: "메인스퀘어", floor: 2, colorRef: "teal", description: null, seatCount: 0 },
  { code: "F2LB", name: "메인로비", floor: 2, colorRef: "slate", description: null, seatCount: 0 },
  { code: "F2CF", name: "컨퍼런스룸", floor: 2, colorRef: "indigo", description: null, seatCount: 0 },
  { code: "F2MD", name: "미디어실", floor: 2, colorRef: "cyan", description: null, seatCount: 0 },
  { code: "F2LK", name: "락커룸", floor: 2, colorRef: "amber", description: null, seatCount: 0 },
  { code: "F2RS", name: "휴게실", floor: 2, colorRef: "lime", description: null, seatCount: 0 },
  { code: "F2CE", name: "카페", floor: 2, colorRef: "brown", description: null, seatCount: 0 },
  { code: "F3R1", name: "제1자료실", floor: 3, colorRef: "blue", description: null, seatCount: 0 },
  { code: "F3R2", name: "제2자료실", floor: 3, colorRef: "navy", description: null, seatCount: 0 },
  { code: "F3AR", name: "수서/정리실", floor: 3, colorRef: "sky", description: null, seatCount: 0 },
  { code: "F3RC", name: "학술정보운영팀(리서치커먼스)", floor: 3, colorRef: "violet", description: null, seatCount: 0 },
  { code: "F3DR", name: "도서관장실", floor: 3, colorRef: "rose", description: null, seatCount: 0 },
  { code: "F3LN", name: "대출실", floor: 3, colorRef: "emerald", description: null, seatCount: 0 },
  { code: "F3MT", name: "회의실", floor: 3, colorRef: "fuchsia", description: null, seatCount: 0 },
  { code: "F3SC", name: "악보서가", floor: 3, colorRef: "orange", description: null, seatCount: 0 },
  { code: "F4F2", name: "제2자유열람실", floor: 4, colorRef: "green", description: null, seatCount: 0 },
  { code: "F4GR", name: "대학원 열람실", floor: 4, colorRef: "purple", description: null, seatCount: 0 },
  { code: "F4CR", name: "1인 연구 캐럴", floor: 4, colorRef: "yellow", description: null, seatCount: 0 },
  { code: "F4FT", name: "미래인재양성센터", floor: 4, colorRef: "pink", description: null, seatCount: 0 },
  { code: "F4SM", name: "대학원세미나실", floor: 4, colorRef: "teal", description: null, seatCount: 0 },
  { code: "F4RS", name: "휴게실", floor: 4, colorRef: "lime", description: null, seatCount: 0 },
  { code: "F5ED", name: "학술정보이용교육실", floor: 5, colorRef: "indigo", description: null, seatCount: 0 },
  { code: "F5EX", name: "고시반", floor: 5, colorRef: "rose", description: null, seatCount: 0 },
] as const;

const AWAY_CATEGORIES = [
  { code: "TOILET", label: "화장실", limitMinutes: 10, sortOrder: 1 },
  { code: "CAFE", label: "카페", limitMinutes: 20, sortOrder: 2 },
  { code: "CONVENIENCE", label: "편의점", limitMinutes: 20, sortOrder: 3 },
  { code: "MEAL", label: "식사", limitMinutes: 60, sortOrder: 4 },
  { code: "MEETING", label: "회의", limitMinutes: 90, sortOrder: 5 },
] as const;

function padSeatNumber(n: number) {
  return String(n).padStart(3, "0");
}

/**
 * 현재 어떤 구역도 room_number 기반 그룹핑(구 GS 방식)이 필요하지 않다 — 향후 방 단위
 * 구조를 가진 구역이 추가되면 그 코드만 분기해서 room_number를 채우면 된다.
 */
function buildSeatsForZone(zoneCode: (typeof ZONES)[number]["code"], seatCount: number) {
  return Array.from({ length: seatCount }, (_, i) => ({
    seatCode: `${zoneCode}-${padSeatNumber(i + 1)}`,
    zoneCode,
    roomNumber: null as number | null,
    hasOutlet: false,
  }));
}

async function main() {
  // 구역 체계가 통째로 바뀌었으므로(과거 CZ/QA/QB/LZ/OH/GS) 남은 좌석/구역을 먼저 비운다.
  await prisma.seat.deleteMany();
  await prisma.zone.deleteMany();

  for (const zone of ZONES) {
    await prisma.zone.upsert({
      where: { code: zone.code },
      update: zone,
      create: zone,
    });
  }

  for (const category of AWAY_CATEGORIES) {
    await prisma.awayCategory.upsert({
      where: { code: category.code },
      update: category,
      create: category,
    });
  }

  for (const zone of ZONES) {
    const seats = buildSeatsForZone(zone.code, zone.seatCount);
    for (const seat of seats) {
      await prisma.seat.upsert({
        where: { seatCode: seat.seatCode },
        update: {},
        create: seat,
      });
    }
  }

  const seatTotal = await prisma.seat.count();
  console.log(`시드 완료: 구역 ${ZONES.length}개, 좌석 ${seatTotal}석 (좌석 수 TBD — 실측 후 ZONES.seatCount 갱신 필요)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
