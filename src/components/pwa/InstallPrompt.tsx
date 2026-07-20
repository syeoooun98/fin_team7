"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "jarizikimi-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isOtherBrowser = /crios|fxios|edgios/.test(ua);
  return isIos && !isOtherBrowser;
}

/** 스마트폰 브라우저에서 "홈 화면에 추가"를 안내한다. Android는 beforeinstallprompt로 네이티브
 * 설치 버튼을, iOS Safari는 beforeinstallprompt가 없어 공유 메뉴 사용법 안내로 대신한다. */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    if (isStandalone()) return;

    setDismissed(false);
    if (isIosSafari()) setShowIosHint(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setDismissed(true);
      localStorage.setItem(DISMISS_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 sm:hidden">
      <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border-subtle bg-white p-3 shadow-[0_16px_32px_-16px_rgba(43,45,90,0.35)]">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-xl"
        />
        <div className="flex-1 text-xs text-foreground-muted">
          <p className="text-sm font-semibold text-foreground">홈 화면에 자리지킴이 추가</p>
          {showIosHint ? (
            <p>Safari 하단 공유 버튼 → “홈 화면에 추가”를 눌러주세요</p>
          ) : (
            <p>앱처럼 바로 켜서 쓸 수 있어요</p>
          )}
        </div>
        {deferredPrompt && (
          <Button
            className="shrink-0 px-3 py-1.5 text-xs"
            onClick={async () => {
              await deferredPrompt.prompt();
              const choice = await deferredPrompt.userChoice;
              setDeferredPrompt(null);
              if (choice.outcome === "accepted") dismiss();
            }}
          >
            설치
          </Button>
        )}
        <button
          onClick={dismiss}
          aria-label="닫기"
          className="shrink-0 text-foreground-subtle transition hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
