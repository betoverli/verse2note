import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { applyTheme, resolvedTheme, type Theme } from "@/lib/theme";
import { useAppStore } from "@/lib/store";

export function ThemeSync() {
  const theme = useAppStore((s) => s.theme);
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    typeof window === "undefined" ? "dark" : resolvedTheme(theme),
  );

  useEffect(() => {
    const sync = (value: Theme) => {
      applyTheme(value);
      setResolved(resolvedTheme(value));
    };
    sync(theme);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => sync("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <Toaster
      theme={resolved}
      position="top-center"
      duration={2000}
      offset="calc(env(safe-area-inset-top) + 12px)"
      mobileOffset="calc(env(safe-area-inset-top) + 12px)"
      toastOptions={{
        duration: 2000,
        className: "!bg-elevated !text-fg !border !border-border !font-sans !shadow-none",
      }}
    />
  );
}
