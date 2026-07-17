import type { ReactNode } from "react";

/** mockup.png의 흰색 카드(rounded-2xl, shadow) 톤으로 감싼 좌석 배치 영역. */
export function FloorFrame({
  children,
  minWidth = "1100px",
}: {
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="px-8 py-6">
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(124,58,237,0.06)]">
        <div className="rounded-xl bg-[#FAFAFC] p-8" style={{ minWidth }}>
          {children}
        </div>
      </div>
    </div>
  );
}
