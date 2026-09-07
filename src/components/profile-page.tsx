import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AVATARS, AvatarMark } from "@/lib/avatars";
import { savePrefs } from "@/lib/cloud";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function snapshot() {
  const s = useAppStore.getState();
  return {
    locale: s.locale,
    appId: s.appId,
    translationId: s.translationId,
    preferNative: s.preferNative,
    copyFormat: s.copyFormat,
    booksCompact: s.booksCompact,
    theme: s.theme,
    activePlans: s.activePlans,
    planProgress: s.planProgress,
    avatarId: s.avatarId,
    handle: s.handle,
    firstName: s.firstName,
    lastName: s.lastName,
    profileEmail: s.profileEmail,
  };
}

function usePrefillProfile() {
  const firstName = useAppStore((s) => s.firstName);
  const lastName = useAppStore((s) => s.lastName);
  const profileEmail = useAppStore((s) => s.profileEmail);
  const setProfile = useAppStore((s) => s.setProfile);
  const { user } = useCurrentUserState();

  useEffect(() => {
    if (!user) return;
    const patch: Parameters<typeof setProfile>[0] = {};
    if (!profileEmail && user.primaryEmail) patch.profileEmail = user.primaryEmail;
    if (!firstName && user.displayName) {
      const [given, ...rest] = user.displayName.split(" ");
      patch.firstName = given ?? "";
      if (!lastName) patch.lastName = rest.join(" ");
    }
    if (Object.keys(patch).length) setProfile(patch);
  }, [user, profileEmail, firstName, lastName, setProfile]);
}

export function ProfileView() {
  const locale = useAppStore((s) => s.locale);
  const avatarId = useAppStore((s) => s.avatarId);
  const handle = useAppStore((s) => s.handle);
  const firstName = useAppStore((s) => s.firstName);
  const lastName = useAppStore((s) => s.lastName);
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const gateSession = typeof window !== "undefined" ? hasGateSessionMarker() : false;
  usePrefillProfile();

  const name = [firstName, lastName].filter(Boolean).join(" ");

  if (isPending) {
    return <div className="h-40 rounded-md bg-surface" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted">{t(locale, "profileGuest")}</p>
        <Button className="w-full" asChild>
          <Link to="/login" search={{ create: false }}>
            {t(locale, "signIn")}
          </Link>
        </Button>
        <Button variant="secondary" className="w-full" asChild>
          <Link to="/login" search={{ create: true }}>
            {t(locale, "createAccount")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <AvatarMark id={avatarId} className="size-24 bg-elevated" iconClassName="size-10" />
      {handle ? (
        <p className="font-display text-xl italic text-fg">@{handle}</p>
      ) : (
        <p className="text-sm text-muted">{t(locale, "handleMissing")}</p>
      )}
      {name ? <p className="text-base text-fg">{name}</p> : null}
      <Button className="w-full" asChild>
        <Link to="/profile/edit">{t(locale, "editProfile")}</Link>
      </Button>
      {authEnabled && !gateSession ? (
        <Button
          variant="ghost"
          className="w-full text-muted"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut()
              .then(() => navigate({ to: "/app" }))
              .catch(() => setSigningOut(false));
          }}
        >
          {signingOut ? t(locale, "signingOut") : t(locale, "signOut")}
        </Button>
      ) : null}
    </div>
  );
}

export function ProfileEdit() {
  const locale = useAppStore((s) => s.locale);
  const avatarId = useAppStore((s) => s.avatarId);
  const handle = useAppStore((s) => s.handle);
  const firstName = useAppStore((s) => s.firstName);
  const lastName = useAppStore((s) => s.lastName);
  const profileEmail = useAppStore((s) => s.profileEmail);
  const setProfile = useAppStore((s) => s.setProfile);
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  usePrefillProfile();

  async function onSave() {
    setError(null);
    setSaving(true);
    try {
      const result = await savePrefs({ data: snapshot() });
      if (result && "error" in result && result.error === "handle") {
        setError(t(locale, "handleTaken"));
        setSaving(false);
        return;
      }
      await navigate({ to: "/profile" });
    } catch {
      setError(t(locale, "accountError"));
      setSaving(false);
    }
  }

  if (isPending) {
    return <div className="h-40 rounded-md bg-surface" aria-hidden="true" />;
  }

  if (!user) {
    return <ProfileView />;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "avatar")}</h2>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((item) => {
            const active = avatarId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setProfile({ avatarId: item.id })}
                aria-pressed={active}
                className={cn(
                  "grid aspect-square place-items-center rounded-full transition-colors",
                  active ? "bg-accent text-accent-fg" : "bg-surface text-fg shadow-[var(--shadow-border)]",
                )}
              >
                <AvatarMark id={item.id} className="bg-transparent" iconClassName="size-5" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "handle")}</span>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">@</span>
            <Input
              value={handle}
              onChange={(event) =>
                setProfile({ handle: event.target.value.replace(/^@+/, "").toLowerCase().replace(/[^a-z0-9_]/g, "") })
              }
              className="pl-8"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={20}
              placeholder="joao"
            />
          </div>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "firstName")}</span>
            <Input value={firstName} onChange={(event) => setProfile({ firstName: event.target.value })} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "lastName")}</span>
            <Input value={lastName} onChange={(event) => setProfile({ lastName: event.target.value })} />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "accountEmail")}</span>
          <Input
            type="email"
            value={profileEmail}
            onChange={(event) => setProfile({ profileEmail: event.target.value })}
            autoComplete="email"
          />
        </label>
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <Button className="w-full" disabled={saving} onClick={() => void onSave()}>
          {saving ? t(locale, "accountWait") : t(locale, "saveProfile")}
        </Button>
      </section>
    </div>
  );
}
