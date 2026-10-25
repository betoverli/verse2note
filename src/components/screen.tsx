import { Children, isValidElement, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { partitionScreenClass } from "@/lib/screen-class";
import { useNativeScrollLock } from "@/lib/page-scroll";
import { cn } from "@/lib/utils";

function isScreenChrome(node: ReactNode) {
  return isValidElement(node) && node.type === AppHeader;
}

/**
 * Page column: the top bar is a sibling of the scrolling region.
 * In the browser the document still scrolls and the bar stays sticky.
 * In the iOS shell only the middle region scrolls, so the rubber-band
 * cannot drag the bar.
 */
export function Screen({ className, children }: { className?: string; children: ReactNode }) {
  useNativeScrollLock();
  const items = Children.toArray(children);
  const chrome = items.filter(isScreenChrome);
  const body = items.filter((item) => !isScreenChrome(item));
  const parts = partitionScreenClass(className);
  return (
    <main className={cn("screen", parts.main)}>
      {chrome}
      <div className={cn("screen-body", parts.body)}>{body}</div>
    </main>
  );
}

export function ProfileScreen({ children }: { children: ReactNode }) {
  return (
    <Screen className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      {children}
    </Screen>
  );
}
