import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { t } from "@/lib/i18n";
import {
  createNotebookGroup,
  listMyGroups,
  searchListedGroups,
  type NotebookGroup,
} from "@/lib/notebook-groups";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Choice } from "@/components/choice";

function GroupRow({ item }: { item: NotebookGroup }) {
  const locale = useAppStore((s) => s.locale);
  const pending = item.myStatus === "pending";
  return (
    <Link
      to="/notebook/g/$id"
      params={{ id: item.id }}
      className="flex min-h-16 items-center gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)]"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.name}</span>
        <span className="mt-0.5 block text-xs text-muted">
          {item.visibility === "listed" ? t(locale, "notebookGroupListed") : t(locale, "notebookGroupPrivate")}
          {" · "}
          {item.memberCount}
          {pending ? ` · ${t(locale, "notebookGroupPending")}` : null}
        </span>
      </span>
    </Link>
  );
}

export function NotebookGroupsHome({ query }: { query: string }) {
  const locale = useAppStore((s) => s.locale);
  const { user } = useCurrentUserState();
  const navigate = useNavigate();
  const [mine, setMine] = useState<NotebookGroup[] | null>(null);
  const [found, setFound] = useState<NotebookGroup[]>([]);
  const [create, setCreate] = useState(false);
  const [name, setName] = useState("");
  const [listed, setListed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    void listMyGroups()
      .then(setMine)
      .catch(() => setMine([]));
  }, [user]);

  useEffect(() => {
    if (!user || query.trim().length < 2) {
      setFound([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void searchListedGroups({ data: { query } })
        .then(setFound)
        .catch(() => setFound([]));
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, user]);

  async function make() {
    if (busy) return;
    const title = name.trim();
    if (title.length < 2) return;
    setBusy(true);
    try {
      const result = await createNotebookGroup({
        data: { name: title, visibility: listed ? "listed" : "private" },
      });
      if (!result?.ok || !result.id) {
        toast.error(t(locale, "linkSendFail"));
        return;
      }
      setCreate(false);
      setName("");
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      void navigate({ to: "/notebook/g/$id", params: { id: result.id } });
    } catch {
      toast.error(t(locale, "linkSendFail"));
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return <p className="text-sm text-muted">{t(locale, "notebookGroupLogin")}</p>;
  }

  const mineIds = new Set((mine ?? []).map((item) => item.id));
  const extra = found.filter((item) => !mineIds.has(item.id));
  const accepted = (mine ?? []).filter((item) => item.myStatus === "accepted");
  const pending = (mine ?? []).filter((item) => item.myStatus === "pending");

  return (
    <div className="flex flex-col gap-6">
      {create ? (
        <form
          className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]"
          onSubmit={(event) => {
            event.preventDefault();
            void make();
          }}
        >
          <p className="mb-3 text-sm font-medium text-fg">{t(locale, "notebookGroupNew")}</p>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t(locale, "notebookGroupName")}
            maxLength={60}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={false}
            enterKeyHint="done"
            className="h-12 w-full rounded-md bg-bg px-3 text-base text-fg outline-none"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Choice active={!listed} title={t(locale, "notebookGroupPrivate")} onClick={() => setListed(false)} />
            <Choice active={listed} title={t(locale, "notebookGroupListed")} onClick={() => setListed(true)} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setCreate(false)}>
              {t(locale, "linkCancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={busy || name.trim().length < 2}>
              {t(locale, "notebookGroupCreate")}
            </Button>
          </div>
        </form>
      ) : null}
      {mine == null ? <div className="h-20 rounded-lg bg-surface" aria-hidden /> : null}
      {accepted.length === 0 && pending.length === 0 && mine && !create ? (
        <p className="text-sm text-muted">{t(locale, "notebookGroupEmpty")}</p>
      ) : null}
      {accepted.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {accepted.map((item) => (
            <li key={item.id}>
              <GroupRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}
      {pending.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {pending.map((item) => (
            <li key={item.id}>
              <GroupRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}
      {extra.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {extra.map((item) => (
            <li key={item.id}>
              <GroupRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}
      {create ? null : (
        <Button
          className="fixed right-4 z-20 size-12 rounded-full"
          style={{ bottom: "calc(var(--tab-bar-height) + 1rem)" }}
          onClick={() => setCreate(true)}
          aria-label={t(locale, "notebookGroupNew")}
        >
          <Plus />
        </Button>
      )}
    </div>
  );
}
