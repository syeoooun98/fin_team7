"use client";

import { useEffect, useState } from "react";

/** startedAt+limitMinutes로 만료 시각을 고정하고, 매초 잔여시간을 다시 계산해 실시간으로 째깍이는 훅. */
export function useRemainingSeconds(startedAt: string, limitMinutes: number): number {
  const totalSeconds = limitMinutes * 60;
  const deadlineMs = new Date(startedAt).getTime() + totalSeconds * 1000;
  const computeRemaining = () => Math.max(0, Math.round((deadlineMs - Date.now()) / 1000));

  const [remainingSeconds, setRemainingSeconds] = useState(computeRemaining);

  useEffect(() => {
    // startedAt/limitMinutes가 바뀔 때(다른 자리비움으로 전환 등) 표시값을 즉시 다시 동기화하는
    // 타이머 재설정 패턴이라 의도적으로 lint를 비활성화한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemainingSeconds(computeRemaining());
    const interval = setInterval(() => setRemainingSeconds(computeRemaining()), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, limitMinutes]);

  return remainingSeconds;
}
