// 자리지킴이 — 초기 시드 데이터
// zones/away_categories 값은 DB.md 2.2/2.4절 INSERT문, seats 생성 규칙은 PRD 6.2절 표 그대로.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ZONES = [
  { code: "CZ", name: "캐주얼 라운지 존", floor: 1, colorRef: "coral", description: "대화·통화 허용 수준, 노트북 자유, 카페 인접", seatCount: 30 },
  { code: "QA", name: "조용한 열람실 A", floor: 2, colorRef: "blue", description: "완전 정숙, 개인 열람 전용", seatCount: 60 },
  { code: "QB", name: "조용한 열람실 B", floor: 2, colorRef: "navy", description: "완전 정숙, 개인 열람 전용", seatCount: 60 },
  { code: "LZ", name: "노트북 존", floor: 2, colorRef: "yellow", description: "타이핑/노트북 허용, 좌석별 콘센트", seatCount: 40 },
  { code: "OH", name: "오픈 열람홀", floor: 3, colorRef: "teal", description: "일반 열람, 창가석 다수", seatCount: 80 },
  { code: "GS", name: "그룹 스터디룸", floor: 3, colorRef: "green", description: "방음 부스 10개 × 4인석", seatCount: 40 },
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

function buildSeatsForZone(zoneCode: (typeof ZONES)[number]["code"], seatCount: number) {
  if (zoneCode === "GS") {
    // GS-{룸번호 01~10}-{좌석 1~4} — PRD 6.2절 좌석 ID 규칙
    const seats: { seatCode: string; zoneCode: string; roomNumber: number; hasOutlet: boolean }[] = [];
    for (let room = 1; room <= 10; room++) {
      for (let seat = 1; seat <= 4; seat++) {
        seats.push({
          seatCode: `GS-${String(room).padStart(2, "0")}-${seat}`,
          zoneCode,
          roomNumber: room,
          hasOutlet: false,
        });
      }
    }
    return seats;
  }

  return Array.from({ length: seatCount }, (_, i) => ({
    seatCode: `${zoneCode}-${padSeatNumber(i + 1)}`,
    zoneCode,
    roomNumber: null as number | null,
    // LZ 구역은 전 좌석 콘센트 보유로 고정 가정 (PRD 6.3)
    hasOutlet: zoneCode === "LZ",
  }));
}

async function main() {
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
  console.log(`시드 완료: 좌석 ${seatTotal}석 (예상 310석)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
