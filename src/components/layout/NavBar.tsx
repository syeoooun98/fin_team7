import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/map", label: "좌석 맵" },
  { href: "/mypage", label: "마이페이지" },
];

export function NavBar() {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 sm:px-6">
      <Link href="/" className="text-lg font-bold">
        자리지킴이
      </Link>
      <nav className="flex gap-4 text-sm font-medium text-neutral-600">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-neutral-900">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
