import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/bible/books";
import type { CiteStyle } from "@/lib/bible/passage";
import type { Passage } from "@/lib/bible/passage";
import { detectTrailingRef, passageToRef, type LineBlock, type NoteInline } from "@/lib/notebook";
import { htmlToInlines, inlinesToHtml, parseClipboardPassages, passageFromDataset } from "@/lib/notebook-html";
import { buildDeepLink } from "@/lib/bible/apps";
import { translationById } from "@/lib/bible/translations";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NotebookLine({
  block,
  locale,
  style,
  placeholder,
  active,
  editable = true,
  onChange,
  onEnter,
  onEmptyBackspace,
  onFocus,
  onDetect,
  onTrigger,
  onPasteMany,
}: {
  block: LineBlock;
  locale: Locale;
  style?: Partial<CiteStyle>;
  placeholder?: string;
  active?: boolean;
  editable?: boolean;
  onChange: (inlines: NoteInline[]) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  onFocus: () => void;
  onDetect: (value: ReturnType<typeof detectTrailingRef>) => void;
  onTrigger?: (kind: "at" | "slash") => void;
  onPasteMany?: (passages: Passage[]) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skip = useRef(false);
  const focused = useRef(false);
  const saveTimer = useRef(0);
  const formatKey = `${locale}:${style?.book ?? "name"}:${style?.sep ?? "colon"}`;
  const formatRef = useRef(formatKey);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const html = inlinesToHtml(block.inlines, locale, style);
    const formatChanged = formatRef.current !== formatKey;
    formatRef.current = formatKey;
    if (formatChanged) {
      el.innerHTML = html;
      return;
    }
    if (focused.current) {
      if (needsExternalSync(htmlToInlines(el), block.inlines)) el.innerHTML = html;
      return;
    }
    if (skip.current) {
      skip.current = false;
      return;
    }
    if (el.innerHTML === html) return;
    el.innerHTML = html;
  }, [block.inlines, locale, formatKey, style?.book, style?.sep]);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    el.focus();
    focused.current = true;
    if (block.inlines.length === 0) placeCaret(el, true);
  }, [active, block.id]);

  function emit(flush = false) {
    const el = ref.current;
    if (!el) return;
    skip.current = true;
    let inlines = htmlToInlines(el);
    if (inlines.length === 1 && inlines[0]?.type === "text" && inlines[0].text === "\n") inlines = [];
    const trigger = consumeTrigger(inlines);
    if (trigger) {
      inlines = trigger.inlines;
      el.innerHTML = inlinesToHtml(inlines, locale, style);
      placeAfterContent(el);
      flush = true;
    }
    onDetect(detectTrailingRef(inlines, locale));
    window.clearTimeout(saveTimer.current);
    if (flush) onChange(inlines);
    else saveTimer.current = window.setTimeout(() => onChange(inlines), 280);
    if (trigger) onTrigger?.(trigger.kind);
  }

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const empty = block.inlines.length === 0;

  return (
    <div
      ref={ref}
      data-line-id={block.id}
      contentEditable={Boolean(editable)}
      tabIndex={editable ? 0 : -1}
      role="textbox"
      aria-multiline="true"
      data-placeholder={empty ? placeholder : undefined}
      suppressContentEditableWarning
      className={cn(
        "note-line min-h-7 w-full bg-transparent leading-relaxed text-fg outline-none",
        block.type === "h" && "font-display text-xl italic",
        empty && placeholder && "note-line-empty",
      )}
      onMouseDown={(event) => {
        if (active) return;
        event.preventDefault();
        onFocus();
      }}
      onInput={() => emit()}
      onBlur={() => {
        focused.current = false;
        emit(true);
      }}
      onPaste={(event) => {
        if (!editable) return;
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
        onPasteMany?.(passages);
      }}
      onClick={(event) => {
        if (!window.getSelection()?.isCollapsed) return;
        const target = (event.target as HTMLElement).closest<HTMLElement>(".ref-pill");
        if (target?.dataset.ref) {
          const passage = passageFromDataset(target.dataset.ref);
          if (!passage) return;
          event.preventDefault();
          const state = useAppStore.getState();
          const url = buildDeepLink(state.appId, passage, translationById(state.translationId), state.preferNative);
          if (url) window.open(url, "_blank", "noopener");
        }
      }}
      onFocus={() => {
        focused.current = true;
        onFocus();
      }}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") return;
        if (event.key === "Enter" || event.key === "Return" || event.keyCode === 13) {
          event.preventDefault();
          emit(true);
          onEnter();
        }
        if ((event.key === "Backspace" || event.key === "Delete") && ref.current && isLineHtmlEmpty(ref.current)) {
          event.preventDefault();
          emit(true);
          onEmptyBackspace();
        }
      }}
      onBeforeInput={(event) => {
        const inputType = (event.nativeEvent as InputEvent).inputType;
        if (inputType === "insertParagraph" || inputType === "insertLineBreak") {
          event.preventDefault();
          emit(true);
          onEnter();
          return;
        }
        if (inputType !== "deleteContentBackward" && inputType !== "deleteContentForward") return;
        if (!ref.current || !isLineHtmlEmpty(ref.current)) return;
        event.preventDefault();
        emit(true);
        onEmptyBackspace();
      }}
    />
  );
}

export function formatSelection(command: "bold" | "italic") {
  document.execCommand(command);
}

export function placeCaret(el: HTMLElement, atStart: boolean) {
  if (!el.childNodes.length) el.appendChild(document.createElement("br"));
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(atStart);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function placeAfterContent(el: HTMLElement) {
  let node = el.lastChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) {
    node = document.createTextNode("\u200B");
    el.appendChild(node);
  }
  const sel = window.getSelection();
  const range = document.createRange();
  const len = node.textContent?.length ?? 0;
  range.setStart(node, len);
  range.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export function isLineHtmlEmpty(el: HTMLElement) {
  if (el.querySelector(".ref-pill")) return false;
  const text = (el.innerText ?? "").replace(/\u200B/g, "").replace(/\s/g, "");
  return text.length === 0;
}

export function consumeTrigger(inlines: NoteInline[]): { inlines: NoteInline[]; kind: "at" | "slash" } | null {
  if (!inlines.length) return null;
  const last = inlines[inlines.length - 1];
  if (last.type !== "text") return null;
  const mark = last.text.slice(-1);
  if (mark !== "@" && mark !== "/") return null;
  const before = last.text.slice(0, -1);
  if (before && !/\s$/.test(before)) return null;
  const next = [...inlines];
  if (before) next[next.length - 1] = { ...last, text: before };
  else next.pop();
  return { inlines: next, kind: mark === "@" ? "at" : "slash" };
}

function needsExternalSync(dom: NoteInline[], props: NoteInline[]) {
  if (JSON.stringify(dom) === JSON.stringify(props)) return false;
  const propsRefs = props.filter((part) => part.type === "ref").length;
  const domRefs = dom.filter((part) => part.type === "ref").length;
  return propsRefs > domRefs;
}
