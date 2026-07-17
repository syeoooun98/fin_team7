// 자리지킴이 — 2~5층 아이소메트릭 구조도 배치 데이터.
// 2F.png~5F.png(실측 층별 안내도, 우측 1~8 번호 범례 포함)의 상대 위치/크기를 %로 옮긴 근사치.
// 번호 범례에 실제로 이름이 매겨진 24개 구역은 FLOOR_PLANS 블록으로, 화장실/엘리베이터/비상구계단
// 같은 "구역이 아닌" 시설 아이콘은 FACILITY_ICONS(아래)로 따로 표시한다(DB.md 확정 zoneCode 기준).
import type { ZoneCode } from "./types";

export interface FloorPlanBlock {
  id: string;
  label: string;
  /** 있으면 클릭 가능한 구역(핀 표시, 좌석 맵으로 이동). 없으면 배경 장식용 블록. */
  zoneCode?: ZoneCode;
  /** 전부 0~100 사이 % (바닥 슬래브 기준 절대 위치) */
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 화장실/엘리베이터/비상구계단 등 "구역이 아닌" 시설 아이콘 종류. */
export type FacilityIconType = "MALE_WC" | "FEMALE_WC" | "ELEVATOR" | "STAIRS";

export interface FacilityIconBlock {
  id: string;
  type: FacilityIconType;
  /** 0~100 사이 % (바닥 슬래브 기준 절대 위치, 점 좌표) */
  left: number;
  top: number;
}

/**
 * 2F~5F 도면 모두 동일하게, 중앙 통로를 사이에 두고 좌·우 시설 코어(화장실+엘리베이터+비상구계단)가
 * 대칭으로 모여 있다(각 도면 하단 범례: 🚹남자화장실 🚺여자화장실 🛗엘리베이터 🏃비상구계단).
 * 좌석 구역이 아니므로 zoneCode 없이 아이콘 픽토그램 위치만 갖고, 클릭해도 이동하지 않는다.
 */
function facilityCluster(floor: number): FacilityIconBlock[] {
  return [
    { id: `f${floor}-fac-male-l`, type: "MALE_WC", left: 15.5, top: 40 },
    { id: `f${floor}-fac-female-l`, type: "FEMALE_WC", left: 20.5, top: 40 },
    { id: `f${floor}-fac-stairs-l`, type: "STAIRS", left: 15.5, top: 56 },
    { id: `f${floor}-fac-elevator-l`, type: "ELEVATOR", left: 20.5, top: 56 },
    { id: `f${floor}-fac-elevator-r`, type: "ELEVATOR", left: 79.5, top: 40 },
    { id: `f${floor}-fac-stairs-r`, type: "STAIRS", left: 84.5, top: 40 },
    { id: `f${floor}-fac-female-r`, type: "FEMALE_WC", left: 79.5, top: 56 },
    { id: `f${floor}-fac-male-r`, type: "MALE_WC", left: 84.5, top: 56 },
  ];
}

export const FACILITY_ICONS: Record<number, FacilityIconBlock[]> = {
  2: facilityCluster(2),
  3: facilityCluster(3),
  4: facilityCluster(4),
  5: facilityCluster(5),
};

export const FLOOR_PLANS: Record<number, FloorPlanBlock[]> = {
  // 2F.png: 1행(제1자유열람실+컨퍼런스룸) / 2행(휴게실·카페 | 메인스퀘어 | 락커룸) / 3행(메인로비+미디어실)
  2: [
    { id: "f2-free1", label: "제1자유열람실", zoneCode: "F2F1", left: 0, top: 0, width: 84, height: 34 },
    { id: "f2-conference", label: "컨퍼런스룸", zoneCode: "F2CF", left: 84, top: 0, width: 16, height: 34 },
    { id: "f2-rest", label: "휴게실", zoneCode: "F2RS", left: 0, top: 34, width: 12, height: 16 },
    { id: "f2-cafe", label: "카페", zoneCode: "F2CE", left: 0, top: 50, width: 12, height: 16 },
    { id: "f2-square", label: "메인스퀘어", zoneCode: "F2SQ", left: 24, top: 34, width: 52, height: 32 },
    { id: "f2-locker", label: "락커룸", zoneCode: "F2LK", left: 88, top: 34, width: 12, height: 16 },
    { id: "f2-lobby", label: "메인로비", zoneCode: "F2LB", left: 0, top: 66, width: 84, height: 34 },
    { id: "f2-media", label: "미디어실", zoneCode: "F2MD", left: 84, top: 34, width: 16, height: 66 },
  ],
  // 3F.png: 1행(수서/정리실+제1자료실) / 2행(학술정보운영팀·도서관장실 | (미표시 서가통로) | 악보서가) / 3행(대출실·회의실 | 제2자료실 | 악보서가 계속)
  3: [
    { id: "f3-archive", label: "수서/정리실", zoneCode: "F3AR", left: 0, top: 0, width: 12, height: 34 },
    { id: "f3-ref1", label: "제1자료실", zoneCode: "F3R1", left: 12, top: 0, width: 88, height: 34 },
    { id: "f3-research", label: "학술정보운영팀(리서치커먼스)", zoneCode: "F3RC", left: 0, top: 34, width: 12, height: 16 },
    { id: "f3-director", label: "도서관장실", zoneCode: "F3DR", left: 0, top: 50, width: 12, height: 16 },
    { id: "f3-loan", label: "대출실", zoneCode: "F3LN", left: 0, top: 66, width: 12, height: 17 },
    { id: "f3-meeting", label: "회의실", zoneCode: "F3MT", left: 0, top: 83, width: 12, height: 17 },
    { id: "f3-ref2", label: "제2자료실", zoneCode: "F3R2", left: 12, top: 66, width: 75, height: 34 },
    { id: "f3-score", label: "악보서가", zoneCode: "F3SC", left: 87, top: 34, width: 13, height: 66 },
  ],
  // 4F.png: 1행(대학원세미나실 | 대학원열람실 | 1인연구캐럴 | 미래인재양성센터) / 2행(휴게실 좌·우 두 블록, 같은 zoneCode) / 3행(제2자유열람실)
  4: [
    { id: "f4-seminar", label: "대학원세미나실", zoneCode: "F4SM", left: 0, top: 0, width: 7, height: 34 },
    { id: "f4-grad", label: "대학원 열람실", zoneCode: "F4GR", left: 7, top: 0, width: 26, height: 34 },
    { id: "f4-carrel", label: "1인 연구 캐럴", zoneCode: "F4CR", left: 33, top: 0, width: 39, height: 34 },
    { id: "f4-future", label: "미래인재양성센터", zoneCode: "F4FT", left: 72, top: 0, width: 28, height: 34 },
    { id: "f4-rest-left", label: "휴게실", zoneCode: "F4RS", left: 0, top: 34, width: 12, height: 32 },
    { id: "f4-rest-right", label: "휴게실", zoneCode: "F4RS", left: 88, top: 34, width: 12, height: 32 },
    { id: "f4-free2", label: "제2자유열람실", zoneCode: "F4F2", left: 0, top: 66, width: 100, height: 34 },
  ],
  // 5F.png: 1행 우측(학술정보이용교육실), 나머지는 4층 제2자유열람실 위로 뚫린 복층 보이드(장식 없음).
  // 3행: 제2자유열람실(F4F2, 4층과 같은 코드로 이어지는 복층) + 우측 고시반.
  5: [
    { id: "f5-edu", label: "학술정보이용교육실", zoneCode: "F5ED", left: 87, top: 0, width: 13, height: 34 },
    { id: "f5-free2", label: "제2자유열람실 (복층)", zoneCode: "F4F2", left: 0, top: 66, width: 87, height: 34 },
    { id: "f5-exam", label: "고시반", zoneCode: "F5EX", left: 87, top: 66, width: 13, height: 34 },
  ],
};
