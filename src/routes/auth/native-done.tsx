import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { detectLocale, t } from "@/lib/i18n";
import { mintNativeHandoff } from "@/lib/native/handoff";

export const Route = createFileRoute("/auth/native-done")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: search.error === "1" || search.error === 1 || search.error === true,
  }),
  head: () => ({
    meta: [
      { title: "Verse2Note" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NativeDone,
});

function NativeDone() {
  const { error } = Route.useSearch();
  const locale = detectLocale();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (error) {
        window.location.replace("verse2note://auth?error=1");
        return;
      }
      try {
        const minted = await mintNativeHandoff();
        if (cancelled) return;
        if (!minted.ok || !("code" in minted) || !minted.code) {
          window.location.replace("verse2note://auth?error=1");
          return;
        }
        window.location.replace(`verse2note://auth?code=${encodeURIComponent(minted.code)}`);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center text-fg">
      <p className="max-w-xs text-sm text-muted">
        {failed ? t(locale, "nativeAuthFailed") : t(locale, "nativeAuthOpening")}
      </p>
    </main>
  );
}
