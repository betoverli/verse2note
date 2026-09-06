import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { ForAiPage } from "@/components/for-ai-page";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/for-ai")({
  component: ForAiRoute,
  head: () => ({
    meta: [
      { title: "Verse2Note — API, skill e MCP" },
      {
        name: "description",
        content:
          "Como usar o Verse2Note com Grok, Claude, Cursor ou qualquer agente: API, skill e MCP para gerar deep links de referências bíblicas.",
      },
    ],
  }),
});

function ForAiRoute() {
  const locale = useAppStore((s) => s.locale);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 pt-0 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-6">
      <AppHeader backTo="/" />
      <h1 className="font-display text-3xl tracking-tight text-fg italic">{t(locale, "forAiTitle")}</h1>
      <ForAiPage />
    </main>
  );
}
