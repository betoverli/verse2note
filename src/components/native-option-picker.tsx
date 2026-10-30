import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Choice } from "@/components/choice";
import {
  canUseNativeMenus,
  presentNativeMenu,
  rectFromElement,
  type NativeMenuItem,
} from "@/lib/native/menus";
import { cn } from "@/lib/utils";

export type OptionPickerItem = {
  id: string;
  title: string;
  subtitle?: string;
  symbol?: string;
  destructive?: boolean;
  children?: OptionPickerItem[];
};

function toNativeItems(items: OptionPickerItem[], selectedId: string): NativeMenuItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.subtitle ? `${item.title} — ${item.subtitle}` : item.title,
    symbol: item.symbol,
    destructive: item.destructive,
    checked: item.id === selectedId || item.children?.some((child) => child.id === selectedId),
    children: item.children ? toNativeItems(item.children, selectedId) : undefined,
  }));
}

/**
 * Exclusive option group. On Capacitor iOS it collapses to one row that opens
 * a native `UIMenu` (checked item + SF Symbols). Web and Android keep the
 * Choice grid unchanged.
 */
export function OptionPicker({
  label,
  value,
  valueLabel,
  options,
  onChange,
  columns = 1,
  className,
}: {
  label: string;
  value: string;
  valueLabel: string;
  options: OptionPickerItem[];
  onChange: (id: string) => void;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [native, setNative] = useState(false);

  useEffect(() => {
    let alive = true;
    void canUseNativeMenus().then((ok) => {
      if (alive) setNative(ok);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!native) {
    const flat = flattenOptions(options);
    return (
      <div
        className={cn(
          "grid gap-2",
          columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
          className,
        )}
        role="listbox"
        aria-label={label}
      >
        {flat.map((item) => (
          <Choice
            key={item.id}
            active={item.id === value}
            title={item.title}
            subtitle={item.subtitle}
            onClick={() => onChange(item.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-[12px] bg-surface px-4 py-3 text-left text-fg active:bg-fill",
        className,
      )}
      aria-haspopup="menu"
      aria-label={label}
      onClick={() => {
        void presentNativeMenu({
          style: "menu",
          title: label,
          anchor: rectFromElement(buttonRef.current),
          items: toNativeItems(options, value),
        }).then((result) => {
          if (!result.cancelled && result.id) onChange(result.id);
        });
      }}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-muted">{label}</span>
        <span className="block truncate text-[17px]">{valueLabel}</span>
      </span>
      <ChevronDown className="size-5 shrink-0 text-subtle" aria-hidden />
    </button>
  );
}

function flattenOptions(items: OptionPickerItem[]): OptionPickerItem[] {
  const out: OptionPickerItem[] = [];
  for (const item of items) {
    if (item.children?.length) out.push(...flattenOptions(item.children));
    else out.push(item);
  }
  return out;
}

/** Section chrome that only wraps children — keeps settings pages tidy. */
export function OptionSection({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="space-y-1">
        <h2 className="ios-caption">{title}</h2>
        {lead ? <p className="px-4 text-[13px] leading-snug text-subtle">{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}
