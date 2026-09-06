import { cn } from "@/lib/utils";

export function Choice({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-h-11 w-full flex-col items-start rounded-md px-4 py-3 text-left transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.99]",
        active
          ? "bg-accent text-accent-fg"
          : "bg-surface text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
      )}
    >
      <span className="text-sm font-medium">{title}</span>
      {subtitle ? (
        <span className={cn("mt-0.5 text-xs", active ? "opacity-70" : "text-muted")}>{subtitle}</span>
      ) : null}
    </button>
  );
}
