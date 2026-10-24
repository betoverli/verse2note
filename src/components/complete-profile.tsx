import { useEffect, useState, type FormEvent } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { savePrefs } from "@/lib/cloud";
import { t } from "@/lib/i18n";
import { cleanEmail, cleanHandle, cleanName, profileIsComplete } from "@/lib/profile";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/wordmark";

function snapshot() {
  const s = useAppStore.getState();
  return {
    locale: s.locale,
    copyLocale: s.copyLocale,
    appId: s.appId,
    translationId: s.translationId,
    preferNative: s.preferNative,
    copyFormat: s.copyFormat,
    citeBook: s.citeBook,
    citeSep: s.citeSep,
    booksCompact: s.booksCompact,
    theme: s.theme,
    activePlans: s.activePlans,
    planProgress: s.planProgress,
    avatarId: s.avatarId,
    avatarUrl: s.avatarUrl,
    handle: s.handle,
    firstName: s.firstName,
    lastName: s.lastName,
    profileEmail: s.profileEmail,
  };
}

export function CompleteProfile() {
  const locale = useAppStore((s) => s.locale);
  const handle = useAppStore((s) => s.handle);
  const firstName = useAppStore((s) => s.firstName);
  const lastName = useAppStore((s) => s.lastName);
  const profileEmail = useAppStore((s) => s.profileEmail);
  const setProfile = useAppStore((s) => s.setProfile);
  const { user } = useCurrentUserState();
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const patch: { firstName?: string; lastName?: string; profileEmail?: string } = {};
    if (!firstName && user.displayName) {
      const [given, ...rest] = user.displayName.split(" ");
      patch.firstName = given ?? "";
      if (!lastName) patch.lastName = rest.join(" ");
    }
    if (!profileEmail && user.primaryEmail) patch.profileEmail = user.primaryEmail;
    if (Object.keys(patch).length) setProfile(patch);
  }, [user, firstName, lastName, profileEmail, setProfile]);

  const ready = profileIsComplete({ handle, firstName, profileEmail });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setError(null);
    setBusy(true);
    setProfile({
      handle: cleanHandle(handle),
      firstName: cleanName(firstName),
      profileEmail: cleanEmail(profileEmail),
    });
    try {
      const result = await savePrefs({ data: snapshot() });
      if (result && "error" in result && result.error === "handle") {
        setError(t(locale, "handleTaken"));
        setProfile({ handle: "" });
        setBusy(false);
        return;
      }
      useAppStore.getState().setCloudProfileOk(true);
    } catch {
      setError(t(locale, "accountError"));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6">
      <Wordmark size="sm" />
      <h1 className="mt-8 text-[34px] leading-[1.15] font-bold tracking-[-0.022em] text-fg">{t(locale, "completeProfile")}</h1>
      <p className="mt-2 text-[17px] leading-snug text-muted">{t(locale, "completeProfileLead")}</p>
      <form className="mt-8 flex flex-col gap-3" onSubmit={(event) => void onSubmit(event)}>
        <label className="block space-y-1.5">
          <span className="px-1 text-[13px] text-muted">{t(locale, "firstName")}</span>
          <Input
            value={firstName}
            onChange={(event) => setProfile({ firstName: event.target.value })}
            autoComplete="given-name"
            required
            maxLength={40}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="px-1 text-[13px] text-muted">{t(locale, "handle")}</span>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">@</span>
            <Input
              value={handle}
              onChange={(event) => setProfile({ handle: cleanHandle(event.target.value) })}
              className="pl-8"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={20}
              placeholder="joao"
              required
            />
          </div>
          <span className="px-1 text-[13px] text-subtle">{t(locale, "handleHint")}</span>
        </label>
        <label className="block space-y-1.5">
          <span className="px-1 text-[13px] text-muted">{t(locale, "accountEmail")}</span>
          <Input
            type="email"
            value={profileEmail}
            onChange={(event) => setProfile({ profileEmail: event.target.value })}
            autoComplete="email"
            required
          />
        </label>
        {error ? <p className="text-[15px] text-danger">{error}</p> : null}
        <Button type="submit" className="mt-2 w-full" size="lg" disabled={busy || !ready}>
          {busy ? t(locale, "accountWait") : t(locale, "saveProfile")}
        </Button>
      </form>
      <button
        type="button"
        className="mt-auto min-h-11 pt-8 text-[17px] text-accent disabled:opacity-60"
        disabled={signingOut}
        onClick={() => {
          setError(null);
          setSigningOut(true);
          void signOut().catch(() => {
            setSigningOut(false);
            setError(t(locale, "signOutFailed"));
          });
        }}
      >
        {signingOut ? t(locale, "signingOut") : t(locale, "signOut")}
      </button>
    </main>
  );
}
