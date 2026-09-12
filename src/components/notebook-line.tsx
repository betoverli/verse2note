import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/bible/books";
import type { CiteStyle } from "@/lib/bible/passage";
import { detectTrailingRef, type LineBlock, type NoteInline } from "@/lib/notebook";
import { htmlToInlines, inlinesToHtml, passageFromDataset } from "@/lib/notebook-html";
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
  onChange,
  onEnter,
  onEmptyBackspace,
  onFocus,
  onDetect,
}: {
  block: LineBlock;
  locale: Locale;
  style?: Partial<CiteStyle>;
  placeholder?: string;
  active?: boolean;
  onChange: (inlines: NoteInline[]) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  onFocus: () => void;
  onDetect: (value: ReturnType<typeof detectTrailingRef>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skip = useRef(false);
  const focused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (skip.current || focused.current) {
      skip.current = false;
      return;
    }
    const html = inlinesToHtml(block.inlines, locale, style);
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [block.inlines, locale, style]);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    el.focus();
    focused.current = true;
    if (block.inlines.length === 0) placeCaret(el, true);
    else placeAfterContent(el);
  }, [active, block.id]);

  function emit() {
    const el = ref.current;
    if (!el) return;
    skip.current = true;
    let inlines = htmlToInlines(el);
    if (inlines.length === 1 && inlines[0]?.type === "text" && inlines[0].text === "\n") inlines = [];
    onChange(inlines);
    onDetect(detectTrailingRef(inlines, locale));
  }

  const empty = block.inlines.length === 0;

  return (
    <div
      ref={ref}
      contentEditable={Boolean(active)}
      tabIndex={active ? 0 : -1}
      role="textbox"
      aria-multiline="true"
      data-placeholder={empty ? placeholder : undefined}
      suppressContentEditableWarning
      className={cn(
        "note-line min-h-7 w-full bg-transparent text-base leading-relaxed text-fg outline-none",
        block.type === "h" && "font-display text-xl italic",
        empty && placeholder && "note-line-empty",
      )}
      onMouseDown={(event) => {
        if (active) return;
        event.preventDefault();
        onFocus();
      }}
      onInput={emit}
      onBlur={() => {
        focused.current = false;
        emit();
      }}
      onClick={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>(".ref-pill");
        if (target?.dataset.ref) {
          const passage = passageFromDataset(target.dataset.ref);
          if (!passage) return;
          event.preventDefault();
          const state = useAppStore.getState();
          const url = buildDeepLink(state.appId, passage, translationById(state.translationId), state.preferNative);
          if (url) window.open(url, "_blank", "noopener");
          return;
        }
        if (event.target === ref.current && block.inlines.some((part) => part.type === "ref")) {
          event.preventDefault();
          placeAfterContent(ref.current);
        }
      }}
      onFocus={() => {
        focused.current = true;
        const el = ref.current;
        if (!el) {
          onFocus();
          return;
        }
        if (block.inlines.length === 0) placeCaret(el, true);
        else if (block.inlines.some((part) => part.type === "ref")) placeAfterContent(el);
        onFocus();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          emit();
          onEnter();
        }
        if ((event.key === "Backspace" || event.key === "Delete") && ref.current && isLineHtmlEmpty(ref.current)) {
          event.preventDefault();
          onEmptyBackspace();
        }
      }}
      onBeforeInput={(event) => {
        const inputType = (event.nativeEvent as InputEvent).inputType;
        if (inputType !== "deleteContentBackward" && inputType !== "deleteContentForward") return;
        if (!ref.current || !isLineHtmlEmpty(ref.current)) return;
        event.preventDefault();
        onEmptyBackspace();
      }}
    />
  );
}

export function formatSelection(command: "bold" | "italic") {
  document.execCommand(command);
}

function placeCaret(el: HTMLElement, atStart: boolean) {
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

function isLineHtmlEmpty(el: HTMLElement) {
  if (el.querySelector(".ref-pill")) return false;
  const text = (el.innerText ?? "").replace(/\u200B/g, "").replace(/\s/g, "");
  return text.length === 0;
}
