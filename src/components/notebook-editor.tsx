import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bold, BookOpen, CalendarDays, Hash, Italic, List, ListOrdered, Plus, Type, UserRound, X } from "lucide-react";
import { t } from "@/lib/i18n";
import {
  detectTrailingRef,
  emptyLine,
  newNoteId,
  passageToRef,
  replaceTrailingWithRef,
  type LineBlock,
  type Note,
  type NoteBlock,
  type Speaker,
  type SpeakerBlock,
} from "@/lib/notebook";
import { upsertLocalNote, upsertLocalSpeaker } from "@/lib/notebook-local";
import { useAppStore } from "@/lib/store";
import { formatSelection, NotebookLine } from "@/components/notebook-line";
import { NotebookPickerSheet } from "@/components/notebook-picker-sheet";
import { NotebookSpeakerSheet } from "@/components/notebook-speaker-sheet";
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

function insertAfterAnchor(blocks: NoteBlock[], id: string | null, next: NoteBlock): NoteBlock[] {
  if (!id) return [...blocks, next];
  const out: NoteBlock[] = [];
  let placed = false;
  for (const block of blocks) {
    if (block.type === "speaker") {
      out.push(block);
      if (block.id === id || block.children.some((child) => child.id === id)) {
        out.push(next);
        placed = true;
      }
      continue;
    }
    out.push(block);
    if (block.id === id) {
      out.push(next);
      placed = true;
    }
  }
  return placed ? out : [...out, next];
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

function flattenLineIds(blocks: NoteBlock[]) {
  const ids: string[] = [];
  for (const block of blocks) {
    if (block.type === "speaker") {
      for (const child of block.children) ids.push(child.id);
    } else ids.push(block.id);
  }
  return ids;
}

function prevLineId(blocks: NoteBlock[], id: string) {
  const ids = flattenLineIds(blocks);
  const index = ids.indexOf(id);
  return index > 0 ? ids[index - 1] : null;
}

function removeLine(blocks: NoteBlock[], id: string): NoteBlock[] {
  if (flattenLineIds(blocks).length <= 1) return blocks;
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

function speakerBlockOf(blocks: NoteBlock[], lineId: string): SpeakerBlock | undefined {
  return blocks.find((block): block is SpeakerBlock => block.type === "speaker" && block.children.some((child) => child.id === lineId));
}

function ensureLineAfter(blocks: NoteBlock[], speakerId: string) {
  const idx = blocks.findIndex((block) => block.id === speakerId);
  if (idx < 0) return { blocks, lineId: null as string | null };
  const next = blocks[idx + 1];
  if (next && next.type !== "speaker") return { blocks, lineId: next.id };
  const line = emptyLine();
  const out = [...blocks];
  out.splice(idx + 1, 0, line);
  return { blocks: out, lineId: line.id };
}

function useVisualViewport() {
  const [state, setState] = useState({ offsetTop: 0, keyboard: false });
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      setState({
        offsetTop: vv.offsetTop,
        keyboard: window.innerHeight - vv.height > 80,
      });
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);
  return state;
}

function useHideOnScroll(enabled: boolean) {
  const [compact, setCompact] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    if (!enabled) {
      setCompact(false);
      return;
    }
    last.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last.current;
      if (y < 16) setCompact(false);
      else if (delta > 10) setCompact(true);
      else if (delta < -10) setCompact(false);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
  return compact;
}

function olNumber(items: LineBlock[], id: string) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0 || items[index]?.type !== "ol") return undefined;
  let n = 0;
  for (let i = index; i >= 0 && items[i]?.type === "ol"; i -= 1) n += 1;
  return n;
}

function rootOlNumber(blocks: NoteBlock[], id: string) {
  const index = blocks.findIndex((item) => item.id === id);
  if (index < 0 || blocks[index]?.type !== "ol") return undefined;
  let n = 0;
  for (let i = index; i >= 0 && blocks[i]?.type === "ol"; i -= 1) n += 1;
  return n;
}

function LineRow({
  block,
  locale,
  copyLocale,
  style,
  placeholder,
  active,
  index,
  onChange,
  onEnter,
  onEmptyBackspace,
  onFocus,
  onDetect,
  onTrigger,
}: {
  block: LineBlock;
  locale: Parameters<typeof t>[0];
  copyLocale: Parameters<typeof t>[0];
  style: { book: "name" | "abbr"; sep: "colon" | "dot" | "comma" };
  placeholder?: string;
  active?: boolean;
  index?: number;
  onChange: (inlines: LineBlock["inlines"]) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  onFocus: () => void;
  onDetect: (value: ReturnType<typeof detectTrailingRef>) => void;
  onTrigger?: (kind: "at" | "slash") => void;
}) {
  return (
    <div className="flex gap-2">
      {block.type === "ul" ? <span className="mt-0.5 w-5 shrink-0 text-[17px] leading-relaxed text-muted">•</span> : null}
      {block.type === "ol" && index ? (
        <span className="mt-0.5 w-6 shrink-0 text-[17px] leading-relaxed tabular-nums text-muted">{index}.</span>
      ) : null}
      <NotebookLine
        block={block}
        locale={copyLocale}
        style={style}
        placeholder={placeholder}
        active={active}
        onChange={onChange}
        onEnter={onEnter}
        onEmptyBackspace={onEmptyBackspace}
        onFocus={onFocus}
        onDetect={onDetect}
        onTrigger={onTrigger}
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
  const copyLocale = useAppStore((s) => s.copyLocale);
  const citeBook = useAppStore((s) => s.citeBook);
  const citeSep = useAppStore((s) => s.citeSep);
  const storedSpeakers = useAppStore((s) => s.speakers);
  const speakers = speakerList ?? storedSpeakers;
  const setActive = useAppStore((s) => s.setNotebookActiveSpeakerId);
  const vv = useVisualViewport();
  const compact = useHideOnScroll(!vv.keyboard);
  const chromeRef = useRef<HTMLDivElement>(null);
  const [chromeH, setChromeH] = useState(108);
  const [draft, setDraft] = useState(note);
  const [picker, setPicker] = useState(false);
  const [people, setPeople] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(draft.blocks[0] && draft.blocks[0].type !== "speaker" ? draft.blocks[0].id : null);
  const [pending, setPending] = useState<ReturnType<typeof detectTrailingRef>>(null);
  const [tagSheet, setTagSheet] = useState(false);
  const [tag, setTag] = useState("");
  const tagRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (tagSheet) tagRef.current?.focus();
  }, [tagSheet]);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setChromeH(el.getBoundingClientRect().height));
    ro.observe(el);
    setChromeH(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [compact, pending, readOnly]);

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

  function updateBlocks(updater: (blocks: NoteBlock[]) => NoteBlock[]) {
    patch((current) => ({ ...current, blocks: updater(current.blocks) }));
  }

  function onEnter(block: LineBlock) {
    const current = latest();
    const speaker = speakerBlockOf(current.blocks, block.id);
    if (block.inlines.length === 0 && (block.type === "ul" || block.type === "ol")) {
      updateBlocks((blocks) => mapLine(blocks, block.id, (row) => ({ ...row, type: "p" })));
      return;
    }
    const lastChild = speaker?.children[speaker.children.length - 1];
    if (speaker && lastChild?.id === block.id && block.inlines.length === 0) {
      const next = ensureLineAfter(current.blocks, speaker.id);
      updateBlocks(() => next.blocks);
      if (next.lineId) setFocusId(next.lineId);
      setActive(null);
      return;
    }
    const line = emptyLine(block.type === "h" ? "p" : block.type);
    updateBlocks((blocks) => insertAfter(blocks, block.id, line));
    setFocusId(line.id);
  }

  function exitSpeaker() {
    const current = latest();
    const speaker =
      speakerBlockOf(current.blocks, focusId ?? "") ??
      current.blocks.find((block) => block.type === "speaker" && block.speakerId === useAppStore.getState().notebookActiveSpeakerId);
    if (!speaker || speaker.type !== "speaker") {
      setActive(null);
      return;
    }
    const next = ensureLineAfter(current.blocks, speaker.id);
    updateBlocks(() => next.blocks);
    if (next.lineId) setFocusId(next.lineId);
    setActive(null);
  }

  function onMergeBack(id: string) {
    const prev = prevLineId(latest().blocks, id);
    updateBlocks((blocks) => removeLine(blocks, id));
    if (prev) setFocusId(prev);
  }

  function onPickRef(passage: Passage) {
    if (!focusId) {
      updateBlocks((blocks) => [...blocks, { id: newNoteId(), type: "p", inlines: [passageToRef(passage)] }]);
      return;
    }
    updateBlocks((blocks) =>
      mapLine(blocks, focusId, (block) => ({
        ...block,
        inlines: [...block.inlines, passageToRef(passage)],
      })),
    );
  }

  function confirmRef() {
    if (!pending || !focusId) return;
    updateBlocks((blocks) =>
      mapLine(blocks, focusId, (block) => ({
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
    updateBlocks((blocks) => {
      const withSpeaker = insertAfterAnchor(blocks, focusId, block);
      const last = withSpeaker[withSpeaker.length - 1];
      if (last?.id === block.id) return [...withSpeaker, emptyLine()];
      return withSpeaker;
    });
    setFocusId(child.id);
    setActive(speaker.id);
  }

  function removeSpeaker(id: string) {
    if (!confirm(t(locale, "notebookRemoveSpeaker"))) return;
    const current = latest();
    const idx = current.blocks.findIndex((block) => block.id === id);
    const prev = idx > 0 ? current.blocks[idx - 1] : current.blocks[idx + 1];
    updateBlocks((blocks) => {
      const out = blocks.filter((block) => block.id !== id);
      return out.length ? out : [emptyLine()];
    });
    if (prev?.type === "speaker") {
      setFocusId(prev.children[0]?.id ?? null);
      setActive(prev.speakerId);
    } else {
      setFocusId(prev?.id ?? null);
      setActive(null);
    }
  }

  const toolbar = readOnly ? null : (
    <div className="border-t border-border/60 px-1 pb-1" onMouseDown={(event) => event.preventDefault()}>
      {pending ? (
        <button
          type="button"
          onClick={confirmRef}
          className="mb-1 flex min-h-10 w-full items-center justify-center rounded-md bg-accent px-3 text-sm text-accent-fg"
        >
          {t(locale, "notebookConfirmRef")}
        </button>
      ) : null}
      <div className="flex items-center justify-between gap-0.5">
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
          onClick={() => focusId && updateBlocks((blocks) => mapLine(blocks, focusId, (row) => ({ ...row, type: row.type === "h" ? "p" : "h" })))}
        >
          <Type />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={t(locale, "notebookList")}
          onClick={() => focusId && updateBlocks((blocks) => mapLine(blocks, focusId, (row) => ({ ...row, type: row.type === "ul" ? "p" : "ul" })))}
        >
          <List />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={t(locale, "notebookNumbers")}
          onClick={() => focusId && updateBlocks((blocks) => mapLine(blocks, focusId, (row) => ({ ...row, type: row.type === "ol" ? "p" : "ol" })))}
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
          <Button variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookExitSpeaker")} onClick={exitSpeaker}>
            <X />
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={chromeRef}
        className="fixed inset-x-0 z-40 bg-bg px-2 sm:px-3"
        style={{ top: vv.offsetTop }}
      >
        <AppHeader
          pinned
          title={draft.title || t(locale, "notebookMeeting")}
          backTo="/notebook"
          compact={vv.keyboard ? false : compact}
          extra={toolbar}
          titleField={
            readOnly ? undefined : (
              <input
                value={draft.title}
                tabIndex={-1}
                enterKeyHint="done"
                onChange={(event) => patch((current) => ({ ...current, title: event.target.value.slice(0, 80) }))}
                placeholder={t(locale, "notebookMeeting")}
                className="h-10 w-full bg-transparent text-center text-[17px] font-semibold text-fg outline-none placeholder:text-subtle"
              />
            )
          }
          trailing={
            readOnly ? null : (
              <div className="flex items-center">
                <label className="relative flex size-12 cursor-pointer items-center justify-center text-fg">
                  <CalendarDays className="size-6" />
                  <span className="sr-only">{t(locale, "notebookDate")}</span>
                  <input
                    type="date"
                    value={draft.happenedAt}
                    onChange={(event) => patch((current) => ({ ...current, happenedAt: event.target.value }))}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label={t(locale, "notebookDate")}
                  />
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-12 text-fg [&_svg]:size-6"
                  aria-label={t(locale, "notebookTags")}
                  onClick={() => setTagSheet(true)}
                >
                  <Hash />
                </Button>
              </div>
            )
          }
        />
      </div>
      <div style={{ height: chromeH }} aria-hidden />
      <div className="flex flex-col gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-1">
          {draft.blocks.map((block, blockIndex) => {
            if (block.type === "speaker") {
              const speaker = speakers.find((item) => item.id === block.speakerId);
              return (
                <section
                  key={block.id}
                  className="mt-4 mb-5 border-l-2 pl-3"
                  style={{ borderColor: speaker?.color ?? "#c4a574" }}
                  onClick={(event) => {
                    if (event.target !== event.currentTarget) return;
                    const child = block.children[0];
                    if (child) {
                      setFocusId(child.id);
                      setActive(block.speakerId);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{speaker?.name ?? "—"}</p>
                    {readOnly ? null : (
                      <button
                        type="button"
                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:text-fg"
                        aria-label={t(locale, "notebookRemoveSpeaker")}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeSpeaker(block.id);
                        }}
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                  {block.title ? (
                    readOnly ? (
                      <p className="mt-0.5 text-base text-muted">{block.title}</p>
                    ) : (
                    <input
                      value={block.title}
                      tabIndex={-1}
                      enterKeyHint="done"
                      onChange={(event) =>
                        updateBlocks((blocks) =>
                          blocks.map((row) =>
                            row.id === block.id && row.type === "speaker"
                              ? { ...row, title: event.target.value.slice(0, 80) }
                              : row,
                          ),
                        )
                      }
                      className="mt-0.5 w-full bg-transparent text-base text-muted outline-none"
                    />
                    )
                  ) : null}
                  <div className="mt-1 flex flex-col gap-1">
                    {block.children.map((child) => (
                      <LineRow
                        key={child.id}
                        block={child}
                        locale={locale}
                        copyLocale={copyLocale}
                        style={cite}
                        active={!readOnly && focusId === child.id}
                        index={olNumber(block.children, child.id)}
                        onChange={(inlines) => updateBlocks((blocks) => mapLine(blocks, child.id, (row) => ({ ...row, inlines })))}
                        onEnter={() => onEnter(child)}
                        onEmptyBackspace={() => onMergeBack(child.id)}
                        onFocus={() => {
                          setFocusId(child.id);
                          setActive(block.speakerId);
                        }}
                        onDetect={setPending}
                        onTrigger={(kind) => (kind === "at" ? setPeople(true) : setPicker(true))}
                      />
                    ))}
                  </div>
                </section>
              );
            }
            const first = draft.blocks.find((row) => row.type !== "speaker");
            return (
              <LineRow
                key={block.id}
                block={block}
                locale={locale}
                copyLocale={copyLocale}
                style={cite}
                active={!readOnly && focusId === block.id}
                index={rootOlNumber(draft.blocks, block.id)}
                placeholder={block.id === first?.id && block.type === "p" ? t(locale, "notebookWrite") : undefined}
                onChange={(inlines) => updateBlocks((blocks) => mapLine(blocks, block.id, (row) => ({ ...row, inlines })))}
                onEnter={() => onEnter(block)}
                onEmptyBackspace={() => onMergeBack(block.id)}
                onFocus={() => {
                  setFocusId(block.id);
                  setActive(speakerBlockOf(draft.blocks, block.id)?.speakerId ?? null);
                }}
                onDetect={setPending}
                onTrigger={(kind) => (kind === "at" ? setPeople(true) : setPicker(true))}
              />
            );
          })}
        </div>
      </div>

      {tagSheet && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-end justify-center bg-fg/50 sm:items-center" onClick={() => setTagSheet(false)}>
              <div
                className="w-full max-w-sm rounded-t-xl bg-elevated p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="mb-3 text-sm font-medium text-fg">{t(locale, "notebookTags")}</p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {draft.tags.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => patch((current) => ({ ...current, tags: current.tags.filter((tag) => tag !== item) }))}
                      className="rounded-full bg-surface px-3 py-1 text-sm text-fg"
                    >
                      #{item} ×
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    ref={tagRef}
                    value={tag}
                    onChange={(event) => setTag(event.target.value)}
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
                    className="h-12 min-w-0 flex-1 rounded-md bg-surface px-3 text-base text-fg outline-none"
                  />
                  <Button
                    size="icon"
                    className="size-12"
                    aria-label={t(locale, "notebookTagAdd")}
                    onClick={() => {
                      const next = tag.trim().replace(/^#+/, "").slice(0, 24);
                      if (!next) return;
                      patch((current) =>
                        current.tags.includes(next) ? current : { ...current, tags: [...current.tags, next] },
                      );
                      setTag("");
                    }}
                  >
                    <Plus />
                  </Button>
                </div>
                <Button className="mt-3 w-full" variant="ghost" onClick={() => setTagSheet(false)}>
                  {t(locale, "back")}
                </Button>
              </div>
            </div>,
            document.body,
          )
        : null}

      <NotebookPickerSheet open={picker} onClose={() => setPicker(false)} onPick={onPickRef} />
      <NotebookSpeakerSheet open={people} onClose={() => setPeople(false)} onPick={addSpeaker} />
    </>
  );
}
