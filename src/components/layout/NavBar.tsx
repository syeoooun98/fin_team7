"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/map", label: "좌석 맵" },
  { href: "/mypage", label: "마이페이지" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-indigo-400 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(124,58,237,0.6)]">
            자
          </span>
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
      </div>
    </header>
  );
}
