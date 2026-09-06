import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Clock } from "lucide-react";
import { formatPassageById } from "@/lib/bible/passage";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function RecentsMenu() {
  const locale = useAppStore((s) => s.locale);
  const recent = useAppStore((s) => s.recent);
  const applyPassage = useAppStore((s) => s.applyPassage);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={t(locale, "recent")}>
          <Clock />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 min-w-48 max-w-72 rounded-lg bg-elevated p-1 shadow-[var(--shadow-border)] outline-none"
        >
          <DropdownMenu.Label className="px-3 py-2 text-xs font-medium tracking-wide text-muted uppercase">
            {t(locale, "recent")}
          </DropdownMenu.Label>
          {recent.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">{t(locale, "recentEmpty")}</p>
          ) : (
            recent.map((item) => {
              const label = formatPassageById(item, locale);
              if (!label) return null;
              return (
                <DropdownMenu.Item
                  key={`${item.bookId}-${item.chapter}-${item.verseStart}-${item.verseEnd}`}
                  className="cursor-pointer rounded-md px-3 py-2.5 text-sm text-fg outline-none data-[highlighted]:bg-surface"
                  onSelect={() => applyPassage(item)}
                >
                  {label}
                </DropdownMenu.Item>
              );
            })
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
