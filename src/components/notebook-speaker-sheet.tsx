import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SPEAKER_COLORS, newNoteId, noteSpeakerIds, type Speaker } from "@/lib/notebook";
import { deleteLocalSpeaker, upsertLocalSpeaker } from "@/lib/notebook-local";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewportSheet } from "@/components/viewport-sheet";

export function NotebookSpeakerSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick?: (speaker: Speaker) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const speakers = useAppStore((s) => s.speakers);
  const notes = useAppStore((s) => s.notes);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function used(id: string) {
    return notes.some((note) => noteSpeakerIds(note).includes(id));
  }

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const color = SPEAKER_COLORS[speakers.length % SPEAKER_COLORS.length]!;
    const speaker = upsertLocalSpeaker({
      id: newNoteId(),
      name: trimmed.slice(0, 40),
      color,
      updatedAt: new Date().toISOString(),
    });
    setName("");
    if (onPick) {
      onPick(speaker);
      onClose();
    }
  }

  function saveName(speaker: Speaker) {
    const trimmed = draft.trim().slice(0, 40);
    setEditing(null);
    if (!trimmed || trimmed === speaker.name) return;
    upsertLocalSpeaker({ ...speaker, name: trimmed });
  }

  if (!open) return null;

  return (
    <ViewportSheet onClose={onClose}>
      <div
        className="sheet-invert max-h-full w-full max-w-md overflow-y-auto rounded-t-xl p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-border)] sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-medium text-fg">
          {onPick ? t(locale, "notebookAddSpeaker") : t(locale, "notebookSpeakers")}
        </p>
        <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto">
          {speakers.map((speaker) => (
            <li key={speaker.id} className="flex items-center gap-1">
              {editing === speaker.id ? (
                <form
                  className="flex min-w-0 flex-1 items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveName(speaker);
                  }}
                >
                  <span className="size-8 shrink-0 rounded-full" style={{ background: speaker.color }} />
                  <Input
                    value={draft}
                    autoFocus
                    maxLength={40}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={() => saveName(speaker)}
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onPick) {
                      onPick(speaker);
                      onClose();
                      return;
                    }
                    setEditing(speaker.id);
                    setDraft(speaker.name);
                  }}
                  className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-md px-2 text-left text-fg hover:bg-surface"
                >
                  <span className="size-8 shrink-0 rounded-full" style={{ background: speaker.color }} />
                  <span className="truncate text-sm font-medium">{speaker.name}</span>
                </button>
              )}
              {editing === speaker.id ? null : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 text-muted"
                  aria-label={t(locale, "notebookRenameSpeaker")}
                  onClick={() => {
                    setEditing(speaker.id);
                    setDraft(speaker.name);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
              )}
              {used(speaker.id) ? null : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 text-[#8b3a32]"
                  aria-label={t(locale, "notebookDeleteSpeaker")}
                  onClick={() => {
                    if (!confirm(t(locale, "notebookDeleteSpeakerAsk"))) return;
                    deleteLocalSpeaker(speaker.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            add();
          }}
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t(locale, "notebookSpeakerName")}
            maxLength={40}
          />
          <Button type="submit">{t(locale, "notebookSaveSpeaker")}</Button>
        </form>
      </div>
    </ViewportSheet>
  );
}
