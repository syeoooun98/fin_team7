export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl border border-border-subtle bg-white p-7 shadow-[var(--shadow-pop)]">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-indigo-400 text-lg font-bold text-white shadow-[0_10px_20px_-8px_rgba(124,58,237,0.6)]">
            자
          </span>
          <h1 className="text-lg font-bold text-foreground">자리지킴이</h1>
          <p className="text-xs text-foreground-subtle">도서관 좌석, 지금 바로 확인하세요</p>
        </div>
        {children}
      </div>
    </div>
  );
}
