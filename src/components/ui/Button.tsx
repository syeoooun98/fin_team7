import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_10px_20px_-10px_rgba(124,58,237,0.7)] hover:bg-brand-hover active:scale-[0.98]",
  secondary:
    "bg-white text-foreground border border-border-strong hover:bg-surface-soft active:scale-[0.98]",
  danger:
    "bg-danger-muted text-white shadow-[0_10px_20px_-10px_rgba(217,83,79,0.6)] hover:opacity-90 active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
