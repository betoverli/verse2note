import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { t } from "@/lib/i18n";
import { safeNext } from "@/lib/invite";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/wordmark";

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search: Record<string, unknown>): { create: boolean; next?: string } => {
    const next = safeNext(search.next);
    return {
      create: search.create === true || search.create === "1" || search.create === "true",
      ...(next ? { next } : {}),
    };
  },
  head: () => {
    const seo = pageHead({
      title: "Verse2Note — Entrar",
      description: "Entre ou crie uma conta para guardar os planos de leitura em todos os aparelhos.",
      path: "/login",
    });
    return { ...seo, meta: [...seo.meta, { name: "robots", content: "noindex" }] };
  },
});

export function Login() {
  const locale = useAppStore((s) => s.locale);
  const navigate = useNavigate();
  const { create, next } = Route.useSearch();
  const afterAuth = next ?? "/profile";
  const [mode, setMode] = useState<"in" | "up">(create ? "up" : "in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSocial(providerId: string) {
    setError(null);
    setBusy(true);
    try {
      await signIn(providerId, { callbackURL: afterAuth });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(/pop-up|popup/i.test(message) ? t(locale, "accountPopup") : message || t(locale, "accountError"));
      setBusy(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({
              name: name.trim() || email.split("@")[0] || "Verse2Note",
              email: email.trim(),
              password,
              callbackURL: afterAuth,
            })
          : await authClient.signIn.email({
              email: email.trim(),
              password,
              callbackURL: afterAuth,
            });
      if (result.error) {
        setError(result.error.message || t(locale, "accountError"));
        setBusy(false);
        return;
      }
      try {
        await authClient.getSession();
      } catch {
        /* cookie session will land on the next page */
      }
      if (afterAuth.startsWith("/g/")) {
        const id = afterAuth.slice(3).split("/")[0];
        await navigate({ to: "/g/$id", params: { id } });
      } else if (afterAuth.startsWith("/c/")) {
        const id = afterAuth.slice(3).split("/")[0];
        await navigate({ to: "/c/$id", params: { id } });
      } else if (afterAuth.startsWith("/reading/")) {
        const id = afterAuth.slice("/reading/".length).split("/")[0];
        await navigate({ to: "/reading/$id", params: { id } });
      } else if (afterAuth.startsWith("/collections")) {
        await navigate({ to: "/collections" });
      } else if (afterAuth === "/app") {
        await navigate({ to: "/app" });
      } else {
        await navigate({ to: "/profile" });
      }
    } catch {
      setError(t(locale, "accountError"));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <Wordmark size="sm" />
      <h1 className="mt-10 font-display text-3xl italic tracking-tight text-fg">
        {mode === "up" ? t(locale, "createAccount") : t(locale, "signIn")}
      </h1>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">{t(locale, "accountLead")}</p>

      <div className="mt-8 flex flex-col gap-2">
        {authEnabled ? (
          GROK_PROVIDERS.map((provider) => (
            <Button
              key={provider.providerId}
              type="button"
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => void onSocial(provider.providerId)}
            >
              {provider.idp === "google" ? t(locale, "continueGoogle") : t(locale, "continueX")}
            </Button>
          ))
        ) : (
          <p className="text-sm text-muted">{t(locale, "accountOff")}</p>
        )}
      </div>
      {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}

      {authEnabled ? (
        <>
          <p className="mt-6 text-center text-xs tracking-wide text-subtle uppercase">{t(locale, "orEmail")}</p>
          <form className="mt-4 flex flex-col gap-3" onSubmit={(event) => void onSubmit(event)}>
            {mode === "up" ? (
              <Input
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t(locale, "accountName")}
              />
            ) : null}
            <Input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t(locale, "accountEmail")}
            />
            <Input
              type="password"
              name="password"
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t(locale, "accountPassword")}
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? t(locale, "accountWait") : mode === "up" ? t(locale, "createAccount") : t(locale, "signIn")}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 min-h-11 text-sm text-muted hover:text-fg"
            onClick={() => {
              setMode(mode === "up" ? "in" : "up");
              setError(null);
            }}
          >
            {mode === "up" ? t(locale, "haveAccount") : t(locale, "noAccount")}
          </button>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-relaxed text-subtle">{t(locale, "accountHint")}</p>
      <Link to="/" className="mt-auto pt-8 text-center text-sm text-muted hover:text-fg">
        {t(locale, "back")}
      </Link>
    </main>
  );
}
