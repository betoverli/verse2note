import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { buildDeepLink } from "@/lib/bible/apps";
import type { Locale } from "@/lib/bible/books";
import type { CiteStyle, Passage } from "@/lib/bible/passage";
import { translationById } from "@/lib/bible/translations";
import { detectTrailingRef, newNoteId, passageToRef, type LineType, type NoteBlock, type Speaker } from "@/lib/notebook";
import {
  blocksSignature,
  blocksToHtml,
  htmlToBlocks,
  htmlToInlines,
  inlinesToHtml,
  parseClipboardPassages,
  passageFromDataset,
} from "@/lib/notebook-html";
import { consumeTrigger, isLineHtmlEmpty, placeCaret } from "@/components/notebook-line";
import { useAppStore } from "@/lib/store";

function lineElFromSel() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const node = sel.anchorNode;
  const el = node instanceof Element ? node : node?.parentElement;
  return el?.closest<HTMLElement>(".note-line") ?? null;
}

function selectedLines(root: HTMLElement) {
  const sel = window.getSelection();
  const all = [...root.querySelectorAll<HTMLElement>(".note-line")];
  if (sel && sel.rangeCount) {
    const hit = all.filter((line) => sel.containsNode(line, true));
    if (hit.length) return hit;
  }
  const one = lineElFromSel();
  return one ? [one] : [];
}

function tidyLine(line: HTMLElement) {
  const hasPill = Boolean(line.querySelector(".ref-pill"));
  const text = (line.textContent ?? "").replace(/\u200B/g, "").trim();
  if (hasPill || text) {
    for (const br of [...line.querySelectorAll("br")]) br.remove();
  }
  if (!line.childNodes.length) line.append(document.createElement("br"));
}

function placeAfterContent(el: HTMLElement) {
  let node = el.lastChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) {
    node = document.createTextNode("\u200B");
    el.appendChild(node);
  }
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(node, node.textContent?.length ?? 0);
  range.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export type NotebookDocHandle = {
  flush: () => void;
  insertPassage: (passage: Passage, lineId?: string | null) => void;
  toggleKind: (type: LineType) => void;
};

type NotebookDocProps = {
  blocks: NoteBlock[];
  locale: Locale;
  style: Partial<CiteStyle>;
  speakers: Speaker[];
  readOnly?: boolean;
  placeholder?: string;
  onBlocks: (blocks: NoteBlock[]) => void;
  onFocusLine: (id: string | null) => void;
  onDetect: (value: ReturnType<typeof detectTrailingRef>) => void;
  onTrigger: (kind: "at" | "slash") => void;
  onRemoveSpeaker: (id: string) => void;
};

export const NotebookDoc = forwardRef<NotebookDocHandle, NotebookDocProps>(function NotebookDoc(
  {
    blocks,
    locale,
    style,
    speakers,
    readOnly,
    placeholder,
    onBlocks,
    onFocusLine,
    onDetect,
    onTrigger,
    onRemoveSpeaker,
  },
  handle,
) {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  const timer = useRef(0);
  const enterLock = useRef(false);
  const selectedIds = useRef<string[]>([]);
  const lastLineId = useRef<string | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const sig = `${blocksSignature(blocks)}:${locale}:${style.book ?? ""}:${style.sep ?? ""}:${speakers.map((item) => item.id + item.name).join()}`;
  const sigRef = useRef(sig);

  function renderHtml() {
    return blocksToHtml(blocksRef.current, locale, style, speakers, placeholder);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (focused.current && sigRef.current === sig) return;
    sigRef.current = sig;
    const html = renderHtml();
    if (el.innerHTML === html) return;
    const id = lineElFromSel()?.dataset.lineId;
    el.innerHTML = html;
    if (focused.current && id) {
      const line = el.querySelector<HTMLElement>(`[data-line-id="${id}"]`);
      if (line) placeAfterContent(line);
    }
  }, [sig, placeholder]);

  useImperativeHandle(handle, () => ({
    flush: () => parse(),
    insertPassage: (passage: Passage, lineId?: string | null) => {
      const root = ref.current;
      if (!root) return;
      const html = inlinesToHtml([passageToRef(passage)], locale, style);
      const id = lineId || lastLineId.current;
      const line =
        (id ? root.querySelector<HTMLElement>(`[data-line-id="${id}"]`) : null) ??
        lineElFromSel() ??
        root.querySelector<HTMLElement>(".note-line");
      if (!line) return;
      lastLineId.current = line.dataset.lineId ?? lastLineId.current;
      if (isLineHtmlEmpty(line)) line.innerHTML = html;
      else {
        const sel = window.getSelection();
        if (sel && sel.rangeCount && sel.anchorNode && line.contains(sel.anchorNode)) {
          document.execCommand("insertHTML", false, html);
        } else line.insertAdjacentHTML("beforeend", html);
      }
      tidyLine(line);
      placeAfterContent(line);
      parse();
    },
    toggleKind: (type: LineType) => {
      const root = ref.current;
      if (!root) return;
      const all = [...root.querySelectorAll<HTMLElement>(".note-line")];
      const live = selectedLines(root);
      const remembered = all.filter((line) => line.dataset.lineId && selectedIds.current.includes(line.dataset.lineId));
      const lines = live.length > 1 ? live : remembered.length ? remembered : live.length ? live : all.slice(0, 1);
      if (!lines.length) return;
      const next = lines.every((line) => line.dataset.kind === type) ? "p" : type;
      for (const line of lines) {
        line.dataset.kind = next;
        line.classList.toggle("note-line-h", next === "h");
      }
      parse();
    },
  }));

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function parse(flushTrigger = true) {
    const el = ref.current;
    if (!el) return;
    const next = htmlToBlocks(el);
    [...el.querySelectorAll<HTMLElement>(".note-line")].forEach((line, index) => {
      const parsed = flattenLines(next)[index];
      if (parsed && !line.dataset.lineId) line.dataset.lineId = parsed.id;
    });
    onBlocks(next);
    sigRef.current = `${blocksSignature(next)}:${locale}:${style.book ?? ""}:${style.sep ?? ""}:${speakers.map((item) => item.id + item.name).join()}`;
    const line = lineElFromSel();
    const id = line?.dataset.lineId ?? null;
    if (id) lastLineId.current = id;
    onFocusLine(id);
    if (!line) {
      onDetect(null);
      return;
    }
    let inlines = htmlToInlines(line);
    if (inlines.length === 1 && inlines[0]?.type === "text" && inlines[0].text === "\n") inlines = [];
    const trigger = consumeTrigger(inlines);
    if (trigger && flushTrigger) {
      inlines = trigger.inlines;
      line.innerHTML = inlinesToHtml(inlines, locale, style) || "<br>";
      placeAfterContent(line);
      onBlocks(htmlToBlocks(el));
      onTrigger(trigger.kind);
    }
    onDetect(detectTrailingRef(inlines, locale));
  }

  function emit(flush = false) {
    window.clearTimeout(timer.current);
    if (flush) parse();
    else timer.current = window.setTimeout(() => parse(), 280);
  }

  function makeLine(kind: string) {
    const next = document.createElement("div");
    next.className = "note-line";
    next.dataset.lineId = newNoteId();
    next.dataset.kind = kind === "h" ? "p" : kind || "p";
    next.append(document.createElement("br"));
    return next;
  }

  function insertLineAfter(target: HTMLElement, kind: string) {
    const next = makeLine(kind);
    target.after(next);
    placeCaret(next, true);
    parse();
  }

  function splitLineAtCaret(line: HTMLElement, kind: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.anchorNode || !line.contains(sel.anchorNode)) {
      insertLineAfter(line, kind);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!range.collapsed) range.deleteContents();
    const after = document.createRange();
    after.setStart(range.endContainer, range.endOffset);
    after.setEnd(line, line.childNodes.length);
    const fragment = after.extractContents();
    const next = makeLine(kind);
    const hasContent = Boolean(
      fragment.querySelector?.(".ref-pill") || (fragment.textContent ?? "").replace(/\u200B/g, "").trim(),
    );
    next.replaceChildren();
    if (hasContent) next.append(fragment);
    else next.append(document.createElement("br"));
    if (isLineHtmlEmpty(line)) line.replaceChildren(document.createElement("br"));
    line.after(next);
    placeCaret(next, true);
    parse();
  }

  function onEnter() {
    if (enterLock.current) return;
    enterLock.current = true;
    window.setTimeout(() => {
      enterLock.current = false;
    }, 40);
    const line = lineElFromSel();
    if (!line) return;
    const empty = isLineHtmlEmpty(line);
    const kind = line.dataset.kind ?? "p";
    if (empty && (kind === "ul" || kind === "ol")) {
      line.dataset.kind = "p";
      line.classList.remove("note-line-h");
      parse();
      return;
    }
    const speaker = line.closest<HTMLElement>("[data-speaker-block]");
    const last = speaker?.querySelector<HTMLElement>(":scope > .note-line:last-of-type");
    if (empty && speaker && last === line) {
      const next = makeLine("p");
      speaker.after(next);
      placeCaret(next, true);
      parse();
      return;
    }
    splitLineAtCaret(line, kind);
  }

  function onMerge() {
    const line = lineElFromSel();
    const root = ref.current;
    if (!line || !root) return;
    if ([...root.querySelectorAll(".note-line")].length <= 1) return;
    const prev = previousLine(line);
    line.remove();
    if (prev) placeAfterContent(prev);
    parse();
  }

  return (
    <div
      ref={ref}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      className="note-doc outline-none"
      onFocus={() => {
        focused.current = true;
        onFocusLine(lineElFromSel()?.dataset.lineId ?? null);
      }}
      onBlur={() => {
        focused.current = false;
        emit(true);
      }}
      onInput={() => emit()}
      onMouseUp={() => {
        const root = ref.current;
        if (root) selectedIds.current = selectedLines(root).map((line) => line.dataset.lineId ?? "").filter(Boolean);
      }}
      onKeyUp={() => {
        const root = ref.current;
        if (root) selectedIds.current = selectedLines(root).map((line) => line.dataset.lineId ?? "").filter(Boolean);
      }}
      onKeyDown={(event) => {
        if (readOnly) return;
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") return;
        if (event.key === "Enter" || event.key === "Return" || event.keyCode === 13) {
          event.preventDefault();
          if (enterLock.current) return;
          emit(true);
          onEnter();
        }
        const line = lineElFromSel();
        if ((event.key === "Backspace" || event.key === "Delete") && line && isLineHtmlEmpty(line)) {
          event.preventDefault();
          onMerge();
        }
      }}
      onBeforeInput={(event) => {
        if (readOnly) return;
        const inputType = (event.nativeEvent as InputEvent).inputType;
        if (inputType === "insertParagraph" || inputType === "insertLineBreak") {
          event.preventDefault();
          if (enterLock.current) return;
          emit(true);
          onEnter();
          return;
        }
        const line = lineElFromSel();
        if (
          (inputType === "deleteContentBackward" || inputType === "deleteContentForward") &&
          line &&
          isLineHtmlEmpty(line)
        ) {
          event.preventDefault();
          onMerge();
        }
      }}
      onPaste={(event) => {
        if (readOnly) return;
        const html = event.clipboardData?.getData("text/html") ?? "";
        const plain = event.clipboardData?.getData("text/plain") ?? "";
        const passages = parseClipboardPassages(html, plain);
        if (!passages.length) return;
        event.preventDefault();
        if (passages.length === 1) {
          document.execCommand("insertHTML", false, inlinesToHtml([passageToRef(passages[0]!)], locale, style));
          emit(true);
          return;
        }
        const line = lineElFromSel();
        let after = line;
        for (const passage of passages) {
          const node = document.createElement("div");
          node.className = "note-line";
          node.dataset.lineId = newNoteId();
          node.dataset.kind = "p";
          node.innerHTML = inlinesToHtml([passageToRef(passage)], locale, style);
          if (after) after.after(node);
          else ref.current?.append(node);
          after = node;
        }
        if (line && isLineHtmlEmpty(line)) line.remove();
        if (after) placeAfterContent(after);
        emit(true);
      }}
      onClick={(event) => {
        const remove = (event.target as HTMLElement).closest<HTMLElement>("[data-remove-speaker]");
        if (remove?.dataset.removeSpeaker) {
          event.preventDefault();
          onRemoveSpeaker(remove.dataset.removeSpeaker);
          return;
        }
        const toggle = (event.target as HTMLElement).closest<HTMLElement>("[data-toggle-speaker]");
        if (toggle) {
          event.preventDefault();
          const section = toggle.closest<HTMLElement>("[data-speaker-block]");
          if (!section) return;
          const next = section.dataset.collapsed !== "true";
          section.dataset.collapsed = next ? "true" : "false";
          const preview = section.querySelector(".note-speaker-preview");
          if (preview instanceof HTMLElement && next) {
            preview.textContent =
              [...section.querySelectorAll<HTMLElement>(":scope > .note-line")]
                .map((line) => (line.textContent ?? "").replace(/\u200B/g, "").trim())
                .find(Boolean) ?? "";
          }
          parse(false);
          return;
        }
        if (!window.getSelection()?.isCollapsed) return;
        const pill = (event.target as HTMLElement).closest<HTMLElement>(".ref-pill");
        if (!pill?.dataset.ref) return;
        const passage = passageFromDataset(pill.dataset.ref);
        if (!passage) return;
        const state = useAppStore.getState();
        const url = buildDeepLink(state.appId, passage, translationById(state.translationId), state.preferNative);
        if (url) window.open(url, "_blank", "noopener");
      }}
    />
  );
});

function flattenLines(blocks: NoteBlock[]) {
  const ids: { id: string }[] = [];
  for (const block of blocks) {
    if (block.type === "speaker") {
      for (const child of block.children) ids.push(child);
    } else ids.push(block);
  }
  return ids;
}

function previousLine(line: HTMLElement) {
  const root = line.closest(".note-doc");
  if (!root) return null;
  const lines = [...root.querySelectorAll<HTMLElement>(".note-line")];
  const index = lines.indexOf(line);
  return index > 0 ? lines[index - 1]! : null;
}
