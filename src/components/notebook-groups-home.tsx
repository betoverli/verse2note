import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, Lock, Plus } from "lucide-react";
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
import { peekMyGroups, setMyGroupsCache, upsertMyGroup } from "@/lib/groups-cache";
import { useAppStore } from "@/lib/store";
import { ViewportFixed } from "@/components/viewport-fixed";
import { useNativeFab } from "@/lib/native/use-native-fab";
import { runNativeNewGroup } from "@/lib/native/new-group";
import { isNativeApp } from "@/lib/native/runtime";
import { Button } from "@/components/ui/button";
import { OptionPicker } from "@/components/native-option-picker";
import { SheetGrabber, ViewportSheet, formSheetClass } from "@/components/viewport-sheet";
import { cn } from "@/lib/utils";

function GroupRow({ item }: { item: NotebookGroup }) {
  const locale = useAppStore((s) => s.locale);
  const pending = item.myStatus === "pending";
  return (
    <Link
      to="/groups/$id"
      params={{ id: item.id }}
      className="flex min-h-11 items-center gap-3 px-4 py-3 text-fg active:bg-fill"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px]">{item.name}</span>
        <span className="mt-0.5 block text-[13px] text-muted">
          {item.memberCount}
          {pending ? ` · ${t(locale, "notebookGroupPending")}` : null}
        </span>
      </span>
      {item.visibility === "listed" ? (
        <Globe className="size-4 shrink-0 text-muted" aria-label={t(locale, "notebookGroupListed")} />
      ) : (
        <Lock className="size-4 shrink-0 text-muted" aria-label={t(locale, "notebookGroupPrivate")} />
      )}
    </Link>
  );
}

export function NotebookGroupsHome({ query }: { query: string }) {
  const locale = useAppStore((s) => s.locale);
  const { user } = useCurrentUserState();
  const navigate = useNavigate();
  const [mine, setMine] = useState<NotebookGroup[] | null>(() => (user?.id ? peekMyGroups(user.id) : null));
  const [found, setFound] = useState<NotebookGroup[]>([]);
  const [create, setCreate] = useState(false);
  const [name, setName] = useState("");
  const [listed, setListed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setMine(null);
      return;
    }
    const uid = user.id;
    const cached = peekMyGroups(uid);
    if (cached) setMine(cached);
    let live = true;
    function refresh() {
      void listMyGroups()
        .then((rows) => {
          if (!live) return;
          setMyGroupsCache(uid, rows);
          setMine(rows);
        })
        .catch(() => {
          if (live && peekMyGroups(uid) == null) setMine([]);
        });
    }
    refresh();
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", refresh);
    return () => {
      live = false;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", refresh);
    };
  }, [user?.id]);

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

  async function makeWith(title: string, isListed: boolean) {
    if (busy) return;
    if (title.trim().length < 2) return;
    setBusy(true);
    try {
      const result = await createNotebookGroup({
        data: { name: title.trim(), visibility: isListed ? "listed" : "private" },
      });
      if (!result?.ok || !result.id) {
        toast.error(t(locale, "linkSendFail"));
        return;
      }
      if (user) {
        upsertMyGroup(user.id, {
          id: result.id,
          name: title.trim(),
          description: "",
          visibility: isListed ? "listed" : "private",
          postPolicy: "members",
          createdBy: user.id,
          memberCount: 1,
          myRole: "admin",
          myStatus: "accepted",
          updatedAt: new Date().toISOString(),
        });
      }
      setCreate(false);
      setName("");
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      void navigate({ to: "/groups/$id", params: { id: result.id } });
    } catch {
      toast.error(t(locale, "linkSendFail"));
    } finally {
      setBusy(false);
    }
  }

  async function openCreate() {
    if (!isNativeApp()) {
      setCreate(true);
      return;
    }
    const result = await runNativeNewGroup(locale);
    if (result.type === "web-fallback") {
      setCreate(true);
      return;
    }
    if (result.type === "cancelled") return;
    await makeWith(result.name, result.listed);
  }

  useNativeFab(t(locale, "notebookGroupNew"), () => void openCreate(), Boolean(user));

  async function make() {
    await makeWith(name, listed);
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
        <ViewportSheet onClose={() => setCreate(false)}>
          <form
            className={cn(formSheetClass, "px-4")}
            onSubmit={(event) => {
              event.preventDefault();
              void make();
            }}
          >
            <SheetGrabber />
            <p className="mb-4 text-center text-[17px] font-semibold text-fg">{t(locale, "notebookGroupNew")}</p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t(locale, "notebookGroupName")}
              maxLength={60}
              name="group-title"
              inputMode="text"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
              enterKeyHint="done"
              className="h-12 w-full rounded-[12px] bg-surface px-3 text-[17px] text-fg outline-none"
            />
            <div className="mt-3">
              <OptionPicker
                label={t(locale, "notebookGroupNew")}
                value={listed ? "listed" : "private"}
                valueLabel={listed ? t(locale, "notebookGroupListed") : t(locale, "notebookGroupPrivate")}
                columns={2}
                options={[
                  { id: "private", title: t(locale, "notebookGroupPrivate"), symbol: "lock.fill" },
                  { id: "listed", title: t(locale, "notebookGroupListed"), symbol: "globe" },
                ]}
                onChange={(id) => setListed(id === "listed")}
              />
            </div>
            <Button type="submit" className="mt-4 w-full" disabled={busy || name.trim().length < 2}>
              {t(locale, "notebookGroupCreate")}
            </Button>
            <button
              type="button"
              className="mt-1 flex min-h-11 w-full items-center justify-center text-[17px] font-semibold text-accent active:opacity-60"
              onClick={() => setCreate(false)}
            >
              {t(locale, "linkCancel")}
            </button>
          </form>
        </ViewportSheet>
      ) : null}
      {mine == null ? <div className="h-20 rounded-lg bg-surface" aria-hidden /> : null}
      {accepted.length === 0 && pending.length === 0 && mine ? (
        <p className="text-sm text-muted">{t(locale, "notebookGroupEmpty")}</p>
      ) : null}
      {accepted.length > 0 ? (
        <ul className="ios-group">
          {accepted.map((item) => (
            <li key={item.id}>
              <GroupRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}
      {pending.length > 0 ? (
        <ul className="ios-group">
          {pending.map((item) => (
            <li key={item.id}>
              <GroupRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}
      {extra.length > 0 ? (
        <ul className="ios-group">
          {extra.map((item) => (
            <li key={item.id}>
              <GroupRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}
      <ViewportFixed>
        <Button
          className="native-fab fixed right-4 z-20 size-14 rounded-full shadow-[0_8px_20px_rgb(0_0_0/0.22)]"
          style={{ bottom: "calc(var(--tab-bar-height) + 1rem)" }}
          onClick={() => void openCreate()}
          aria-label={t(locale, "notebookGroupNew")}
        >
          <Plus />
        </Button>
      </ViewportFixed>
    </div>
  );
}
