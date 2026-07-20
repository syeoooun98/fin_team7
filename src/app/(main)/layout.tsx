import { NavBar } from "@/components/layout/NavBar";
import { NotificationToastHost } from "@/components/layout/NotificationToastHost";
import { ReportGateModal } from "@/components/report/ReportGateModal";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { studentId: true } })
    : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <NavBar studentId={user?.studentId ?? null} />
      <NotificationToastHost />
      {user && <ReportGateModal />}
      {/* pb-24: 640px 미만에서 고정된 하단 탭바(NavBar의 MobileTabBar)에 콘텐츠가 가리지 않도록 여유를 둔다 */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
