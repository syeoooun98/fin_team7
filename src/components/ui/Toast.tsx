export interface ToastPayload {
  id: string;
  message: string;
  tone?: "info" | "warning";
  /** 있으면 토스트 안에 액션 버튼을 노출한다(F22 "바로 이용하기" 등) */
  action?: { label: string; onClick: () => void };
}

/** design.md 5절: 실시간으로 화면을 보고 있을 때 발생하는 이벤트용 토스트(3~5초 자동 소멸은 호스트가 관리) */
export function Toast({ message, tone = "info", action }: ToastPayload) {
  const toneClass =
    tone === "warning"
      ? "border-warn-amber/40 bg-amber-50 text-amber-900"
      : "border-border-subtle bg-white text-foreground";

  return (
    <div
      className={`flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_16px_32px_-16px_rgba(43,45,90,0.35)] ${toneClass}`}
      role="status"
    >
      <span className="min-w-0 break-words">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
