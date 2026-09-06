export type Theme = "light" | "dark" | "system";

export function resolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "light") return "light";
  if (theme === "dark") return "dark";
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const THEME_COLOR = {
  light: "#f4efe6",
  dark: "#121110",
} as const;

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const resolved = resolvedTheme(theme);
  document.documentElement.classList.toggle("light", resolved === "light");
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[resolved]);
}
