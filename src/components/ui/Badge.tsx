export function Badge({
  label,
  bg,
  border,
  className = "",
}: {
  label: string;
  bg: string;
  border: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
      style={{ backgroundColor: bg, borderColor: border, color: border }}
    >
      {label}
    </span>
  );
}
