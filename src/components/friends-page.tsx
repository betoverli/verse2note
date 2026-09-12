import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProfileAvatar } from "@/lib/avatars";
import { t } from "@/lib/i18n";
import {
  acceptLink,
  declineLink,
  listLinks,
  requestLink,
  searchPeople,
  type LinkPerson,
} from "@/lib/links";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function label(person: LinkPerson) {
  const name = [person.firstName, person.lastName].filter(Boolean).join(" ");
  return name || `@${person.handle}`;
}

function PersonRow({
  person,
  children,
}: {
  person: LinkPerson;
  children?: ReactNode;
}) {
  return (
    <li className="flex min-h-12 items-center gap-3 rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
      <Link to="/u/$handle" params={{ handle: person.handle }} className="flex min-w-0 flex-1 items-center gap-3 text-fg">
        <ProfileAvatar id={person.avatarId} url={person.avatarUrl} className="size-9 bg-elevated" iconClassName="size-4" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{label(person)}</span>
          {person.handle ? <span className="block truncate text-xs text-muted">@{person.handle}</span> : null}
        </span>
      </Link>
      {children}
    </li>
  );
}

export function FriendsPage() {
  const locale = useAppStore((s) => s.locale);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<LinkPerson[]>([]);
  const [friends, setFriends] = useState<LinkPerson[]>([]);
  const [incoming, setIncoming] = useState<LinkPerson[]>([]);
  const [outgoing, setOutgoing] = useState<LinkPerson[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    const data = await listLinks();
    setFriends(data.friends);
    setIncoming(data.incoming);
    setOutgoing(data.outgoing);
  }

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void searchPeople({ data: { q } })
        .then(setHits)
        .catch(() => setHits([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  function flash(ok: boolean) {
    const id = ok ? toast.success(t(locale, "linkRequested")) : toast.error(t(locale, "linkSendFail"));
    window.setTimeout(() => toast.dismiss(id), 2000);
  }

  async function onRequest(handle: string) {
    if (busy) return;
    setBusy(handle);
    const result = await requestLink({ data: { handle } });
    setBusy(null);
    flash(Boolean(result?.ok));
    setQuery("");
    setHits([]);
    await refresh();
  }

  async function onAccept(handle: string) {
    setBusy(handle);
    await acceptLink({ data: { handle } });
    setBusy(null);
    await refresh();
  }

  async function onDecline(handle: string) {
    setBusy(handle);
    await declineLink({ data: { handle } });
    setBusy(null);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "linkSearch")}</h2>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(locale, "linkSearchHint")}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {hits.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {hits.map((person) => (
              <PersonRow key={person.userId} person={person}>
                <Button size="sm" disabled={busy === person.handle} onClick={() => void onRequest(person.handle)}>
                  {t(locale, "linkConnect")}
                </Button>
              </PersonRow>
            ))}
          </ul>
        ) : query.trim().length >= 2 ? (
          <p className="text-sm text-muted">{t(locale, "linkNoResults")}</p>
        ) : null}
      </section>

      {incoming.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "linkIncoming")}</h2>
          <ul className="flex flex-col gap-2">
            {incoming.map((person) => (
              <PersonRow key={person.userId} person={person}>
                <Button size="sm" disabled={busy === person.handle} onClick={() => void onAccept(person.handle)}>
                  {t(locale, "linkAccept")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted"
                  disabled={busy === person.handle}
                  onClick={() => void onDecline(person.handle)}
                >
                  {t(locale, "linkDecline")}
                </Button>
              </PersonRow>
            ))}
          </ul>
        </section>
      ) : null}

      {outgoing.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "linkOutgoing")}</h2>
          <ul className="flex flex-col gap-2">
            {outgoing.map((person) => (
              <PersonRow key={person.userId} person={person}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted"
                  disabled={busy === person.handle}
                  onClick={() => void onDecline(person.handle)}
                >
                  {t(locale, "linkCancel")}
                </Button>
              </PersonRow>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "friends")}</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-muted">{t(locale, "linkNone")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {friends.map((person) => (
              <PersonRow key={person.userId} person={person}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted"
                  disabled={busy === person.handle}
                  onClick={() => void onDecline(person.handle)}
                >
                  {t(locale, "linkRemove")}
                </Button>
              </PersonRow>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
