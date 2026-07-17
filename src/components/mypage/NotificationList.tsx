import type { NotificationItem } from "@/lib/types";

/** design.md 4.7/5절 — F16에 정의된 알림 유형 전체를 누적해서 보여주는 목록 */
export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  if (notifications.length === 0) {
    return <p className="text-sm text-neutral-500">받은 알림이 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {notifications.map((n) => (
        <li key={n.id} className="flex items-start justify-between gap-3 py-3">
          <p className={`text-sm ${n.readAt ? "text-neutral-500" : "font-medium text-neutral-900"}`}>
            {n.message}
          </p>
          <span className="whitespace-nowrap text-xs text-neutral-400">{n.createdAt}</span>
        </li>
      ))}
    </ul>
  );
}
