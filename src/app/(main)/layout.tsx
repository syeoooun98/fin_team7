import { NavBar } from "@/components/layout/NavBar";
import { NotificationToastHost } from "@/components/layout/NotificationToastHost";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <NavBar />
      <NotificationToastHost />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
