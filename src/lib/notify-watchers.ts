// 자리지킴이 — "체크아웃 시 알림"(F22, DB.md 2.9절) 발송 헬퍼.
// 세션이 체크아웃되는 3개 경로(수동 체크아웃, 자리비움 자동반납, 신고 자동반납) 모두
// 체크아웃 트랜잭션 안에서 이 함수를 호출해야 구독자 알림이 빠지지 않는다.
import type { Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

/**
 * seatSessionId를 구독 중이던(아직 알림 안 간) 요청을 전부 찾아 알림을 만들고
 * notifiedAt을 채운다. 구독자가 없으면 아무 일도 하지 않는다.
 */
export async function notifyCheckoutWatchers(
  tx: TransactionClient,
  seatSessionId: number,
  seatCode: string,
) {
  const pendingWatches = await tx.seatWatchRequest.findMany({
    where: { seatSessionId, notifiedAt: null },
  });
  if (pendingWatches.length === 0) return;

  const now = new Date();
  await tx.notification.createMany({
    data: pendingWatches.map((watch) => ({
      userId: watch.watcherUserId,
      type: "SEAT_WATCH_AVAILABLE" as const,
      seatSessionId,
      message: `${seatCode} 좌석이 체크아웃되었어요!`,
    })),
  });
  await tx.seatWatchRequest.updateMany({
    where: { id: { in: pendingWatches.map((watch) => watch.id) } },
    data: { notifiedAt: now },
  });
}
