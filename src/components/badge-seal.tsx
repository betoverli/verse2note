import type { BadgeId } from "@/lib/badges";
import { cn } from "@/lib/utils";

function Face({ earned, children }: { earned: boolean; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 96 96" className="size-full" aria-hidden="true">
      <circle
        cx="48"
        cy="48"
        r="45.5"
        className={earned ? "fill-accent" : "fill-transparent"}
        stroke="currentColor"
        strokeWidth={earned ? 1.75 : 1.2}
      />
      <circle
        cx="48"
        cy="48"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity={earned ? 0.4 : 0.28}
      />
      <circle
        cx="48"
        cy="48"
        r="36.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.35"
        opacity={earned ? 0.22 : 0.16}
        strokeDasharray="1.6 2.4"
      />
      <g
        fill={earned ? "var(--color-accent-fg)" : "none"}
        stroke={earned ? "var(--color-accent-fg)" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
}

function Glyph({ id, earned }: { id: BadgeId; earned: boolean }) {
  switch (id) {
    case "plan_1":
      return (
        <Face earned={earned}>
          <path d="M48 28v8M42 38c0 8 3 16 6 24 3-8 6-16 6-24 0-4-2.6-7-6-7s-6 3-6 7Z" />
          <path d="M40 66h16" fill="none" />
        </Face>
      );
    case "plan_3":
      return (
        <Face earned={earned}>
          <path d="M36 32c4 8 4 24 0 32M48 30c4 9 4 27 0 36M60 32c4 8 4 24 0 32" fill="none" />
        </Face>
      );
    case "plan_5":
      return (
        <Face earned={earned}>
          <circle cx="48" cy="36" r="4.2" />
          <circle cx="36" cy="46" r="4.2" />
          <circle cx="60" cy="46" r="4.2" />
          <circle cx="40" cy="60" r="4.2" />
          <circle cx="56" cy="60" r="4.2" />
        </Face>
      );
    case "plan_10":
      return (
        <Face earned={earned}>
          <rect x="30" y="32" width="16" height="32" rx="1.5" />
          <rect x="50" y="32" width="16" height="32" rx="1.5" />
          <path d="M34 40h8M34 46h8M34 52h6M54 40h8M54 46h8M54 52h6" fill="none" strokeWidth="1.1" />
        </Face>
      );
    case "days_7":
      return (
        <Face earned={earned}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const a = (Math.PI * 2 * i) / 7 - Math.PI / 2;
            return <circle key={i} cx={48 + Math.cos(a) * 14} cy={48 + Math.sin(a) * 14} r="3.1" />;
          })}
          <circle cx="48" cy="48" r="3.4" />
        </Face>
      );
    case "days_30":
      return (
        <Face earned={earned}>
          <path d="M54 30a18 18 0 1 0 0 36 14 14 0 0 1 0-36Z" />
        </Face>
      );
    case "days_100":
      return (
        <Face earned={earned}>
          <path d="M38 58c6 8 14 8 20 0" fill="none" />
          <path d="M36 46c0-8 5-14 12-14s12 6 12 14c0 4-2 8-5 10" fill="none" />
          <path d="M58 42c4-2 8-1 10 3" fill="none" />
          <circle cx="42" cy="44" r="1.6" />
        </Face>
      );
    case "invite_1":
      return (
        <Face earned={earned}>
          <circle cx="40" cy="48" r="11" fill="none" />
          <circle cx="56" cy="48" r="11" fill="none" />
        </Face>
      );
    case "invite_3":
      return (
        <Face earned={earned}>
          <rect x="30" y="50" width="36" height="8" rx="1" />
          <path d="M34 50 38 36h20l4 14" fill="none" />
          <circle cx="40" cy="42" r="2" />
          <circle cx="48" cy="40" r="2" />
          <circle cx="56" cy="42" r="2" />
        </Face>
      );
    case "invite_5":
      return (
        <Face earned={earned}>
          <ellipse cx="40" cy="50" rx="10" ry="7" />
          <ellipse cx="54" cy="50" rx="10" ry="7" />
          <path d="M32 58c8 8 24 8 32 0" fill="none" />
          <path d="M48 34c-4 6-2 12 0 16 2-4 4-10 0-16Z" />
        </Face>
      );
    case "invite_10":
      return (
        <Face earned={earned}>
          {[
            [48, 34],
            [38, 40],
            [58, 40],
            [32, 50],
            [48, 48],
            [64, 50],
            [36, 60],
            [48, 62],
            [60, 60],
            [48, 40],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i === 4 ? 3.2 : 2.4} />
          ))}
        </Face>
      );
    case "list_1":
      return (
        <Face earned={earned}>
          <path d="M34 30h20c6 0 10 4 10 9v27c0-6-4-9-10-9H34V30Z" />
          <path d="M34 30v36h20c6 0 10 3 10 9" fill="none" />
        </Face>
      );
    case "list_5":
      return (
        <Face earned={earned}>
          <rect x="30" y="54" width="36" height="10" rx="1" />
          <rect x="32" y="44" width="32" height="10" rx="1" />
          <rect x="34" y="34" width="28" height="10" rx="1" />
        </Face>
      );
    case "share_1":
      return (
        <Face earned={earned}>
          <circle cx="48" cy="58" r="4" />
          <path d="M48 54V32M48 36 40 46M48 36l8 10M36 30h24" fill="none" />
        </Face>
      );
  }
}

export function BadgeSeal({ id, earned }: { id: BadgeId; earned: boolean }) {
  return (
    <span
      className={cn("badge-seal", earned ? "text-accent-fg" : "text-subtle")}
      data-earned={earned ? "true" : "false"}
    >
      <Glyph id={id} earned={earned} />
    </span>
  );
}
