import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, Search, X } from "lucide-react";
import { t } from "@/lib/i18n";
import { isAppleUa } from "@/lib/platform";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackTo =
  | "/"
  | "/settings"
  | "/app"
  | "/profile"
  | "/collections"
  | "/collections/themes"
  | "/collections/category/$categoryId"
  | "/reading"
  | "/reading/all"
  | "/reading/category/$categoryId"
  | "/notebook";

export type HeaderSearch = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function HeaderTitle({ title }: { title?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) {
      setShift(0);
      return;
    }
    const measure = () => {
      const overflow = text.scrollWidth - wrap.clientWidth;
      setShift(overflow > 8 ? overflow : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    observer.observe(text);
    return () => observer.disconnect();
  }, [title]);

  const duration = Math.max(6, shift / 12);
  const style = (
    shift
      ? ({
          "--title-shift": `-${shift}px`,
          "--title-duration": `${duration}s`,
        } as CSSProperties)
      : undefined
  );

  return (
    <div ref={wrapRef} className="header-title min-w-0 flex-1 overflow-hidden px-1">
      <h1
        ref={textRef}
        key={title}
        className={cn(
          "mx-auto w-max max-w-none text-center text-[17px] leading-snug font-semibold whitespace-nowrap text-fg",
          shift && "header-title-marquee",
        )}
        style={style}
      >
        {title}
      </h1>
    </div>
  );
}

export function AppHeader({
  title,
  backTo,
  backParams,
  trailing,
  search,
  titleField,
  extra,
  compact,
}: {
  title?: string;
  backTo?: BackTo;
  backParams?: { categoryId: string };
  backLabel?: string;
  trailing?: ReactNode;
  search?: HeaderSearch;
  titleField?: ReactNode;
  extra?: ReactNode;
  compact?: boolean;
}) {
  const locale = useAppStore((s) => s.locale);
  const [apple, setApple] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setApple(isAppleUa()), []);
  const BackIcon = apple ? ChevronLeft : ArrowLeft;
  const showSearch = Boolean(search && (searchOpen || search.value));

  useEffect(() => {
    if (showSearch) inputRef.current?.focus();
  }, [showSearch]);

  return (
    <header className="app-header sticky top-0 z-20 -mx-4 bg-bg px-2 pb-2 sm:-mx-6 sm:px-3">
      <div className={cn("flex min-h-12 items-center gap-1", compact && "hidden")}>
        <div className="flex w-12 shrink-0 items-center justify-start">
          {backTo ? (
            <Button variant="ghost" size="icon" asChild className="size-12 -ml-1 text-fg [&_svg]:size-6">
              {(backTo === "/collections/category/$categoryId" || backTo === "/reading/category/$categoryId") &&
              backParams ? (
                <Link to={backTo} params={backParams} aria-label={t(locale, "back")}>
                  <BackIcon />
                </Link>
              ) : (
                <Link to={backTo} aria-label={t(locale, "back")}>
                  <BackIcon />
                </Link>
              )}
            </Button>
          ) : null}
        </div>
        {showSearch && search ? (
          <div className="min-w-0 flex-1">
            <input
              ref={inputRef}
              type="search"
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  search.onChange("");
                  setSearchOpen(false);
                }
              }}
              placeholder={search.placeholder}
              aria-label={search.placeholder}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              className="h-10 w-full rounded-md bg-surface px-3 text-base text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
        ) : titleField ? (
          <div className="min-w-0 flex-1">{titleField}</div>
        ) : (
          <HeaderTitle title={title} />
        )}
        <div className="flex min-w-12 shrink-0 items-center justify-end">
          {search ? (
            showSearch ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-12 text-fg [&_svg]:size-6"
                aria-label={t(locale, "back")}
                onClick={() => {
                  search.onChange("");
                  setSearchOpen(false);
                }}
              >
                <X />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="size-12 text-fg [&_svg]:size-6"
                aria-label={search.placeholder}
                onClick={() => setSearchOpen(true)}
              >
                <Search />
              </Button>
            )
          ) : null}
          {showSearch ? null : trailing}
        </div>
      </div>
      {extra}
    </header>
  );
}
