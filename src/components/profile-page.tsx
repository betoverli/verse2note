import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Award, BarChart3, Bell, BookOpen, CircleHelp, Globe, Pencil, Share2, Sun, Users } from "lucide-react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AVATARS, PHOTO_AVATAR, AvatarMark, ProfileAvatar } from "@/lib/avatars";
import { getMyBadges } from "@/lib/badge-stats";
import { BADGE_IDS, type BadgeId } from "@/lib/badges";
import { getNotifyPrefs, type NotifyPrefs } from "@/lib/notify";
import { listLinks } from "@/lib/links";
import { notifySummary } from "@/components/notify-settings";
import { toast } from "sonner";
import { appById } from "@/lib/bible/apps";
import { savePrefs, syncAccountPhoto } from "@/lib/cloud";
import { t } from "@/lib/i18n";
import { cleanHandle, profileIsComplete } from "@/lib/profile";
import { localeLabel, themeLabel } from "@/components/settings-panel";
import { useAppStore } from "@/lib/store";
import { getIsAdmin } from "@/lib/usage";
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
    avatarUrl: s.avatarUrl,
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
  const avatarUrl = useAppStore((s) => s.avatarUrl);
  const avatarId = useAppStore((s) => s.avatarId);
  const setProfile = useAppStore((s) => s.setProfile);
  const { user } = useCurrentUserState();

  useEffect(() => {
    if (!user) return;
    const patch: Parameters<typeof setProfile>[0] = {};
    if (!profileEmail && user.primaryEmail) patch.profileEmail = user.primaryEmail;
    const photo = user.profileImageUrl;
    if (photo) patch.avatarUrl = photo;
    if (!firstName && user.displayName) {
      const [given, ...rest] = user.displayName.split(" ");
      patch.firstName = given ?? "";
      if (!lastName) patch.lastName = rest.join(" ");
    }
    if (Object.keys(patch).length) setProfile(patch);
    if (!photo && !avatarUrl) {
      void syncAccountPhoto().then((url) => {
        if (url) setProfile({ avatarUrl: url });
      });
    }
  }, [user, profileEmail, avatarUrl, firstName, lastName, setProfile]);
}

function SettingCards({ earned }: { earned: number }) {
  const locale = useAppStore((s) => s.locale);
  const theme = useAppStore((s) => s.theme);
  const appId = useAppStore((s) => s.appId);
  const app = appById(appId);
  const { user } = useCurrentUserState();
  const [notify, setNotify] = useState<NotifyPrefs | null>(null);
  const [friendCount, setFriendCount] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    void getNotifyPrefs()
      .then((data) => setNotify({ reading: data.reading, friends: data.friends, shares: data.shares }))
      .catch(() => undefined);
    void listLinks()
      .then((data) => {
        setFriendCount(data.friends.length);
        setIncomingCount(data.incoming.length);
      })
      .catch(() => undefined);
  }, [user]);

  const cards = [
    ...(user
      ? [
          {
            to: "/profile/badges" as const,
            icon: Award,
            title: t(locale, "badges"),
            subtitle: `${earned} / ${BADGE_IDS.length}`,
          },
          {
            to: "/profile/friends" as const,
            icon: Users,
            title: t(locale, "friends"),
            subtitle: incomingCount
              ? `${incomingCount} ${t(locale, "linkIncoming").toLowerCase()}`
              : `${friendCount}`,
          },
          {
            to: "/profile/notifications" as const,
            icon: Bell,
            title: t(locale, "notifications"),
            subtitle: notify ? notifySummary(locale, notify) : t(locale, "notifyOff"),
          },
        ]
      : []),
    {
      to: "/profile/theme" as const,
      icon: Sun,
      title: t(locale, "appearance"),
      subtitle: themeLabel(locale, theme),
    },
    {
      to: "/profile/bible" as const,
      icon: BookOpen,
      title: t(locale, "bibleApp"),
      subtitle: app?.names[locale] ?? t(locale, "bibleApp"),
    },
    {
      to: "/profile/language" as const,
      icon: Globe,
      title: t(locale, "language"),
      subtitle: localeLabel(locale),
    },
    {
      to: "/profile/help" as const,
      icon: CircleHelp,
      title: t(locale, "aboutTitle"),
      subtitle: t(locale, "helpTitle"),
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <li key={card.to}>
            <Link
              to={card.to}
              className="flex min-h-[8.25rem] flex-col items-start justify-between rounded-lg bg-surface p-4 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-elevated text-muted">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium leading-snug">{card.title}</span>
                <span className="mt-1 block text-xs text-muted">{card.subtitle}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ProfileView() {
  const locale = useAppStore((s) => s.locale);
  const avatarId = useAppStore((s) => s.avatarId);
  const avatarUrl = useAppStore((s) => s.avatarUrl);
  const handle = useAppStore((s) => s.handle);
  const firstName = useAppStore((s) => s.firstName);
  const lastName = useAppStore((s) => s.lastName);
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [badges, setBadges] = useState<BadgeId[]>([]);
  const gateSession = typeof window !== "undefined" ? hasGateSessionMarker() : false;
  usePrefillProfile();
  const name = [firstName, lastName].filter(Boolean).join(" ");

  useEffect(() => {
    if (!user) {
      setAdmin(false);
      setBadges([]);
      return;
    }
    void getIsAdmin()
      .then(setAdmin)
      .catch(() => setAdmin(false));
    void getMyBadges()
      .then(setBadges)
      .catch(() => setBadges([]));
  }, [user]);

  return (
    <div className="flex flex-col gap-8">
      {isPending ? (
        <div className="h-24 rounded-lg bg-surface" aria-hidden="true" />
      ) : user ? (
        <section className="flex flex-col items-center gap-3 pt-2">
          <ProfileAvatar id={avatarId} url={avatarUrl} className="size-20 bg-elevated" iconClassName="size-8" />
          {handle ? (
            <Link to="/u/$handle" params={{ handle }} className="font-display text-xl italic text-fg">
              @{handle}
            </Link>
          ) : (
            <p className="text-sm text-muted">{t(locale, "handleMissing")}</p>
          )}
          {name ? <p className="text-sm text-muted">{name}</p> : null}
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <p className="text-pretty text-sm leading-relaxed text-muted">{t(locale, "profileGuest")}</p>
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
        </section>
      )}

      <SettingCards earned={badges.length} />

      {admin ? (
        <Link
          to="/admin"
          className="flex min-h-16 items-center gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)]"
        >
          <span className="flex size-10 items-center justify-center rounded-md bg-elevated text-muted">
            <BarChart3 className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-medium">{t(locale, "adminTitle")}</span>
            <span className="mt-1 block text-xs text-muted">{t(locale, "adminHint")}</span>
          </span>
        </Link>
      ) : null}

      {user && authEnabled && !gateSession ? (
        <Button
          variant="ghost"
          className="w-full text-muted"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            useAppStore.getState().clearAccount();
            void signOut("/app").catch(() => setSigningOut(false));
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
  const avatarUrl = useAppStore((s) => s.avatarUrl);
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
  const photoUrl = avatarUrl || user?.profileImageUrl || "";

  async function onSave() {
    setError(null);
    if (!profileIsComplete({ handle, firstName, profileEmail })) {
      setError(t(locale, "completeProfileLead"));
      return;
    }
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
          {photoUrl ? (
            <button
              type="button"
              onClick={() => setProfile({ avatarId: PHOTO_AVATAR, avatarUrl: photoUrl })}
              aria-pressed={avatarId === PHOTO_AVATAR}
              aria-label={t(locale, "avatarPhoto")}
              className={cn(
                "grid aspect-square place-items-center overflow-hidden rounded-full transition-colors",
                avatarId === PHOTO_AVATAR ? "ring-2 ring-accent ring-offset-2 ring-offset-bg" : "bg-surface",
              )}
            >
              <img src={photoUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
            </button>
          ) : null}
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
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "firstName")}</span>
            <Input
              value={firstName}
              onChange={(event) => setProfile({ firstName: event.target.value })}
              required
            />
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
            required
          />
        </label>
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <Button className="w-full" disabled={saving || !profileIsComplete({ handle, firstName, profileEmail })} onClick={() => void onSave()}>
          {saving ? t(locale, "accountWait") : t(locale, "saveProfile")}
        </Button>
      </section>
    </div>
  );
}

export function ProfileHeaderActions() {
  const locale = useAppStore((s) => s.locale);
  const handle = useAppStore((s) => s.handle);
  const { user, isPending } = useCurrentUserState();
  if (isPending || !user) return null;

  async function onShare() {
    if (!handle) {
      const id = toast.error(t(locale, "handleMissing"));
      window.setTimeout(() => toast.dismiss(id), 2000);
      return;
    }
    const url = `${window.location.origin}/u/${handle}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: `@${handle}`, url });
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      /* copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      const id = toast.success(t(locale, "profileCopied"));
      window.setTimeout(() => toast.dismiss(id), 2000);
    } catch {
      const id = toast.error(t(locale, "copyProfile"));
      window.setTimeout(() => toast.dismiss(id), 2000);
    }
  }

  return (
    <div className="flex items-center">
      <Button variant="ghost" size="icon" aria-label={t(locale, "copyProfile")} onClick={() => void onShare()}>
        <Share2 className="size-5" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={t(locale, "editProfile")} asChild>
        <Link to="/profile/edit">
          <Pencil className="size-5" />
        </Link>
      </Button>
    </div>
  );
}
