// 자리지킴이 — 자리 복귀 인증샷 미션 4종. 신고가 접수될 때 랜덤으로 1개가 배정되고
// (Report.missionCode), 그 미션에 맞는 사진인지는 lib/photo-verification.ts가 AI로 판별한다.
// 매번 다른 미션을 요구해야 예전에 찍어둔 사진을 재활용해 우회하기 어렵다.
export const MISSIONS = [
  {
    code: "WITH_BOOK",
    label: "책과 함께 인증샷 찍기 (손만 나와도 OK)",
    visionCheck: "사진에 책이나 노트, 교재가 보이고, 그것을 잡거나 짚고 있는 손이 함께 보이는지 — 얼굴이나 몸 전체가 나올 필요는 없다",
  },
  {
    code: "V_SIGN",
    label: "브이(V) 포즈로 인증샷 찍기 (손만 나와도 OK)",
    visionCheck: "손가락으로 브이(V) 포즈를 취한 손이 보이는지 — 얼굴이나 몸 전체가 나올 필요는 없다",
  },
  {
    code: "THUMBS_UP",
    label: "엄지척(따봉) 포즈로 인증샷 찍기 (손만 나와도 OK)",
    visionCheck: "엄지손가락을 치켜세운 엄지척(따봉) 포즈의 손이 보이는지 — 얼굴이나 몸 전체가 나올 필요는 없다",
  },
  {
    code: "WITH_LAPTOP",
    label: "노트북과 함께 인증샷 찍기 (손만 나와도 OK)",
    visionCheck: "펼쳐진 노트북이 보이고, 그 위나 옆에 손이 함께 보이는지 — 얼굴이나 몸 전체가 나올 필요는 없다",
  },
] as const;

export type Mission = (typeof MISSIONS)[number];
export type MissionCode = Mission["code"];

export function pickRandomMissionCode(): MissionCode {
  const index = Math.floor(Math.random() * MISSIONS.length);
  return MISSIONS[index].code;
}

export function getMission(code: string | null | undefined) {
  return MISSIONS.find((mission) => mission.code === code) ?? null;
}
