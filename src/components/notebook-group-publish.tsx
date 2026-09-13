import { useEffect, useState } from "react";
import { Users } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { ViewportSheet } from "@/components/viewport-sheet";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function NotebookGroupPublish({ note }: { note: Note }) {
  const locale = useAppStore((s) => s.locale);
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<(NotebookGroup & { published: boolean })[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    void listNoteGroups({ data: { noteId: note.id } })
      .then(setRows)
      .catch(() => setRows([]));
  }, [open, user, note.id]);

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
    setRows((list) => list.map((row) => (row.id === item.id ? { ...row, published: !item.published } : row)));
  }

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-12 text-fg [&_svg]:size-6"
        aria-label={t(locale, "notebookGroupPublish")}
        onClick={() => setOpen(true)}
      >
        <Users />
      </Button>
      {open ? (
        <ViewportSheet onClose={() => setOpen(false)}>
          <div
            className="max-h-full w-full max-w-sm overflow-y-auto rounded-t-xl bg-elevated p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-3 text-sm font-medium text-fg">{t(locale, "notebookGroupPublish")}</p>
            {rows.length === 0 ? (
              <p className="text-sm text-muted">{t(locale, "notebookGroupEmpty")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {rows.map((item) => {
                  const locked = item.postPolicy === "admins" && item.myRole !== "admin";
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        disabled={Boolean(busy) || (locked && !item.published)}
                        onClick={() => void toggle(item)}
                        className="flex min-h-12 w-full items-center justify-between rounded-md bg-surface px-4 text-left text-sm text-fg disabled:opacity-40"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="text-xs text-muted">
                          {item.published ? t(locale, "notebookGroupPublished") : locked ? t(locale, "notebookGroupPostAdmins") : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ViewportSheet>
      ) : null}
    </>
  );
}
