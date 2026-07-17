/** design.md 4.3 GS 예외 — 룸 01~10 선택 탭. 예약 단위가 아니라 조회 편의용(DB.md 14.3 확정). */
export function GroupStudyRoomSelector({
  roomNumbers,
  selectedRoom,
  onSelect,
}: {
  roomNumbers: number[];
  selectedRoom: number;
  onSelect: (room: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-full border border-border-subtle bg-surface-soft p-1">
      {roomNumbers.map((room) => (
        <button
          key={room}
          onClick={() => onSelect(room)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            selectedRoom === room
              ? "bg-brand text-white shadow-[0_2px_8px_-2px_rgba(124,58,237,0.6)]"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          {String(room).padStart(2, "0")}호
        </button>
      ))}
    </div>
  );
}
