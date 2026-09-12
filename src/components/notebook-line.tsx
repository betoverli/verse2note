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
  onChange: (inlines: NoteInline[]) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  onFocus: () => void;
  onDetect: (value: ReturnType<typeof detectTrailingRef>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skip = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (skip.current) {
      skip.current = false;
      return;
    }
    const html = inlinesToHtml(block.inlines, locale, style);
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [block.inlines, locale, style]);

  function emit() {
    const el = ref.current;
    if (!el) return;
    skip.current = true;
    const inlines = htmlToInlines(el);
    onChange(inlines);
    onDetect(detectTrailingRef(inlines, locale));
  }

  return (
    <div
      ref={ref}
      contentEditable
      role="textbox"
      aria-multiline="true"
      data-placeholder={placeholder}
      suppressContentEditableWarning
      className={cn(
        "note-line min-h-7 w-full bg-transparent text-base leading-relaxed text-fg outline-none",
        block.type === "h" && "font-display text-xl italic",
        block.inlines.length === 0 && "note-line-empty",
      )}
      onClick={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>(".ref-pill");
        if (!target?.dataset.ref) return;
        const passage = passageFromDataset(target.dataset.ref);
        if (!passage) return;
        event.preventDefault();
        const state = useAppStore.getState();
        const url = buildDeepLink(state.appId, passage, translationById(state.translationId), state.preferNative);
        if (url) window.open(url, "_blank", "noopener");
      }}
      onFocus={onFocus}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          emit();
          onEnter();
        }
        if (event.key === "Backspace" && ref.current && htmlToInlines(ref.current).length === 0) {
          event.preventDefault();
          onEmptyBackspace();
        }
      }}
    />
  );
}

export function formatSelection(command: "bold" | "italic") {
  document.execCommand(command);
}
