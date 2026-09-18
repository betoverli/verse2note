import { useEffect, useRef, useState } from "react";
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
import { ViewportSheet } from "@/components/viewport-sheet";
import { cn } from "@/lib/utils";
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
      setState({
        offsetTop: overlap > 120 ? vv.offsetTop : 0,
        keyboard: overlap > 120,
        overlap,
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
}: {
  note: Note;
  readOnly?: boolean;
  speakerList?: Speaker[];
  fromGroup?: string;
}) {
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
  const [focusId, setFocusId] = useState<string | null>(draft.blocks[0] && draft.blocks[0].type !== "speaker" ? draft.blocks[0].id : null);
  const focusIdRef = useRef(focusId);
  focusIdRef.current = focusId;
  const [pending, setPending] = useState<ReturnType<typeof detectTrailingRef>>(null);
  const [metaSheet, setMetaSheet] = useState(false);
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
  }, [pending, readOnly, picker]);

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

  const toolbar = readOnly ? null : (
    <div className="border-t border-border/60 px-1 pb-1">
      {pending ? (
        <button
          type="button"
          onPointerDown={toolPointer(confirmRef)}
          className="mb-1 flex min-h-10 w-full items-center justify-center rounded-md bg-accent px-3 text-sm text-accent-fg"
        >
          {t(locale, "notebookConfirmRef")}
        </button>
      ) : null}
      <div className="flex items-center justify-between gap-0.5">
        <Button type="button" variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookBold")} onPointerDown={toolPointer(() => formatSelection("bold"))}>
          <Bold />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookItalic")} onPointerDown={toolPointer(() => formatSelection("italic"))}>
          <Italic />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-11", activeLine?.type === "h" && "bg-elevated")}
          aria-label={t(locale, "notebookHeading")}
          onPointerDown={toolPointer(() => toggleLine("h"))}
        >
          <Type />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-11", activeLine?.type === "ul" && "bg-elevated")}
          aria-label={t(locale, "notebookList")}
          onPointerDown={toolPointer(() => toggleLine("ul"))}
        >
          <List />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-11", activeLine?.type === "ol" && "bg-elevated")}
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
          aria-label={t(locale, "notebookAddRef")}
          onPointerDown={(event) => {
            event.preventDefault();
            try {
              docApi.current?.markCaret();
            } catch {
              /* keep opening */
            }
            setPicker(true);
            requestAnimationFrame(() => {
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            });
          }}
        >
          <BookOpen />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookAddSpeaker")} onPointerDown={toolPointer(() => setPeople(true))}>
          <UserRound />
        </Button>
        {useAppStore.getState().notebookActiveSpeakerId ? (
          <Button type="button" variant="ghost" size="icon" className="size-11" aria-label={t(locale, "notebookExitSpeaker")} onPointerDown={toolPointer(exitSpeaker)}>
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
          backTo={fromGroup ? "/groups/$id" : "/notebook"}
          backParams={fromGroup ? { id: fromGroup } : undefined}
          compact={false}
          extra={
            picker ? (
              <NotebookPickerSheet
                open
                onClose={() => {
                  docApi.current?.clearCaret();
                  setPicker(false);
                }}
                onPick={onPickRef}
              />
            ) : (
              toolbar
            )
          }
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
              <Button
                variant="ghost"
                size="icon"
                className="size-12 text-fg [&_svg]:size-6"
                aria-label={t(locale, "settings")}
                onClick={() => setMetaSheet(true)}
              >
                <Ellipsis />
              </Button>
            )
          }
        />
      </div>
      <div style={{ height: chromeH }} aria-hidden />
      <div className="flex flex-col gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
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
            requestAnimationFrame(() => {
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            });
          }}
          onRemoveSpeaker={removeSpeaker}
        />
      </div>

      {metaSheet ? (
        <ViewportSheet onClose={() => setMetaSheet(false)}>
          <div
            className="sheet-invert max-h-full w-full max-w-sm overflow-y-auto rounded-t-xl p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-4 text-sm font-medium text-fg">{t(locale, "settings")}</p>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "notebookDate")}</p>
            <input
              type="date"
              value={draft.happenedAt}
              onChange={(event) => patch((current) => ({ ...current, happenedAt: event.target.value }))}
              aria-label={t(locale, "notebookDate")}
              className="mb-5 h-12 w-full rounded-md bg-surface px-3 text-base text-fg outline-none"
            />
            <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "notebookTags")}</p>
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
            <div className="mb-5 flex gap-2">
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
            <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "notebookNoteSpeaker")}</p>
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => patch((current) => ({ ...current, speakerId: null }))}
                className={`rounded-full px-3 py-1 text-sm ${draft.speakerId ? "bg-surface text-muted" : "bg-accent text-accent-fg"}`}
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
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${draft.speakerId === item.id ? "bg-accent text-accent-fg" : "bg-surface text-fg"}`}
                >
                  <span className="size-2 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </button>
              ))}
            </div>
            <NotebookGroupPublishList note={draft} />
            <Button className="mt-4 w-full" variant="ghost" onClick={() => setMetaSheet(false)}>
              {t(locale, "back")}
            </Button>
          </div>
        </ViewportSheet>
      ) : null}

      <NotebookSpeakerSheet open={people} onClose={() => setPeople(false)} onPick={addSpeaker} />
      {askSpeaker ? (
        <ViewportSheet onClose={() => setAskSpeaker(null)}>
          <div
            className="w-full max-w-sm rounded-t-xl bg-elevated p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-medium text-fg">
              {t(locale, "notebookNoteSpeakerAsk").replace("{name}", askSpeaker.name)}
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                patch((current) => ({ ...current, speakerId: askSpeaker.id }));
                setAskSpeaker(null);
              }}
            >
              {t(locale, "notebookNoteSpeakerYes")}
            </Button>
            <Button
              variant="secondary"
              className="mt-2 w-full"
              onClick={() => {
                insertSpeakerSection(askSpeaker);
                setAskSpeaker(null);
              }}
            >
              {t(locale, "notebookNoteSpeakerSection")}
            </Button>
          </div>
        </ViewportSheet>
      ) : null}
    </>
  );
}
