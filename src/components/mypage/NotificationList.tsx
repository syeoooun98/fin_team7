import type { NotificationItem } from "@/lib/types";

/** design.md 4.7/5절 — F16에 정의된 알림 유형 전체를 누적해서 보여주는 목록 */
export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  if (notifications.length === 0) {
    return <p className="p-4 text-sm text-foreground-muted">받은 알림이 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-border-subtle">
      {notifications.map((n) => (
        <li key={n.id} className="flex items-start justify-between gap-3 px-2 py-3 sm:px-2">
          <div className="flex items-start gap-2.5">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                n.readAt ? "bg-border-strong" : "bg-brand"
              }`}
              aria-hidden
            />
            <p className={`text-sm ${n.readAt ? "text-foreground-muted" : "font-medium text-foreground"}`}>
              {n.message}
            </p>
          </div>
          <span className="whitespace-nowrap text-xs text-foreground-subtle">{n.createdAt}</span>
        </li>
      ))}
    </ul>
  );
}
