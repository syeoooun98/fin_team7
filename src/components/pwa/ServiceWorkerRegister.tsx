"use client";

import { useEffect } from "react";

/** 오프라인에서도 마지막으로 본 화면이 뜨도록 Service Worker를 등록한다. 개발 모드에서는
 * Turbopack HMR과 캐시가 충돌할 수 있어 프로덕션 빌드에서만 등록한다. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker 등록 실패", error);
    });
  }, []);

  return null;
}
