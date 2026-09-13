import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ProfileAvatar } from "@/lib/avatars";
import { t } from "@/lib/i18n";
import { createLocalNote } from "@/lib/notebook-local";
import {
  decideGroupMember,
  deleteNotebookGroup,
  getNotebookGroup,
  leaveNotebookGroup,
  listGroupMembers,
  listGroupNotes,
  publishNoteToGroup,
  requestGroupJoin,
  setGroupMemberRole,
  updateNotebookGroup,
  type GroupMember,
  type GroupNoteCard,
  type NotebookGroup,
} from "@/lib/notebook-groups";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Choice } from "@/components/choice";
import { ViewportSheet } from "@/components/viewport-sheet";
import { flushOutbox } from "@/lib/outbox";

function formatDay(iso: string, locale: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(locale === "en" ? "en" : locale === "es" ? "es" : "pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function NotebookGroupDetail({ id }: { id: string }) {
  const locale = useAppStore((s) => s.locale);
  const handle = useAppStore((s) => s.handle);
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [group, setGroup] = useState<NotebookGroup | null | undefined>(undefined);
  const [notes, setNotes] = useState<GroupNoteCard[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [settings, setSettings] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  }, [id]);

  const reload = useCallback(async () => {
    try {
      const next = await getNotebookGroup({ data: { id } });
      setGroup(next);
      if (next?.myStatus === "accepted") {
        const [noteRows, people] = await Promise.all([listGroupNotes({ data: { id } }), listGroupMembers({ data: { id } })]);
        setNotes(noteRows);
        setMembers(people);
      } else {
        setNotes([]);
        setMembers([]);
      }
    } catch {
      setGroup(null);
    }
  }, [id]);

  useEffect(() => {
    if (isPending) return;
    if (!user) return;
    void reload();
  }, [user, isPending, reload]);

  const admin = group?.myRole === "admin" && group.myStatus === "accepted";
  const member = group?.myStatus === "accepted";
  const canPost = member && (group.postPolicy === "members" || admin);
  const pending = members.filter((item) => item.status === "pending");
  const accepted = members.filter((item) => item.status === "accepted");

  async function join() {
    if (busy) return;
    setBusy(true);
    await requestGroupJoin({ data: { id } });
    await reload();
    setBusy(false);
  }

  async function openNew() {
    if (!canPost || busy) return;
    setBusy(true);
    try {
      const note = createLocalNote();
      await flushOutbox();
      await publishNoteToGroup({ data: { groupId: id, note } });
      void navigate({ to: "/notebook/$id", params: { id: note.id } });
    } finally {
      setBusy(false);
    }
  }

  if (isPending && !user) {
    return (
      <main className="mx-auto flex min-h-lvh w-full max-w-3xl flex-col px-4 pt-0 sm:px-6">
        <AppHeader title={t(locale, "notebookGroups")} backTo="/notebook" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-lvh w-full max-w-3xl flex-col gap-4 px-4 pt-0 pb-[calc(var(--tab-bar-height)+2rem)] sm:px-6">
        <AppHeader title={t(locale, "notebookGroups")} backTo="/notebook" />
        <p className="text-sm text-muted">{t(locale, "notebookGroupLogin")}</p>
      </main>
    );
  }

  if (group === undefined) {
    return (
      <main className="mx-auto flex min-h-lvh w-full max-w-3xl flex-col px-4 pt-0 sm:px-6">
        <AppHeader title={t(locale, "notebookGroups")} backTo="/notebook" />
      </main>
    );
  }

  if (!group) {
    return (
      <main className="mx-auto flex min-h-lvh w-full max-w-3xl flex-col gap-4 px-4 pt-0 sm:px-6">
        <AppHeader title={t(locale, "notebookGroups")} backTo="/notebook" />
        <p className="text-sm text-muted">{t(locale, "notebookGroupEmpty")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-lvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+5rem)] sm:px-6">
      <AppHeader
        title={group.name}
        backTo="/notebook"
        trailing={
          admin ? (
            <Button variant="ghost" size="icon" className="size-12 text-fg [&_svg]:size-6" aria-label={t(locale, "settings")} onClick={() => setSettings(true)}>
              <Settings />
            </Button>
          ) : null
        }
      />
      <p className="text-sm text-muted">
        {group.visibility === "listed" ? t(locale, "notebookGroupListed") : t(locale, "notebookGroupPrivate")}
        {" · "}
        {group.memberCount} {t(locale, "notebookGroupMembers")}
      </p>
      {group.description ? <p className="text-sm text-fg">{group.description}</p> : null}

      {!member ? (
        group.myStatus === "pending" ? (
          <p className="text-sm text-muted">{t(locale, "notebookGroupPending")}</p>
        ) : (
          <Button disabled={busy} onClick={() => void join()}>
            {t(locale, "notebookGroupJoin")}
          </Button>
        )
      ) : null}

      {member ? (
        <>
          {admin && pending.length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "notebookGroupRequests")}</h2>
              <ul className="flex flex-col gap-2">
                {pending.map((item) => (
                  <li key={item.userId} className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
                    <ProfileAvatar id={item.avatarId} url={item.avatarUrl} className="size-8" />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {item.firstName || item.handle} {item.lastName}
                    </span>
                    <button type="button" className="text-xs text-accent" onClick={() => void decideGroupMember({ data: { id, userId: item.userId, accept: true } }).then(reload)}>
                      {t(locale, "notebookGroupAccept")}
                    </button>
                    <button type="button" className="text-xs text-muted" onClick={() => void decideGroupMember({ data: { id, userId: item.userId, accept: false } }).then(reload)}>
                      {t(locale, "notebookGroupDecline")}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="space-y-2">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "notebookGroupNotes")}</h2>
            {notes.length === 0 ? (
              <p className="text-sm text-muted">{t(locale, "notebookEmpty")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {notes.map((item) => {
                  const mine = item.author.handle === handle;
                  return (
                    <li key={item.note.id}>
                      <Link
                        to={mine ? "/notebook/$id" : "/n/$id"}
                        params={{ id: item.note.id }}
                        className="flex min-h-16 items-center gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)]"
                      >
                        <span className="w-14 shrink-0 text-[11px] font-medium tracking-wide text-muted uppercase">
                          {formatDay(item.note.happenedAt, locale)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{item.note.title || t(locale, "notebookMeeting")}</span>
                          <span className="text-xs text-muted">@{item.author.handle || item.author.firstName}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "notebookGroupMembers")}</h2>
            <ul className="flex flex-col gap-2">
              {accepted.map((item) => (
                <li key={item.userId} className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
                  <ProfileAvatar id={item.avatarId} url={item.avatarUrl} className="size-8" />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {item.firstName || item.handle} {item.lastName}
                    {item.role === "admin" ? <span className="ml-2 text-[11px] uppercase text-muted">admin</span> : null}
                  </span>
                  {admin && item.handle !== handle ? (
                    <button
                      type="button"
                      className="text-xs text-muted"
                      onClick={() =>
                        void setGroupMemberRole({
                          data: { id, userId: item.userId, role: item.role === "admin" ? "member" : "admin" },
                        }).then(reload)
                      }
                    >
                      {item.role === "admin" ? t(locale, "notebookGroupMakeMember") : t(locale, "notebookGroupMakeAdmin")}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {canPost ? (
        <Button className="fixed right-4 z-20 size-12 rounded-full" style={{ bottom: "calc(var(--tab-bar-height) + 1rem)" }} onClick={() => void openNew()} aria-label={t(locale, "notebookNew")}>
          <Plus />
        </Button>
      ) : null}

      {settings && group ? (
        <GroupSettings
          group={group}
          onClose={() => setSettings(false)}
          onSaved={reload}
          onLeft={() => void navigate({ to: "/notebook" })}
        />
      ) : null}
    </main>
  );
}

function GroupSettings({
  group,
  onClose,
  onSaved,
  onLeft,
}: {
  group: NotebookGroup;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onLeft: () => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [listed, setListed] = useState(group.visibility === "listed");
  const [adminsOnly, setAdminsOnly] = useState(group.postPolicy === "admins");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    setBusy(true);
    await updateNotebookGroup({
      data: {
        id: group.id,
        name,
        description,
        visibility: listed ? "listed" : "private",
        postPolicy: adminsOnly ? "admins" : "members",
      },
    });
    await onSaved();
    setBusy(false);
    onClose();
  }

  return (
    <ViewportSheet onClose={onClose}>
      <div
        className="max-h-full w-full max-w-sm overflow-y-auto rounded-t-xl bg-elevated p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-3 text-sm font-medium text-fg">{t(locale, "settings")}</p>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mb-2 h-12 w-full rounded-md bg-surface px-3 text-base text-fg outline-none"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t(locale, "notebookGroupAbout")}
          rows={3}
          className="mb-3 w-full rounded-md bg-surface px-3 py-2 text-base text-fg outline-none"
        />
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Choice active={!listed} title={t(locale, "notebookGroupPrivate")} onClick={() => setListed(false)} />
          <Choice active={listed} title={t(locale, "notebookGroupListed")} onClick={() => setListed(true)} />
        </div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "notebookGroupPostPolicy")}</p>
        <div className="mb-4 grid grid-cols-1 gap-2">
          <Choice active={!adminsOnly} title={t(locale, "notebookGroupPostMembers")} onClick={() => setAdminsOnly(false)} />
          <Choice active={adminsOnly} title={t(locale, "notebookGroupPostAdmins")} onClick={() => setAdminsOnly(true)} />
        </div>
        <Button className="w-full" disabled={busy} onClick={() => void save()}>
          {t(locale, "saveProfile")}
        </Button>
        <Button
          className="mt-2 w-full"
          variant="ghost"
          onClick={() =>
            void leaveNotebookGroup({ data: { id: group.id } }).then((result) => {
              if (result?.ok) onLeft();
            })
          }
        >
          {t(locale, "notebookGroupLeave")}
        </Button>
        <Button
          className="mt-1 w-full text-[#8b3a32]"
          variant="ghost"
          onClick={() => {
            if (!confirm(t(locale, "notebookGroupDeleteAsk"))) return;
            void deleteNotebookGroup({ data: { id: group.id } }).then((result) => {
              if (result?.ok) onLeft();
            });
          }}
        >
          {t(locale, "notebookGroupDelete")}
        </Button>
      </div>
    </ViewportSheet>
  );
}
