import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { detectLocale, t } from "@/lib/i18n";
import { abortNativeReturn, mintNativeHandoff } from "@/lib/native/handoff";
import { nativeReturnTo } from "@/lib/native/return-to";

export const Route = createFileRoute("/auth/native-done")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: search.error === "1" || search.error === 1 || search.error === true,
  }),
  head: () => ({
    meta: [{ title: "Verse2Note" }, { name: "robots", content: "noindex" }],
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
      const fallback = nativeReturnTo("scheme", { error: true });
      try {
        const result = error ? await abortNativeReturn() : await mintNativeHandoff();
        if (cancelled) return;
        window.location.replace(result.redirect || fallback);
      } catch {
        if (cancelled) return;
        try {
          const abort = await abortNativeReturn();
          window.location.replace(abort.redirect || fallback);
        } catch {
          if (!cancelled) setFailed(true);
        }
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
