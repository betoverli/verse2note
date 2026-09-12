import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bold, BookOpen, Italic, List, ListOrdered, Type, UserRound, X } from "lucide-react";
import { t } from "@/lib/i18n";
import {
  detectTrailingRef,
  emptyLine,
  newNoteId,
  noteSpeakerIds,
  passageToRef,
  replaceTrailingWithRef,
  type LineBlock,
  type Note,
  type NoteBlock,
  type Speaker,
  type SpeakerBlock,
} from "@/lib/notebook";
import { deleteLocalNote, upsertLocalNote, upsertLocalSpeaker } from "@/lib/notebook-local";
import { useAppStore } from "@/lib/store";
import { formatSelection, NotebookLine } from "@/components/notebook-line";
import { NotebookPickerSheet } from "@/components/notebook-picker-sheet";
import { NotebookSpeakerSheet } from "@/components/notebook-speaker-sheet";
import { SendToFriendButton } from "@/components/send-to-friend";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import type { Passage } from "@/lib/bible/passage";

function mapLine(blocks: NoteBlock[], id: string, update: (block: LineBlock) => LineBlock): NoteBlock[] {
  return blocks.map((block) => {
    if (block.type === "speaker") {
      return { ...block, children: block.children.map((child) => (child.id === id ? update(child) : child)) };
    }
    return block.id === id ? update(block as LineBlock) : block;
  });
}

function insertAfter(blocks: NoteBlock[], id: string, next: LineBlock): NoteBlock[] {
  const out: NoteBlock[] = [];
  for (const block of blocks) {
    if (block.type === "speaker") {
      const idx = block.children.findIndex((child) => child.id === id);
      if (idx >= 0) {
        const children = [...block.children];
        children.splice(idx + 1, 0, next);
        out.push({ ...block, children });
        continue;
      }
      out.push(block);
      continue;
    }
    out.push(block);
    if (block.id === id) out.push(next);
  }
  return out;
}

function removeLine(blocks: NoteBlock[], id: string): NoteBlock[] {
  const out: NoteBlock[] = [];
  for (const block of blocks) {
    if (block.type === "speaker") {
      const children = block.children.filter((child) => child.id !== id);
      if (children.length === 0) continue;
      out.push({ ...block, children });
      continue;
    }
    if (block.id !== id) out.push(block);
  }
  return out.length ? out : [emptyLine()];
}

function parentSpeaker(blocks: NoteBlock[], lineId: string) {
  for (const block of blocks) {
    if (block.type === "speaker" && block.children.some((child) => child.id === lineId)) return block.speakerId;
  }
  return null;
}

function LineRow({
  block,
  locale,
  style,
  placeholder,
  onChange,
  onEnter,
  onEmptyBackspace,
  onFocus,
  onDetect,
}: {
  block: LineBlock;
  locale: Parameters<typeof t>[0];
  style: { book: "name" | "abbr"; sep: "colon" | "dot" | "comma" };
  placeholder?: string;
  onChange: (inlines: LineBlock["inlines"]) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  onFocus: () => void;
  onDetect: (value: ReturnType<typeof detectTrailingRef>) => void;
}) {
  return (
    <div className="flex gap-2">
      {block.type === "ul" ? <span className="mt-1 w-4 text-muted">•</span> : null}
      {block.type === "ol" ? <span className="mt-1 w-4 text-xs text-muted">1.</span> : null}
      <NotebookLine
        block={block}
        locale={locale}
        style={style}
        placeholder={placeholder}
        onChange={onChange}
        onEnter={onEnter}
        onEmptyBackspace={onEmptyBackspace}
        onFocus={onFocus}
        onDetect={onDetect}
      />
    </div>
  );
}

export function NotebookEditor({
  note,
  readOnly,
  speakerList,
}: {
  note: Note;
  readOnly?: boolean;
  speakerList?: Speaker[];
}) {
  const locale = useAppStore((s) => s.locale);
  const citeBook = useAppStore((s) => s.citeBook);
  const citeSep = useAppStore((s) => s.citeSep);
  const storedSpeakers = useAppStore((s) => s.speakers);
  const speakers = speakerList ?? storedSpeakers;
  const setActive = useAppStore((s) => s.setNotebookActiveSpeakerId);
  const navigate = useNavigate();
  const [draft, setDraft] = useState(note);
  const [picker, setPicker] = useState(false);
  const [people, setPeople] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(draft.blocks[0] && draft.blocks[0].type !== "speaker" ? draft.blocks[0].id : null);
  const [pending, setPending] = useState<ReturnType<typeof detectTrailingRef>>(null);
  const [tag, setTag] = useState("");
  const cite = { book: citeBook, sep: citeSep };
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    setDraft(note);
    draftRef.current = note;
  }, [note.id]);

  useEffect(() => {
    return () => setActive(null);
  }, [setActive]);

  function save(next: Note) {
    draftRef.current = next;
    setDraft(next);
    if (!readOnly) upsertLocalNote(next);
  }

  function latest() {
    return useAppStore.getState().notes.find((item) => item.id === note.id) ?? draftRef.current;
  }

  function patch(updater: (current: Note) => Note) {
    save(updater(latest()));
  }

  function setBlocks(blocks: NoteBlock[]) {
    patch((current) => ({ ...current, blocks }));
  }

  function onEnter(block: LineBlock) {
    const next = emptyLine(block.type === "h" ? "p" : block.type);
    setBlocks(insertAfter(draft.blocks, block.id, next));
    setFocusId(next.id);
  }

  function onPickRef(passage: Passage) {
    if (!focusId) {
      setBlocks([...draft.blocks, { id: newNoteId(), type: "p", inlines: [passageToRef(passage)] }]);
      return;
    }
    setBlocks(
      mapLine(draft.blocks, focusId, (block) => ({
        ...block,
        inlines: [...block.inlines, passageToRef(passage)],
      })),
    );
  }

  function confirmRef() {
    if (!pending || !focusId) return;
    setBlocks(
      mapLine(draft.blocks, focusId, (block) => ({
        ...block,
        inlines: replaceTrailingWithRef(block.inlines, pending.start, pending.passage),
      })),
    );
    setPending(null);
  }

  function addSpeaker(speaker: Speaker) {
    upsertLocalSpeaker(speaker);
    const child = emptyLine();
    const block: SpeakerBlock = {
      id: newNoteId(),
      type: "speaker",
      speakerId: speaker.id,
      title: "",
      children: [child],
    };
    setBlocks([...draft.blocks, block]);
    setFocusId(child.id);
    setActive(speaker.id);
  }

  const used = noteSpeakerIds(draft)
    .map((id) => speakers.find((item) => item.id === id))
    .filter(Boolean);

  return (
    <>
      <AppHeader
        title={draft.title || t(locale, "notebookMeeting")}
        backTo="/notebook"
        titleField={
          readOnly ? undefined : (
            <input
              value={draft.title}
              onChange={(event) => patch((current) => ({ ...current, title: event.target.value.slice(0, 80) }))}
              placeholder={t(locale, "notebookMeeting")}
              className="h-10 w-full bg-transparent text-center text-[17px] font-semibold text-fg outline-none placeholder:text-subtle"
            />
          )
        }
        trailing={
          readOnly ? null : (
            <SendToFriendButton kind="note" targetId={draft.id} />
          )
        }
      />
      <div className="flex flex-col gap-3 pb-[calc(var(--tab-bar-height)+6.5rem)]">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <input
            type="date"
            value={draft.happenedAt}
            disabled={readOnly}
            onChange={(event) => patch((current) => ({ ...current, happenedAt: event.target.value }))}
            className="rounded-md bg-surface px-2 py-1 text-fg"
            aria-label={t(locale, "notebookDate")}
          />
          {draft.tags.map((item) => (
            <button
              key={item}
              type="button"
              disabled={readOnly}
              onClick={() =>
                patch((current) => ({ ...current, tags: current.tags.filter((tag) => tag !== item) }))
              }
              className="rounded-full bg-surface px-2 py-1"
            >
              #{item}
            </button>
          ))}
          {readOnly ? null : (
            <input
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              onBlur={() => {
                const next = tag.trim().replace(/^#+/, "").slice(0, 24);
                if (!next) return;
                patch((current) =>
                  current.tags.includes(next) ? current : { ...current, tags: [...current.tags, next] },
                );
                setTag("");
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                const next = tag.trim().replace(/^#+/, "").slice(0, 24);
                if (!next) return;
                patch((current) =>
                  current.tags.includes(next) ? current : { ...current, tags: [...current.tags, next] },
                );
                setTag("");
              }}
              placeholder={t(locale, "notebookTagAdd")}
              enterKeyHint="done"
              className="w-24 bg-transparent py-1 outline-none"
            />
          )}
          {used.map((speaker) =>
            speaker ? (
              <span key={speaker.id} className="flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ background: speaker.color }} />
                {speaker.name}
              </span>
            ) : null,
          )}
        </div>

        <div className="flex flex-col gap-3">
          {draft.blocks.map((block) => {
            if (block.type === "speaker") {
              const speaker = speakers.find((item) => item.id === block.speakerId);
              return (
                <section
                  key={block.id}
                  className="rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
                  style={{ borderLeft: `4px solid ${speaker?.color ?? "#c4a574"}` }}
                >
                  <p className="text-[11px] font-medium tracking-wide text-muted uppercase">{speaker?.name ?? "—"}</p>
                  {readOnly ? (
                    block.title ? <p className="mt-1 font-display text-lg italic">{block.title}</p> : null
                  ) : (
                    <input
                      value={block.title}
                      onChange={(event) =>
                        setBlocks(
                          draft.blocks.map((row) =>
                            row.id === block.id && row.type === "speaker"
                              ? { ...row, title: event.target.value.slice(0, 80) }
                              : row,
                          ),
                        )
                      }
                      placeholder={t(locale, "notebookSpeakerTitle")}
                      className="mt-1 w-full bg-transparent font-display text-lg italic outline-none placeholder:text-subtle"
                    />
                  )}
                  <div className="mt-2 flex flex-col gap-2">
                    {block.children.map((child) => (
                      <LineRow
                        key={child.id}
                        block={child}
                        locale={locale}
                        style={cite}
                        onChange={(inlines) => setBlocks(mapLine(draft.blocks, child.id, (row) => ({ ...row, inlines })))}
                        onEnter={() => onEnter(child)}
                        onEmptyBackspace={() => setBlocks(removeLine(draft.blocks, child.id))}
                        onFocus={() => {
                          setFocusId(child.id);
                          setActive(block.speakerId);
                        }}
                        onDetect={setPending}
                      />
                    ))}
                  </div>
                </section>
              );
            }
            return (
              <LineRow
                key={block.id}
                block={block}
                locale={locale}
                style={cite}
                placeholder={t(locale, "notebookWrite")}
                onChange={(inlines) => setBlocks(mapLine(draft.blocks, block.id, (row) => ({ ...row, inlines })))}
                onEnter={() => onEnter(block)}
                onEmptyBackspace={() => setBlocks(removeLine(draft.blocks, block.id))}
                onFocus={() => {
                  setFocusId(block.id);
                  setActive(parentSpeaker(draft.blocks, block.id));
                }}
                onDetect={setPending}
              />
            );
          })}
        </div>

        {readOnly ? null : (
          <Button
            variant="ghost"
            className="self-start text-muted"
            onClick={() => {
              if (confirm(t(locale, "notebookDelete"))) {
                deleteLocalNote(draft.id);
                void navigate({ to: "/notebook" });
              }
            }}
          >
            {t(locale, "notebookDelete")}
          </Button>
        )}
      </div>

      {readOnly ? null : (
        <div
          className="fixed inset-x-0 z-30 border-t border-border/70 bg-bg/90 px-3 py-2 backdrop-blur-xl"
          style={{ bottom: "var(--tab-bar-height)" }}
        >
          {pending ? (
            <button
              type="button"
              onClick={confirmRef}
              className="mb-2 flex min-h-10 w-full items-center justify-center rounded-md bg-accent px-3 text-sm text-accent-fg"
            >
              {t(locale, "notebookConfirmRef")}
            </button>
          ) : null}
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-1">
            <Button variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookBold")} onClick={() => formatSelection("bold")}>
              <Bold />
            </Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookItalic")} onClick={() => formatSelection("italic")}>
              <Italic />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label={t(locale, "notebookHeading")}
              onClick={() => focusId && setBlocks(mapLine(draft.blocks, focusId, (row) => ({ ...row, type: row.type === "h" ? "p" : "h" })))}
            >
              <Type />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label={t(locale, "notebookList")}
              onClick={() => focusId && setBlocks(mapLine(draft.blocks, focusId, (row) => ({ ...row, type: row.type === "ul" ? "p" : "ul" })))}
            >
              <List />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label={t(locale, "notebookNumbers")}
              onClick={() => focusId && setBlocks(mapLine(draft.blocks, focusId, (row) => ({ ...row, type: row.type === "ol" ? "p" : "ol" })))}
            >
              <ListOrdered />
            </Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookAddRef")} onClick={() => setPicker(true)}>
              <BookOpen />
            </Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookAddSpeaker")} onClick={() => setPeople(true)}>
              <UserRound />
            </Button>
            {useAppStore.getState().notebookActiveSpeakerId ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={t(locale, "notebookExitSpeaker")}
                onClick={() => setActive(null)}
              >
                <X />
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <NotebookPickerSheet open={picker} onClose={() => setPicker(false)} onPick={onPickRef} />
      <NotebookSpeakerSheet open={people} onClose={() => setPeople(false)} onPick={addSpeaker} />
    </>
  );
}
