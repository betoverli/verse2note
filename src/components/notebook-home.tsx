import { Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Share2, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { noteIncludesSpeaker, noteMatches, notePreview, noteSpeakerIds } from "@/lib/notebook";
import { createLocalNote, deleteLocalNote } from "@/lib/notebook-local";
import { listGrantedNotes } from "@/lib/notebook-cloud";
import { listMyNoteGroups } from "@/lib/notebook-groups";
import type { Note } from "@/lib/notebook";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { shareNote } from "@/lib/share-note";
import { ActionSheet } from "@/components/viewport-sheet";
import { NotebookSpeakerSheet } from "@/components/notebook-speaker-sheet";
import { ViewportFixed } from "@/components/viewport-fixed";
import { useNativeFab } from "@/lib/native/use-native-fab";
import { Button } from "@/components/ui/button";
import { NoteDateGroups, NoteDay } from "@/components/note-date-groups";
import { lockSwipe } from "@/lib/swipe-axis";
import { cn } from "@/lib/utils";

const COMPOSE_NEW = "new";
const COMPOSE_IMPORT = "import";

type Filter = "all" | "tags" | "speakers" | "shared";

function NoteCard({ note, groups }: { note: Note; groups: { id: string; name: string }[] }) {
  const locale = useAppStore((s) => s.locale);
  const speakers = useAppStore((s) => s.speakers);
  const navigate = useNavigate();
  const preview = notePreview(note);
  const [askDelete, setAskDelete] = useState(false);
  const [gone, setGone] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const shareBg = useRef<HTMLDivElement>(null);
  const deleteBg = useRef<HTMLDivElement>(null);
  const shareIcon = useRef<HTMLSpanElement>(null);
  const deleteIcon = useRef<HTMLSpanElement>(null);
  const x = useRef(0);
  const dragged = useRef(false);
  const width = useRef(1);
  const origin = useRef({ x: 0, y: 0, lock: "" as "" | "h" | "v" });
  const paintRef = useRef<(value: number, animate?: boolean) => void>(() => {});
  const finishRef = useRef<(dir: "share" | "delete" | "reset") => void>(() => {});

  function paint(value: number, animate = false) {
    x.current = value;
    const el = layer.current;
    if (el) {
      el.style.transition = animate ? "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
      el.style.transform = `translate3d(${value}px,0,0)`;
    }
    const p = Math.min(1.2, Math.abs(value) / Math.max(1, width.current * 0.32));
    if (shareBg.current) shareBg.current.style.opacity = value > 6 ? "1" : "0";
    if (deleteBg.current) deleteBg.current.style.opacity = value < -6 ? "1" : "0";
    if (shareIcon.current) shareIcon.current.style.transform = `scale(${0.82 + p * 0.28})`;
    if (deleteIcon.current) deleteIcon.current.style.transform = `scale(${0.82 + p * 0.28})`;
  }

  function finish(dir: "share" | "delete" | "reset") {
    const max = width.current;
    if (dir === "delete") {
      paint(0, true);
      setAskDelete(true);
      return;
    }
    if (dir === "share") {
      paint(max, true);
      window.setTimeout(() => {
        paint(0, true);
        void shareNote(note, speakers, t(locale, "notebookMeeting"));
      }, 220);
      return;
    }
    paint(0, true);
  }

  paintRef.current = paint;
  finishRef.current = finish;

  useEffect(() => {
    const el = layer.current;
    if (!el) return;

    const point = (event: TouchEvent | PointerEvent) => {
      if ("touches" in event) {
        const touch = event.touches[0] ?? event.changedTouches[0];
        return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
      }
      return { x: event.clientX, y: event.clientY };
    };

    const onStart = (event: TouchEvent | PointerEvent) => {
      if ("button" in event && event.button) return;
      width.current = wrap.current?.getBoundingClientRect().width || 1;
      const p = point(event);
      origin.current = { x: p.x, y: p.y, lock: "" };
    };

    const onMove = (event: TouchEvent | PointerEvent) => {
      if (origin.current.lock === "v") return;
      const p = point(event);
      const dx = p.x - origin.current.x;
      const dy = p.y - origin.current.y;
      if (!origin.current.lock) {
        const next = lockSwipe(dx, dy);
        if (!next) return;
        origin.current.lock = next;
        if (next !== "h") return;
      }
      if (origin.current.lock !== "h") return;
      // Non-passive touchmove + preventDefault so WKWebView does not steal the
      // gesture for vertical list scroll (pointer-only was broken on iOS).
      event.preventDefault();
      const max = width.current;
      paintRef.current(Math.max(-max, Math.min(max, dx)));
    };

    const onEnd = () => {
      const wasHorizontal = origin.current.lock === "h";
      origin.current.lock = "";
      if (!wasHorizontal) return;
      dragged.current = true;
      window.setTimeout(() => {
        dragged.current = false;
      }, 400);
      const dx = x.current;
      const threshold = Math.max(72, width.current * 0.28);
      if (dx <= -threshold) finishRef.current("delete");
      else if (dx >= threshold) finishRef.current("share");
      else finishRef.current("reset");
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    const onPointerStart = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      onStart(event);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      onMove(event);
    };
    el.addEventListener("pointerdown", onPointerStart);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onEnd);
    el.addEventListener("pointercancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      el.removeEventListener("pointerdown", onPointerStart);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
    };
  }, [note.id]);

  if (gone) return null;

  return (
    <div ref={wrap} className="clip-box relative">
      <div
        ref={shareBg}
        className="pointer-events-none absolute inset-0 flex items-center justify-start bg-accent px-5 text-accent-fg opacity-0"
        aria-hidden
      >
        <span ref={shareIcon} className="inline-flex">
          <Share2 className="size-6" />
        </span>
      </div>
      <div
        ref={deleteBg}
        className="pointer-events-none absolute inset-0 flex items-center justify-end bg-danger px-5 text-white opacity-0"
        aria-hidden
      >
        <span ref={deleteIcon} className="inline-flex">
          <Trash2 className="size-6" />
        </span>
      </div>
      <div
        ref={layer}
        role="link"
        className="relative bg-surface active:bg-fill"
        style={{ touchAction: "pan-y" }}
        onClick={() => {
          if (dragged.current || Math.abs(x.current) > 12) return;
          void navigate({ to: "/notebook/$id", params: { id: note.id } });
        }}
      >
        <div className="flex min-h-11 items-center gap-3 px-4 py-3 text-fg">
          <NoteDay iso={note.happenedAt} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[17px] leading-snug">{note.title || t(locale, "notebookMeeting")}</span>
            {preview ? <span className="mt-0.5 block truncate text-[15px] text-muted">{preview}</span> : null}
          </span>
          {(() => {
            const ids = noteSpeakerIds(note);
            const lead = note.speakerId || ids[0];
            if (!lead) return null;
            return (
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: speakers.find((item) => item.id === lead)?.color ?? "#c4a574" }}
                aria-hidden
              />
            );
          })()}
          {groups.length ? (
            <span className="flex shrink-0 items-center gap-0.5 text-muted" aria-label={t(locale, "notebookGroups")}>
              <Users className="size-4" />
              {groups.length > 1 ? <span className="text-[11px] font-medium">+{groups.length - 1}</span> : null}
            </span>
          ) : null}
        </div>
      </div>
      {askDelete ? (
        <ActionSheet
          variant="alert"
          message={t(locale, "notebookDeleteAsk")}
          cancelLabel={t(locale, "linkCancel")}
          onClose={() => setAskDelete(false)}
          actions={[
            {
              label: t(locale, "notebookDelete"),
              destructive: true,
              onSelect: () => {
                setGone(true);
                deleteLocalNote(note.id);
              },
            },
          ]}
        />
      ) : null}
    </div>
  );
}

export function NotebookHome({ query }: { query: string }) {
  const locale = useAppStore((s) => s.locale);
  const notes = useAppStore((s) => s.notes);
  const speakers = useAppStore((s) => s.speakers);
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const filter = useAppStore((s) => s.notebookFilter);
  const setFilter = useAppStore((s) => s.setNotebookFilter);
  const [tag, setTag] = useState<string | null>(null);
  const [speakerId, setSpeakerId] = useState<string | null>(null);
  const [granted, setGranted] = useState<Note[]>([]);
  const [noteGroups, setNoteGroups] = useState<Record<string, { id: string; name: string }[]>>({});
  const [people, setPeople] = useState(false);
  const [compose, setCompose] = useState(false);

  useEffect(() => {
    if (!user) return;
    void listGrantedNotes()
      .then(setGranted)
      .catch(() => setGranted([]));
    void listMyNoteGroups()
      .then(setNoteGroups)
      .catch(() => setNoteGroups({}));
  }, [user, notes.length]);

  const tags = useMemo(() => [...new Set(notes.flatMap((item) => item.tags))].sort(), [notes]);

  const visible = useMemo(() => {
    let list = notes.filter((item) => noteMatches(item, query, speakers));
    if (filter === "tags" && tag) list = list.filter((item) => item.tags.includes(tag));
    // Include whole-note speakerId as well as section speaker blocks.
    if (filter === "speakers" && speakerId) list = list.filter((item) => noteIncludesSpeaker(item, speakerId));
    if (filter === "shared") list = granted.filter((item) => noteMatches(item, query, speakers));
    return list;
  }, [notes, query, speakers, filter, tag, speakerId, granted]);

  function openNew() {
    const note = createLocalNote();
    void navigate({ to: "/notebook/$id", params: { id: note.id } });
  }

  function openImport() {
    void navigate({ to: "/notebook/import" });
  }

  const composeMenu = [
    { id: COMPOSE_NEW, title: t(locale, "notebookNew"), symbol: "square.and.pencil" },
    { id: COMPOSE_IMPORT, title: t(locale, "notebookImport"), symbol: "square.and.arrow.down" },
  ];

  useNativeFab(t(locale, "notebookNew"), () => setCompose(true), {
    menu: composeMenu,
    onMenuSelect: (id) => {
      if (id === COMPOSE_NEW) openNew();
      else if (id === COMPOSE_IMPORT) openImport();
    },
  });

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t(locale, "notebookAll") },
    { id: "tags", label: t(locale, "notebookTags") },
    { id: "speakers", label: t(locale, "notebookSpeakers") },
    { id: "shared", label: t(locale, "notebookShared") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 overflow-x-auto">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setFilter(item.id);
              setTag(null);
              setSpeakerId(null);
            }}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-4 text-[15px] font-medium",
              filter === item.id ? "bg-accent text-accent-fg" : "bg-fill text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filter === "tags" && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTag(item)}
              className={cn("min-h-11 rounded-full px-4 text-[15px]", tag === item ? "bg-accent text-accent-fg" : "bg-fill text-fg")}
            >
              #{item}
            </button>
          ))}
        </div>
      ) : null}

      {filter === "speakers" ? (
        <div className="flex flex-wrap items-center gap-2">
          {speakers.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSpeakerId(item.id)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px]",
                speakerId === item.id ? "bg-accent text-accent-fg" : "bg-fill text-fg",
              )}
            >
              <span className="size-2 rounded-full" style={{ background: item.color }} />
              {item.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPeople(true)}
            className="flex min-h-11 items-center gap-1 rounded-full bg-fill px-4 text-[15px] text-fg"
            aria-label={t(locale, "notebookRenameSpeaker")}
          >
            <Pencil className="size-3" />
            {t(locale, "notebookRenameSpeaker")}
          </button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="text-sm text-muted">
          {filter === "shared" ? t(locale, "notebookSharedEmpty") : t(locale, "notebookEmpty")}
        </p>
      ) : (
        <NoteDateGroups
          items={visible}
          locale={locale}
          dateOf={(item) => item.happenedAt}
          render={(item) => (
            <li key={item.id}>
              {filter === "shared" ? (
                <Link
                  to="/n/$id"
                  params={{ id: item.id }}
                  className="flex min-h-11 items-center gap-3 px-4 py-3 text-fg active:bg-fill"
                >
                  <NoteDay iso={item.happenedAt} />
                  <span className="truncate text-[17px]">{item.title || t(locale, "notebookMeeting")}</span>
                </Link>
              ) : (
                <NoteCard note={item} groups={noteGroups[item.id] ?? []} />
              )}
            </li>
          )}
        />
      )}

      <ViewportFixed>
        <Button
          className="native-fab fixed right-4 z-20 size-14 rounded-full shadow-[0_8px_20px_rgb(0_0_0/0.22)]"
          style={{ bottom: "calc(var(--tab-bar-height) + 1rem)" }}
          onClick={() => setCompose(true)}
          aria-label={t(locale, "notebookNew")}
          aria-haspopup="menu"
        >
          <Plus />
        </Button>
      </ViewportFixed>
      {compose ? (
        <ActionSheet
          cancelLabel={t(locale, "linkCancel")}
          onClose={() => setCompose(false)}
          actions={[
            {
              label: t(locale, "notebookNew"),
              onSelect: () => openNew(),
            },
            {
              label: t(locale, "notebookImport"),
              onSelect: () => openImport(),
            },
          ]}
        />
      ) : null}
      {people ? <NotebookSpeakerSheet open onClose={() => setPeople(false)} /> : null}
    </div>
  );
}
