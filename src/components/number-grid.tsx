import { cn } from "@/lib/utils";

type NumberGridProps = {
  count: number;
  selected?: number | null;
  rangeStart?: number | null;
  rangeEnd?: number | null;
  onSelect: (value: number) => void;
  columns?: string;
};

export function NumberGrid({
  count,
  selected,
  rangeStart,
  rangeEnd,
  onSelect,
  columns = "grid-cols-5 sm:grid-cols-6",
}: NumberGridProps) {
  const lo =
    rangeStart != null && rangeEnd != null ? Math.min(rangeStart, rangeEnd) : rangeStart ?? null;
  const hi =
    rangeStart != null && rangeEnd != null ? Math.max(rangeStart, rangeEnd) : rangeEnd ?? null;

  return (
    <div className={cn("grid gap-2", columns)}>
      {Array.from({ length: count }, (_, i) => i + 1).map((n) => {
        const inRange = lo != null && hi != null && n >= lo && n <= hi;
        const isEdge = n === lo || n === hi || n === selected;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={cn(
              "min-h-11 rounded-sm text-sm tabular-nums transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
              inRange && !isEdge && "bg-accent/15 text-fg",
              isEdge && "bg-accent text-accent-fg",
              !inRange && !isEdge && "bg-surface text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
