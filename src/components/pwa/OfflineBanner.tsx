"use client";

import { useEffect, useState } from "react";

/** 오프라인일 때 지금 보이는 화면이 최신 정보가 아닐 수 있음을 알린다(design.md 톤 유지: warn-amber). */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="border-b border-warn-amber/30 bg-warn-amber/10 px-4 py-2 text-center text-xs font-medium text-foreground">
      오프라인 상태예요 — 지금 화면은 마지막으로 불러온 정보라 최신이 아닐 수 있어요.
    </div>
  );
}
