import { useEffect, useState } from "react";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import type { Note } from "@/lib/notebook";
import {
  listNoteGroups,
  publishNoteToGroup,
  unpublishNoteFromGroup,
  type NotebookGroup,
} from "@/lib/notebook-groups";
import { flushOutbox } from "@/lib/outbox";
import { useAppStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function NotebookGroupPublishList({ note }: { note: Note }) {
  const locale = useAppStore((s) => s.locale);
  const { user } = useCurrentUserState();
  const [rows, setRows] = useState<(NotebookGroup & { published: boolean })[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void listNoteGroups({ data: { noteId: note.id } })
      .then(setRows)
      .catch(() => setRows([]));
  }, [user, note.id]);

  async function toggle(item: NotebookGroup & { published: boolean }) {
    if (busy) return;
    setBusy(item.id);
    await flushOutbox();
    const result = item.published
      ? await unpublishNoteFromGroup({ data: { groupId: item.id, noteId: note.id } })
      : await publishNoteToGroup({ data: { groupId: item.id, note } });
    setBusy(null);
    if (!result?.ok) {
      toast.error(t(locale, "linkSendFail"));
      return;
    }
    setRows((list) => (list ?? []).map((row) => (row.id === item.id ? { ...row, published: !item.published } : row)));
  }

  if (!user) return null;

  return (
    <section className="min-w-0">
      <h3 className="ios-caption mb-2">{t(locale, "notebookGroupPublish")}</h3>
      {rows == null ? <div className="ios-group h-12" aria-hidden /> : null}
      {rows && rows.length === 0 ? <p className="ios-caption">{t(locale, "notebookGroupEmpty")}</p> : null}
      {rows && rows.length > 0 ? (
        <ul className="ios-group">
          {rows.map((item) => {
            const locked = item.postPolicy === "admins" && item.myRole !== "admin";
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={Boolean(busy) || (locked && !item.published)}
                  onClick={() => void toggle(item)}
                  className="flex min-h-[52px] w-full min-w-0 items-center justify-between gap-3 px-4 text-left text-[17px] text-fg active:bg-fill disabled:opacity-40"
                >
                  <span className="min-w-0 truncate">{item.name}</span>
                  <span className="shrink-0 text-[15px] text-muted">
                    {item.published ? t(locale, "notebookGroupPublished") : locked ? t(locale, "notebookGroupPostAdmins") : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
