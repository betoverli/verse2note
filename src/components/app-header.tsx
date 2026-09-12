import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft } from "lucide-react";
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
  | "/reading/category/$categoryId";

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
}: {
  title?: string;
  backTo?: BackTo;
  backParams?: { categoryId: string };
  backLabel?: string;
  trailing?: ReactNode;
}) {
  const locale = useAppStore((s) => s.locale);
  const [apple, setApple] = useState(false);
  useEffect(() => setApple(isAppleUa()), []);
  const BackIcon = apple ? ChevronLeft : ArrowLeft;

  return (
    <header className="app-header sticky top-0 z-20 -mx-4 bg-bg px-2 pb-2 sm:-mx-6 sm:px-3">
      <div className="flex min-h-12 items-center gap-1">
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
        <HeaderTitle title={title} />
        <div className="flex min-w-12 shrink-0 items-center justify-end">{trailing}</div>
      </div>
    </header>
  );
}
