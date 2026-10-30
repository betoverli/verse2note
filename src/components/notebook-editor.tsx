import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bold, BookOpen, Ellipsis, Italic, List, ListOrdered, Plus, Type, UserRound, X } from "lucide-react";
import { t } from "@/lib/i18n";
import { detectTrailingRef, emptyLine, newNoteId, noteIsBare, passageToRef, replaceTrailingWithRef, type LineBlock, type Note, type NoteBlock, type Speaker, type SpeakerBlock } from "@/lib/notebook";
import { upsertLocalNote, upsertLocalSpeaker } from "@/lib/notebook-local";
import { useAppStore } from "@/lib/store";
import { formatSelection } from "@/components/notebook-line";
import { NotebookDoc, type NotebookDocHandle } from "@/components/notebook-doc";
import { NotebookPickerSheet } from "@/components/notebook-picker-sheet";
import { NotebookSpeakerSheet } from "@/components/notebook-speaker-sheet";
import { NotebookGroupPublishList } from "@/components/notebook-group-publish";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { ActionSheet, SheetGrabber, ViewportSheet, formSheetClass } from "@/components/viewport-sheet";
import { useNativeScrollLock } from "@/lib/page-scroll";
import { cn } from "@/lib/utils";
import type { Passage } from "@/lib/bible/passage";

const NOTE_MORE_SETTINGS = "settings";
const NOTE_MORE_SPEAKERS = "speakers";

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

function findLine(blocks: NoteBlock[], id: string): LineBlock | null {
  for (const block of blocks) {
    if (block.type === "speaker") {
      const child = block.children.find((row) => row.id === id);
      if (child) return child;
    } else if (block.id === id) return block;
  }
  return null;
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
  const [state, setState] = useState({ offsetTop: 0, keyboard: false, overlap: 0 });
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const overlap = Math.max(0, window.innerHeight - vv.height);
      const next = {
        offsetTop: overlap > 120 ? vv.offsetTop : 0,
        keyboard: overlap > 120,
        overlap,
      };
      setState((prev) =>
        prev.offsetTop === next.offsetTop && prev.keyboard === next.keyboard && prev.overlap === next.overlap ? prev : next,
      );
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

export function NotebookEditor({
  note,
  readOnly,
  speakerList,
  fromGroup,
  footer,
}: {
  note: Note;
  readOnly?: boolean;
  speakerList?: Speaker[];
  fromGroup?: string;
  footer?: ReactNode;
}) {
  useNativeScrollLock();
  const locale = useAppStore((s) => s.locale);
  const copyLocale = useAppStore((s) => s.copyLocale);
  const citeBook = useAppStore((s) => s.citeBook);
  const citeSep = useAppStore((s) => s.citeSep);
  const storedSpeakers = useAppStore((s) => s.speakers);
  const speakers = speakerList ?? storedSpeakers;
  const setActive = useAppStore((s) => s.setNotebookActiveSpeakerId);
  const vv = useVisualViewport();
  const chromeRef = useRef<HTMLDivElement>(null);
  const docApi = useRef<NotebookDocHandle>(null);
  const [chromeH, setChromeH] = useState(108);
  const [draft, setDraft] = useState(note);
  const [picker, setPicker] = useState(false);
  const [people, setPeople] = useState(false);
  const [askSpeaker, setAskSpeaker] = useState<Speaker | null>(null);
  const [dropSpeaker, setDropSpeaker] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(draft.blocks[0] && draft.blocks[0].type !== "speaker" ? draft.blocks[0].id : null);
  const focusIdRef = useRef(focusId);
  focusIdRef.current = focusId;
  const [pending, setPending] = useState<ReturnType<typeof detectTrailingRef>>(null);
  const [metaSheet, setMetaSheet] = useState(false);
  const [moreSheet, setMoreSheet] = useState(false);
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
    return () => {
      setActive(null);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };
  }, [setActive]);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setChromeH(el.getBoundingClientRect().height));
    ro.observe(el);
    setChromeH(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [readOnly]);

  function save(next: Note) {
    draftRef.current = next;
    setDraft(next);
    if (!readOnly) upsertLocalNote(next);
  }

  function latest() {
    return draftRef.current;
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
    setFocusId(next.lineId);
    setActive(null);
  }

  function onPickRef(passage: Passage) {
    if (docApi.current) {
      docApi.current.insertPassage(passage, focusIdRef.current);
      return;
    }
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

  function insertSpeakerSection(speaker: Speaker) {
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

  function addSpeaker(speaker: Speaker) {
    upsertLocalSpeaker(speaker);
    if (noteIsBare(latest()) && !latest().speakerId) {
      setAskSpeaker(speaker);
      return;
    }
    insertSpeakerSection(speaker);
  }

  function removeSpeaker(id: string) {
    setDropSpeaker(id);
  }

  function confirmDropSpeaker() {
    const id = dropSpeaker;
    if (!id) return;
    setDropSpeaker(null);
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

  function currentLineId() {
    if (focusIdRef.current) return focusIdRef.current;
    const speakerId = useAppStore.getState().notebookActiveSpeakerId;
    if (speakerId) {
      const block = latest().blocks.find((row) => row.type === "speaker" && row.speakerId === speakerId);
      if (block?.type === "speaker") return block.children[0]?.id ?? null;
    }
    const first = latest().blocks.find((row): row is LineBlock => row.type !== "speaker");
    return first?.id ?? null;
  }

  function toggleLine(type: LineBlock["type"]) {
    if (docApi.current) {
      docApi.current.toggleKind(type);
      return;
    }
    const id = currentLineId();
    if (!id) return;
    updateBlocks((blocks) => mapLine(blocks, id, (row) => ({ ...row, type: row.type === type ? "p" : type })));
  }

  function toolPointer(action: () => void) {
    return (event: { preventDefault: () => void }) => {
      event.preventDefault();
      action();
    };
  }

  function keepTyping(event: { preventDefault: () => void; target: EventTarget | null }) {
    const el = event.target as HTMLElement | null;
    if (el?.closest("input, textarea, [contenteditable='true']")) return;
    event.preventDefault();
  }

  const activeLine = (() => {
    const id = focusId;
    if (!id) return null;
    for (const block of draft.blocks) {
      if (block.type === "speaker") {
        const child = block.children.find((row) => row.id === id);
        if (child) return child;
      } else if (block.id === id) return block;
    }
    return null;
  })();

  const toolCapture = {
    onPointerDownCapture: keepTyping,
    onMouseDownCapture: keepTyping,
    onTouchStartCapture: keepTyping,
  };

  const toolButtons = readOnly ? null : (
    <div className="flex items-center justify-between gap-0.5 px-0.5">
        <Button type="button" tabIndex={-1} variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookBold")} onPointerDown={toolPointer(() => formatSelection("bold"))}>
          <Bold />
        </Button>
        <Button type="button" tabIndex={-1} variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookItalic")} onPointerDown={toolPointer(() => formatSelection("italic"))}>
          <Italic />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-11", activeLine?.type === "h" && "bg-fill text-accent")}
          tabIndex={-1}
          aria-label={t(locale, "notebookHeading")}
          onPointerDown={toolPointer(() => toggleLine("h"))}
        >
          <Type />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-11", activeLine?.type === "ul" && "bg-fill text-accent")}
          tabIndex={-1}
          aria-label={t(locale, "notebookList")}
          onPointerDown={toolPointer(() => toggleLine("ul"))}
        >
          <List />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-11", activeLine?.type === "ol" && "bg-fill text-accent")}
          tabIndex={-1}
          aria-label={t(locale, "notebookNumbers")}
          onPointerDown={toolPointer(() => toggleLine("ol"))}
        >
          <ListOrdered />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          tabIndex={-1}
          aria-label={t(locale, "notebookAddRef")}
          onPointerDown={(event) => {
            event.preventDefault();
            try {
              docApi.current?.markCaret();
            } catch {
              /* keep opening */
            }
            setPicker(true);
          }}
        >
          <BookOpen />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          tabIndex={-1}
          aria-label={t(locale, "notebookAddSpeaker")}
          onPointerDown={(event) => {
            event.preventDefault();
            setPeople(true);
          }}
        >
          <UserRound />
        </Button>
        {useAppStore.getState().notebookActiveSpeakerId ? (
          <Button type="button" tabIndex={-1} variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookExitSpeaker")} onPointerDown={toolPointer(exitSpeaker)}>
            <X />
          </Button>
        ) : null}
    </div>
  );

  const barBottom = vv.keyboard ? Math.max(vv.overlap, 0) : 0;

  return (
    <>
      <div
        ref={chromeRef}
        className="note-chrome fixed inset-x-0 z-40"
        style={{ top: vv.offsetTop }}
      >
        <AppHeader
          pinned
          title={draft.title || t(locale, "notebookMeeting")}
          backTo={fromGroup ? "/groups/$id" : "/notebook"}
          backParams={fromGroup ? { id: fromGroup } : undefined}
          compact={false}
          nativeSymbol={readOnly ? undefined : "ellipsis"}
          trailingMenu={
            readOnly
              ? undefined
              : [
                  {
                    id: NOTE_MORE_SETTINGS,
                    title: t(locale, "settings"),
                    symbol: "gearshape",
                  },
                  {
                    id: NOTE_MORE_SPEAKERS,
                    title: t(locale, "notebookSpeakers"),
                    symbol: "person.2",
                  },
                ]
          }
          onTrailingMenuSelect={(id) => {
            console.log("[notebook-editor] trailingMenuSelect", id);
            if (id === NOTE_MORE_SETTINGS) setMetaSheet(true);
            else if (id === NOTE_MORE_SPEAKERS) setPeople(true);
          }}
          trailing={
            readOnly ? null : (
              <Button
                variant="ghost"
                size="icon"
                className="size-11 rounded-full border border-separator/80 text-fg [&_svg]:size-5"
                aria-label={t(locale, "settings")}
                onClick={() => {
                  // Web / Android: ActionSheet. On Capacitor iOS the Liquid Glass
                  // trailing button owns a UIMenu (showsMenuAsPrimaryAction) and
                  // this HTML control is hidden under native-top.
                  console.log("[notebook-editor] … web fallback sheet");
                  setMoreSheet(true);
                }}
              >
                <Ellipsis />
              </Button>
            )
          }
        />
      </div>
      <div className="note-chrome-spacer" style={{ height: chromeH }} aria-hidden />
      <div className="screen-body">
      <div className="flex flex-col gap-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {readOnly ? (
          draft.title ? (
            <h1 className="pt-1 text-[28px] leading-[1.15] font-bold tracking-[-0.022em] text-fg">{draft.title}</h1>
          ) : null
        ) : (
          <input
            value={draft.title}
            enterKeyHint="done"
            onChange={(event) => patch((current) => ({ ...current, title: event.target.value.slice(0, 80) }))}
            placeholder={t(locale, "notebookMeeting")}
            className="w-full bg-transparent pt-1 text-[28px] leading-[1.15] font-bold tracking-[-0.022em] text-fg outline-none placeholder:text-subtle"
          />
        )}
        <NotebookDoc
          ref={docApi}
          blocks={draft.blocks}
          locale={copyLocale}
          style={cite}
          speakers={speakers}
          readOnly={readOnly}
          keyboardPad={vv.overlap}
          onBlocks={setBlocks}
          onFocusLine={(id) => {
            setFocusId(id);
            setActive(id ? speakerBlockOf(latest().blocks, id)?.speakerId ?? null : null);
          }}
          onDetect={setPending}
          onTrigger={(kind) => {
            if (kind === "at") {
              setPeople(true);
              return;
            }
            try {
              docApi.current?.markCaret();
            } catch {
              /* keep opening */
            }
            setPicker(true);
          }}
          onRemoveSpeaker={removeSpeaker}
        />
      </div>
      {footer}
      </div>

      {!readOnly ? (
        <div
          className="note-editor-bar fixed inset-x-0 z-40 flex justify-center px-3"
          style={{
            bottom: barBottom,
            paddingBottom: vv.keyboard ? 6 : "max(6px, env(safe-area-inset-bottom))",
          }}
        >
          <div
            className="note-editor-bar-panel mx-auto w-full max-w-3xl select-none"
            {...toolCapture}
          >
            {picker ? (
              <NotebookPickerSheet
                open
                onClose={() => {
                  docApi.current?.clearCaret();
                  setPicker(false);
                }}
                onPick={onPickRef}
              />
            ) : (
              <>
                {pending ? (
                  <button
                    type="button"
                    onPointerDown={toolPointer(confirmRef)}
                    className="mb-1.5 flex min-h-11 w-full items-center justify-center rounded-[12px] bg-accent px-3 text-[15px] font-semibold text-accent-fg"
                  >
                    {t(locale, "notebookConfirmRef")}
                  </button>
                ) : null}
                {toolButtons}
              </>
            )}
          </div>
        </div>
      ) : null}

      {metaSheet ? (
        <ViewportSheet onClose={() => setMetaSheet(false)}>
          <div className={cn(formSheetClass, "min-w-0 overflow-x-hidden px-4")}>
            <SheetGrabber />
            <p className="mb-4 text-center text-[17px] font-semibold tracking-[-0.02em] text-fg">{t(locale, "settings")}</p>
            <div className="flex min-w-0 flex-col gap-6">
              <section className="min-w-0">
                <h3 className="ios-caption mb-2">{t(locale, "notebookDate")}</h3>
                <div className="ios-group min-w-0">
                  <div className="box-border min-w-0 px-4 py-2">
                    <input
                      type="date"
                      value={draft.happenedAt}
                      onChange={(event) => patch((current) => ({ ...current, happenedAt: event.target.value }))}
                      aria-label={t(locale, "notebookDate")}
                      className="note-meta-date h-11 w-full min-w-0 max-w-full"
                    />
                  </div>
                </div>
              </section>
              <section className="min-w-0">
                <h3 className="ios-caption mb-2">{t(locale, "notebookTags")}</h3>
                {draft.tags.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-2 px-4">
                    {draft.tags.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => patch((current) => ({ ...current, tags: current.tags.filter((tag) => tag !== item) }))}
                        className="flex min-h-9 items-center rounded-full bg-fill px-3 text-[15px] text-fg active:opacity-80"
                      >
                        #{item} ×
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="ios-group min-w-0">
                  <div className="flex min-w-0 items-center gap-2 px-4 py-1">
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
                      className="box-border h-11 min-w-0 flex-1 max-w-full bg-transparent text-[17px] text-fg outline-none placeholder:text-subtle"
                    />
                    <Button
                      size="icon"
                      className="size-10 shrink-0"
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
                </div>
              </section>
              <section className="min-w-0">
                <h3 className="ios-caption mb-2">{t(locale, "notebookNoteSpeaker")}</h3>
                <div className="ios-group min-w-0 p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => patch((current) => ({ ...current, speakerId: null }))}
                      className={`flex min-h-9 items-center rounded-full px-3 text-[15px] active:opacity-80 ${draft.speakerId ? "bg-fill text-fg" : "bg-accent text-accent-fg"}`}
                    >
                      {t(locale, "notebookNoteSpeakerNone")}
                    </button>
                    {speakers.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          upsertLocalSpeaker(item);
                          patch((current) => ({ ...current, speakerId: item.id }));
                        }}
                        className={`flex min-h-9 items-center gap-2 rounded-full px-3 text-[15px] active:opacity-80 ${draft.speakerId === item.id ? "bg-accent text-accent-fg" : "bg-fill text-fg"}`}
                      >
                        <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
              <NotebookGroupPublishList note={draft} />
              <div className="ios-group min-w-0">
                <button
                  type="button"
                  className="flex min-h-[52px] w-full items-center justify-center text-[17px] font-semibold text-accent active:bg-fill"
                  onClick={() => setMetaSheet(false)}
                >
                  {t(locale, "collectionDone")}
                </button>
              </div>
            </div>
          </div>
        </ViewportSheet>
      ) : null}

      <NotebookSpeakerSheet open={people} onClose={() => setPeople(false)} onPick={addSpeaker} />
      {moreSheet ? (
        <ActionSheet
          cancelLabel={t(locale, "linkCancel")}
          onClose={() => setMoreSheet(false)}
          actions={[
            {
              label: t(locale, "settings"),
              onSelect: () => setMetaSheet(true),
            },
            {
              label: t(locale, "notebookSpeakers"),
              onSelect: () => setPeople(true),
            },
          ]}
        />
      ) : null}
      {askSpeaker ? (
        <ActionSheet
          message={t(locale, "notebookNoteSpeakerAsk").replace("{name}", askSpeaker.name)}
          cancelLabel={t(locale, "linkCancel")}
          onClose={() => setAskSpeaker(null)}
          actions={[
            {
              label: t(locale, "notebookNoteSpeakerYes"),
              onSelect: () => patch((current) => ({ ...current, speakerId: askSpeaker.id })),
            },
            {
              label: t(locale, "notebookNoteSpeakerSection"),
              onSelect: () => insertSpeakerSection(askSpeaker),
            },
          ]}
        />
      ) : null}
      {dropSpeaker ? (
        <ActionSheet
          cancelLabel={t(locale, "linkCancel")}
          onClose={() => setDropSpeaker(null)}
          actions={[
            {
              label: t(locale, "notebookRemoveSpeaker"),
              destructive: true,
              onSelect: confirmDropSpeaker,
            },
          ]}
        />
      ) : null}
    </>
  );
}
