import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/map", label: "좌석 맵" },
  { href: "/mypage", label: "마이페이지" },
];

/** 로그인 여부에 따라 로그인/회원가입 링크 또는 계정 정보+로그아웃을 보여준다. */
export function NavBar({ studentId }: { studentId: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 sm:px-6">
      <Link href="/" className="text-lg font-bold">
        자리지킴이
      </Link>
      <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-neutral-900">
            {item.label}
          </Link>
        ))}
        {studentId ? (
          <>
            <span className="text-neutral-400">{studentId}</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-neutral-900">
              로그인
            </Link>
            <Link href="/signup" className="font-semibold text-self-ring hover:opacity-80">
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
