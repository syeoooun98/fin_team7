export interface ToastPayload {
  id: string;
  message: string;
  tone?: "info" | "warning";
}

/** design.md 5절: 실시간으로 화면을 보고 있을 때 발생하는 이벤트용 토스트(3~5초 자동 소멸은 호스트가 관리) */
export function Toast({ message, tone = "info" }: ToastPayload) {
  const toneClass =
    tone === "warning"
      ? "border-warn-amber/40 bg-amber-50 text-amber-900"
      : "border-border-subtle bg-white text-foreground";

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_16px_32px_-16px_rgba(43,45,90,0.35)] ${toneClass}`}
      role="status"
    >
      {message}
    </div>
  );
}
