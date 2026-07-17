/**
 * 지도용 "물방울" 핀.
 * - 정사각형을 45도 회전 + 코너 라운드(50% 50% 50% 0)로 눈물방울(테어드롭) 실루엣을 만들고,
 * - backdrop-filter blur + 반투명 그라디언트 + 인셋 하이라이트/그림자 레이어로
 *   유리·젤리 같은 "약간 투명 + 입체감" 있는 느낌을 낸다.
 * - available이 숫자로 주어질 때만(제1자유열람실/메인스퀘어/제2자유열람실/대학원 열람실 4개 구역)
 *   중앙에 흰 배지 + 좌석 수를 보여준다. 나머지 구역은 숫자 배지 없이 물방울 모양만 보인다.
 */
export function MapPin({
  color,
  available,
  size = 34,
}: {
  color: string;
  available?: number;
  size?: number;
}) {
  const hasBadge = typeof available === "number";
  const dropSize = size * 0.8;

  return (
    <div
      className="relative"
      style={{ width: size, height: size * 1.3, filter: "drop-shadow(0 5px 7px rgba(15,15,25,0.25))" }}
    >
      {/* 물방울 몸통: 유리질 반투명 그라디언트 + blur로 뒷배경이 살짝 비치게 한다 */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: dropSize,
          height: dropSize,
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-45deg)",
          background: `linear-gradient(135deg, ${color}F0 0%, ${color}B3 55%, ${color}66 100%)`,
          backdropFilter: "blur(3px) saturate(170%)",
          WebkitBackdropFilter: "blur(3px) saturate(170%)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "inset -3px -4px 6px rgba(0,0,0,0.12), inset 3px 4px 8px rgba(255,255,255,0.7)",
        }}
      />
      {/* 광택 하이라이트(젤리 반사광) */}
      <div
        aria-hidden
        className="absolute rounded-full bg-white/80"
        style={{
          width: dropSize * 0.22,
          height: dropSize * 0.12,
          left: size * 0.24,
          top: size * 0.14,
          filter: "blur(1px)",
          transform: "rotate(-30deg)",
        }}
      />
      {/* 중앙 배지: 좌석 수가 있는 구역만 표시 */}
      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full"
        style={{
          top: dropSize * 0.24,
          width: dropSize * 0.62,
          height: dropSize * 0.62,
          background: hasBadge ? "rgba(255,255,255,0.95)" : "transparent",
          boxShadow: hasBadge ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
        }}
      >
        {hasBadge && (
          <span style={{ fontSize: size * 0.34, fontWeight: 700, color, lineHeight: 1 }}>{available}</span>
        )}
      </div>
    </div>
  );
}
