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
        "flex min-h-11 w-full flex-col items-start rounded-[12px] px-4 py-3 text-left transition-colors duration-150",
        active ? "bg-accent text-accent-fg" : "bg-surface text-fg active:bg-fill",
      )}
    >
      <span className="text-[17px] font-normal">{title}</span>
      {subtitle ? (
        <span className={cn("mt-0.5 text-xs", active ? "opacity-70" : "text-muted")}>{subtitle}</span>
      ) : null}
    </button>
  );
}
