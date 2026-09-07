import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => {
    const seo = pageHead({
      title: "Verse2Note — Entrar",
      description: "Entre para guardar os planos de leitura e as preferências em todos os aparelhos.",
      path: "/login",
    });
    return { ...seo, meta: [...seo.meta, { name: "robots", content: "noindex" }] };
  },
});

export function Login() {
  const locale = useAppStore((s) => s.locale);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <Wordmark size="sm" />
      <h1 className="mt-10 font-display text-3xl italic tracking-tight text-fg">{t(locale, "account")}</h1>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">{t(locale, "accountLead")}</p>
      <div className="mt-8 flex flex-col gap-2">
        {authEnabled ? (
          GROK_PROVIDERS.map((provider) => (
            <Button
              key={provider.providerId}
              variant="secondary"
              className="w-full"
              onClick={() => void signIn(provider.providerId, { callbackURL: "/settings" })}
            >
              {provider.idp === "google" ? t(locale, "continueGoogle") : t(locale, "continueX")}
            </Button>
          ))
        ) : (
          <p className="text-sm text-muted">{t(locale, "accountOff")}</p>
        )}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-subtle">{t(locale, "accountHint")}</p>
      <Link to="/settings" className="mt-auto pt-8 text-center text-sm text-muted hover:text-fg">
        {t(locale, "back")}
      </Link>
    </main>
  );
}
