export interface ToastPayload {
  id: string;
  message: string;
  tone?: "info" | "warning";
}

/** design.md 5절: 실시간으로 화면을 보고 있을 때 발생하는 이벤트용 토스트(3~5초 자동 소멸은 호스트가 관리) */
export function Toast({ message, tone = "info" }: ToastPayload) {
  const toneClass =
    tone === "warning"
      ? "border-warn-amber bg-amber-50 text-amber-900"
      : "border-neutral-200 bg-white text-neutral-800";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm shadow-md ${toneClass}`} role="status">
      {message}
    </div>
  );
}
