import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl border border-border-subtle bg-white p-7 shadow-[var(--shadow-pop)]">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Image
            src="/logo-v2.png"
            alt="자리지킴이 로고"
            width={44}
            height={44}
            className="h-11 w-11 rounded-2xl object-cover shadow-[0_10px_20px_-8px_rgba(124,58,237,0.6)]"
          />
          <h1 className="text-lg font-bold text-foreground">자리지킴이</h1>
          <p className="text-xs text-foreground-subtle">도서관 좌석, 지금 바로 확인하세요</p>
        </div>
        {children}
      </div>
    </div>
  );
}
