import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addEmailPassword } from "@/lib/account-methods";
import { GROK_PROVIDERS, authClient } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AccountRow = { providerId: string };

function labelFor(providerId: string, locale: "pt" | "en" | "es") {
  if (providerId === "credential") return t(locale, "accountEmail");
  const provider = GROK_PROVIDERS.find((item) => item.providerId === providerId);
  if (provider?.idp === "google") return t(locale, "continueGoogle");
  if (provider?.idp === "twitter") return t(locale, "continueX");
  return providerId;
}

export function LinkedMethods() {
  const locale = useAppStore((s) => s.locale);
  const [accounts, setAccounts] = useState<AccountRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const result = await authClient.listAccounts();
    const rows = (result.data ?? []) as AccountRow[];
    setAccounts(rows);
  }

  useEffect(() => {
    void refresh().catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (!err) return;
    setError(err === "account_already_linked_to_different_user" ? t(locale, "linkTaken") : t(locale, "accountError"));
    params.delete("error");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [locale]);

  if (hasGateSessionMarker()) return null;
  if (accounts == null) return <div className="h-24 rounded-lg bg-surface" aria-hidden />;

  const has = (id: string) => accounts.some((item) => item.providerId === id);
  const hasEmail = has("credential");

  async function onLink(providerId: string) {
    setError(null);
    setBusy(providerId);
    try {
      const { data, error: fail } = await authClient.oauth2.link({
        providerId,
        callbackURL: "/profile/edit",
        errorCallbackURL: "/profile/edit",
      });
      if (fail) {
        setError(fail.message || t(locale, "accountError"));
        setBusy(null);
        return;
      }
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
      setBusy(null);
    } catch {
      setError(t(locale, "accountError"));
      setBusy(null);
    }
  }

  async function onPassword() {
    setError(null);
    if (password.length < 8) {
      setError(t(locale, "accountPassword"));
      return;
    }
    if (password !== confirm) {
      setError(t(locale, "linkMismatch"));
      return;
    }
    setBusy("credential");
    try {
      const result = await addEmailPassword({ data: { newPassword: password } });
      if (!result || !("ok" in result) || !result.ok) {
        setError(t(locale, "accountError"));
        setBusy(null);
        return;
      }
      setPassword("");
      setConfirm("");
      await refresh();
      const id = toast.success(t(locale, "linkSaved"));
      window.setTimeout(() => toast.dismiss(id), 2000);
    } catch {
      setError(t(locale, "accountError"));
    }
    setBusy(null);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "linkedMethods")}</h2>
      <ul className="flex flex-col gap-2">
        {GROK_PROVIDERS.map((provider) => {
          const connected = has(provider.providerId);
          return (
            <li key={provider.providerId} className="flex min-h-14 items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
              <span className="text-sm font-medium text-fg">{labelFor(provider.providerId, locale)}</span>
              {connected ? (
                <span className="text-xs text-muted">{t(locale, "linkedOn")}</span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={Boolean(busy)}
                  onClick={() => void onLink(provider.providerId)}
                >
                  {busy === provider.providerId ? t(locale, "accountWait") : t(locale, "linkAdd")}
                </Button>
              )}
            </li>
          );
        })}
        <li className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
          <div className="flex min-h-8 items-center justify-between gap-3">
            <span className="text-sm font-medium text-fg">{t(locale, "accountEmail")}</span>
            {hasEmail ? <span className="text-xs text-muted">{t(locale, "linkedOn")}</span> : null}
          </div>
          {hasEmail ? null : (
            <form
              className="mt-3 flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void onPassword();
              }}
            >
              <p className="text-xs text-muted">{t(locale, "linkEmailLead")}</p>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t(locale, "accountPassword")}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <Input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder={t(locale, "linkPasswordConfirm")}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <Button type="submit" variant="secondary" disabled={Boolean(busy)}>
                {busy === "credential" ? t(locale, "accountWait") : t(locale, "linkAdd")}
              </Button>
            </form>
          )}
        </li>
      </ul>
      {error ? <p className="text-sm text-accent">{error}</p> : null}
    </section>
  );
}
