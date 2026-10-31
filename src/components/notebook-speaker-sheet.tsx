import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SPEAKER_COLORS, newNoteId, noteSpeakerIds, type Speaker } from "@/lib/notebook";
import { deleteLocalSpeaker, upsertLocalSpeaker } from "@/lib/notebook-local";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionSheet, SheetGrabber, ViewportSheet, formSheetClass } from "@/components/viewport-sheet";
import {
  canUseNativeMenus,
  FORCE_WEB_FALLBACK_MS,
  presentNativeMenu,
  presentNativePrompt,
  rectFromElement,
} from "@/lib/native/menus";
import { isNativeApp } from "@/lib/native/runtime";
import { cn } from "@/lib/utils";

const ADD_ID = "__add__";

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
  const [dropId, setDropId] = useState<string | null>(null);
  const [web, setWeb] = useState(() => !isNativeApp());
  const started = useRef(false);

  function used(id: string) {
    return notes.some((note) => noteSpeakerIds(note).includes(id));
  }

  function addFromName(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const color = SPEAKER_COLORS[speakers.length % SPEAKER_COLORS.length]!;
    return upsertLocalSpeaker({
      id: newNoteId(),
      name: trimmed.slice(0, 40),
      color,
      updatedAt: new Date().toISOString(),
    });
  }

  function add() {
    const speaker = addFromName(name);
    if (!speaker) return;
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

  useEffect(() => {
    if (!open) {
      started.current = false;
      setWeb(!isNativeApp());
      return;
    }
    if (!isNativeApp() || started.current) return;
    started.current = true;
    let alive = true;
    let handedToNative = false;
    const forceWeb = window.setTimeout(() => {
      if (!alive || handedToNative) return;
      console.warn("[NotebookSpeakerSheet] force web fallback after", FORCE_WEB_FALLBACK_MS, "ms");
      setWeb(true);
    }, FORCE_WEB_FALLBACK_MS);
    const clearForceWeb = () => window.clearTimeout(forceWeb);
    void (async () => {
      if (!(await canUseNativeMenus())) {
        clearForceWeb();
        if (alive) setWeb(true);
        return;
      }
      const items = [
        ...speakers.map((speaker) => ({
          id: speaker.id,
          title: speaker.name,
          symbol: "person.fill" as string | undefined,
        })),
        {
          id: ADD_ID,
          title: t(locale, "notebookSaveSpeaker"),
          symbol: "plus",
        },
      ];
      const result = await presentNativeMenu(
        {
          style: "sheet",
          title: onPick ? t(locale, "notebookAddSpeaker") : t(locale, "notebookSpeakers"),
          cancelLabel: t(locale, "linkCancel"),
          anchor: rectFromElement(null),
          items,
        },
        { onPresented: clearForceWeb },
      );
      clearForceWeb();
      if (!alive) return;
      if (result.failed) {
        setWeb(true);
        return;
      }
      handedToNative = true;
      if (result.cancelled || !result.id) {
        onClose();
        return;
      }
      if (result.id === ADD_ID) {
        const prompted = await presentNativePrompt({
          title: t(locale, "notebookAddSpeaker"),
          cancelLabel: t(locale, "linkCancel"),
          okLabel: t(locale, "notebookSaveSpeaker"),
          placeholder: t(locale, "notebookSpeakerName"),
        });
        if (!alive) return;
        if (prompted.failed) {
          setWeb(true);
          return;
        }
        if (!prompted.value) {
          onClose();
          return;
        }
        const speaker = addFromName(prompted.value);
        if (speaker && onPick) onPick(speaker);
        onClose();
        return;
      }
      const speaker = speakers.find((item) => item.id === result.id);
      if (!speaker) {
        onClose();
        return;
      }
      if (onPick) {
        onPick(speaker);
        onClose();
        return;
      }
      // Manage mode: rename / delete unused.
      const manage = await presentNativeMenu({
        style: "sheet",
        title: speaker.name,
        cancelLabel: t(locale, "linkCancel"),
        anchor: rectFromElement(null),
        items: [
          { id: "rename", title: t(locale, "notebookRenameSpeaker"), symbol: "pencil" },
          ...(!used(speaker.id)
            ? [{ id: "delete", title: t(locale, "notebookDeleteSpeaker"), symbol: "trash", destructive: true }]
            : []),
        ],
      });
      if (!alive) return;
      if (manage.failed) {
        setWeb(true);
        return;
      }
      if (manage.id === "rename") {
        const prompted = await presentNativePrompt({
          title: t(locale, "notebookRenameSpeaker"),
          cancelLabel: t(locale, "linkCancel"),
          okLabel: t(locale, "collectionDone"),
          defaultValue: speaker.name,
          placeholder: t(locale, "notebookSpeakerName"),
        });
        if (!alive) return;
        if (prompted.failed) {
          setWeb(true);
          return;
        }
        const trimmed = (prompted.value ?? "").trim().slice(0, 40);
        if (trimmed && trimmed !== speaker.name) {
          upsertLocalSpeaker({ ...speaker, name: trimmed });
        }
      } else if (manage.id === "delete") {
        deleteLocalSpeaker(speaker.id);
      }
      onClose();
    })();
    return () => {
      alive = false;
      clearForceWeb();
    };
    // Speakers snapshot at open is intentional — remount when `open` flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  if (!web) return null;

  return (
    <ViewportSheet onClose={onClose}>
      <div className={cn(formSheetClass, "sheet-invert px-4")}>
        <SheetGrabber />
        <p className="mb-1 text-center text-[17px] font-semibold text-fg">
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
                  onClick={() => setDropId(speaker.id)}
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
      {dropId ? (
        <ActionSheet
          variant="alert"
          message={t(locale, "notebookDeleteSpeakerAsk")}
          cancelLabel={t(locale, "linkCancel")}
          onClose={() => setDropId(null)}
          actions={[
            {
              label: t(locale, "notebookDeleteSpeaker"),
              destructive: true,
              onSelect: () => deleteLocalSpeaker(dropId),
            },
          ]}
        />
      ) : null}
    </ViewportSheet>
  );
}
