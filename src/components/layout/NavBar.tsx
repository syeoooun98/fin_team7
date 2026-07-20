"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "./LogoutButton";

const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/",
    label: "대시보드",
    icon: (
      <path
        d="M3 10.5 10 4l7 6.5M5 9v7h10V9"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/map",
    label: "좌석 맵",
    icon: (
      <path
        d="M10 17.5s5.5-4.55 5.5-8.5A5.5 5.5 0 1 0 4.5 9c0 3.95 5.5 8.5 5.5 8.5Z M10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/community",
    label: "커뮤니티",
    icon: (
      <path
        d="M3.5 15.5V6a1.5 1.5 0 0 1 1.5-1.5h10A1.5 1.5 0 0 1 16.5 6v6a1.5 1.5 0 0 1-1.5 1.5H8l-3.2 2.6a.5.5 0 0 1-.8-.4Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/mypage",
    label: "마이페이지",
    icon: (
      <path
        d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 16.5c.8-3 3-4.5 6-4.5s5.2 1.5 6 4.5"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 로그인 여부에 따라 로그인/회원가입 링크 또는 계정 정보+로그아웃을 보여준다.
 * 768px 미만(design.md 6절 모바일 구간)에서는 상단 바에 4개 메뉴 텍스트를 다 욱여넣으면
 * 넘쳐서 가로 스크롤이 생기므로, 상단 pill 메뉴는 md 이상에서만 보여주고 모바일에서는
 * 같은 4개 목적지를 하단 고정 탭바로 대신 노출한다.
 */
export function NavBar({ studentId }: { studentId: string | null }) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-indigo-400 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(124,58,237,0.6)]">
              자
            </span>
            <span className="text-base font-bold tracking-tight text-foreground">자리지킴이</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border-subtle bg-surface-soft p-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
                    active
                      ? "bg-white text-brand shadow-[0_2px_10px_-4px_rgba(124,58,237,0.5)]"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 text-sm font-medium sm:gap-3">
            {studentId ? (
              <>
                <span className="text-foreground-subtle">{studentId}</span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-foreground-muted hover:text-foreground">
                  로그인
                </Link>
                <Link href="/signup" className="font-semibold text-brand hover:opacity-80">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="주요 메뉴"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="mx-auto flex w-full max-w-5xl items-stretch justify-between">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                  active ? "text-brand" : "text-foreground-subtle"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
