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
    <div className="flex flex-wrap gap-2">
      {roomNumbers.map((room) => (
        <button
          key={room}
          onClick={() => onSelect(room)}
          className={`rounded-md px-3 py-1 text-sm ${
            selectedRoom === room
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          {String(room).padStart(2, "0")}호
        </button>
      ))}
    </div>
  );
}
