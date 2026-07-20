"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/map", label: "좌석 맵" },
  { href: "/community", label: "커뮤니티" },
  { href: "/mypage", label: "마이페이지" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 로그인 여부에 따라 로그인/회원가입 링크 또는 계정 정보+로그아웃을 보여준다. */
export function NavBar({ studentId }: { studentId: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo-v2.png"
            alt="자리지킴이 로고"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-cover shadow-[0_6px_16px_-6px_rgba(124,58,237,0.6)]"
          />
          <span className="text-base font-bold tracking-tight text-foreground">자리지킴이</span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft p-1">
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

        <div className="flex shrink-0 items-center gap-3 text-sm font-medium">
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
  );
}
