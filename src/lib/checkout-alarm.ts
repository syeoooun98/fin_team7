// 자리지킴이 — "체크아웃 시 알림"(F22, DB.md 2.9절) 발송 헬퍼.
// 세션이 체크아웃되는 3개 경로(수동 체크아웃, 자리비움 자동반납, 신고 자동반납) 모두
// 체크아웃 트랜잭션 안에서 이 함수를 호출해야 구독자 알림이 빠지지 않는다.
import type { Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

/**
 * seatSessionId를 구독 중이던(아직 알림 안 간) 체크아웃 알림을 전부 찾아 알림을 만들고
 * notifiedAt을 채운다. 구독자가 없으면 아무 일도 하지 않는다.
 */
export async function triggerCheckoutAlarms(
  tx: TransactionClient,
  seatSessionId: number,
  seatCode: string,
) {
  const pendingAlarms = await tx.checkoutAlarm.findMany({
    where: { seatSessionId, notifiedAt: null },
  });
  if (pendingAlarms.length === 0) return;

  const now = new Date();
  await tx.notification.createMany({
    data: pendingAlarms.map((alarm) => ({
      userId: alarm.userId,
      type: "CHECKOUT_ALARM_TRIGGERED" as const,
      seatSessionId,
      message: `${seatCode} 좌석이 체크아웃되었어요!`,
    })),
  });
  await tx.checkoutAlarm.updateMany({
    where: { id: { in: pendingAlarms.map((alarm) => alarm.id) } },
    data: { notifiedAt: now },
  });
}
