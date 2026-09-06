import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { AboutPage } from "@/components/about-page";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/about")({
  component: AboutRoute,
  head: () => ({
    meta: [
      { title: "Verse2Note — Sobre e ajuda" },
      {
        name: "description",
        content:
          "Como surgiu o Verse2Note, como gerar links de referências bíblicas e como ajudar o projeto.",
      },
    ],
  }),
});

function AboutRoute() {
  const locale = useAppStore((s) => s.locale);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 pt-0 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-6">
      <AppHeader backTo="/" />
      <h1 className="font-display text-3xl tracking-tight text-fg italic">{t(locale, "aboutTitle")}</h1>
      <AboutPage />
    </main>
  );
}
