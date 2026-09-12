import { useState } from "react";
import { SPEAKER_COLORS, newNoteId, type Speaker } from "@/lib/notebook";
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
  onPick: (speaker: Speaker) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const speakers = useAppStore((s) => s.speakers);
  const [name, setName] = useState("");

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const color = SPEAKER_COLORS[speakers.length % SPEAKER_COLORS.length]!;
    onPick({
      id: newNoteId(),
      name: trimmed.slice(0, 40),
      color,
      updatedAt: new Date().toISOString(),
    });
    setName("");
    onClose();
  }

  if (!open) return null;

  return (
    <ViewportSheet onClose={onClose}>
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-t-xl bg-elevated p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-border)] sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-medium text-fg">{t(locale, "notebookAddSpeaker")}</p>
        <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto">
          {speakers.map((speaker) => (
            <li key={speaker.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(speaker);
                  onClose();
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-md px-2 text-left text-fg hover:bg-surface"
              >
                <span className="size-8 rounded-full" style={{ background: speaker.color }} />
                <span className="text-sm font-medium">{speaker.name}</span>
              </button>
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
