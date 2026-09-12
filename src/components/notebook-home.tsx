import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { noteMatches, notePreview, noteSpeakerIds, todayKey } from "@/lib/notebook";
import { createLocalNote, deleteLocalNote, ensureTodayNote } from "@/lib/notebook-local";
import { listGrantedNotes } from "@/lib/notebook-cloud";
import type { Note } from "@/lib/notebook";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { SendToFriendButton } from "@/components/send-to-friend";
import { ViewportSheet } from "@/components/viewport-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Filter = "all" | "tags" | "speakers" | "shared";

function formatDay(iso: string, locale: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(locale === "en" ? "en" : locale === "es" ? "es" : "pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function NoteCard({ note }: { note: Note }) {
  const locale = useAppStore((s) => s.locale);
  const speakers = useAppStore((s) => s.speakers);
  const navigate = useNavigate();
  const people = noteSpeakerIds(note)
    .map((id) => speakers.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 3);
  const preview = notePreview(note);
  const [share, setShare] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [gone, setGone] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const shareBg = useRef<HTMLDivElement>(null);
  const deleteBg = useRef<HTMLDivElement>(null);
  const shareIcon = useRef<HTMLSpanElement>(null);
  const deleteIcon = useRef<HTMLSpanElement>(null);
  const x = useRef(0);
  const start = useRef({ x: 0, y: 0, lock: "" as "" | "h" | "v" });
  const width = useRef(1);

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
        setShare(true);
      }, 220);
      return;
    }
    paint(0, true);
  }

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
      start.current = { x: p.x, y: p.y, lock: "" };
    };

    const onMove = (event: TouchEvent | PointerEvent) => {
      const p = point(event);
      if (!p.x && !p.y && !start.current.lock) return;
      const dx = p.x - start.current.x;
      const dy = p.y - start.current.y;
      if (!start.current.lock) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        start.current.lock = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      }
      if (start.current.lock !== "h") return;
      event.preventDefault();
      const max = width.current;
      paint(Math.max(-max, Math.min(max, dx)));
    };

    const onEnd = () => {
      const lock = start.current.lock;
      const dx = x.current;
      start.current.lock = "";
      if (lock !== "h") return;
      const threshold = Math.max(72, width.current * 0.28);
      if (dx <= -threshold) finish("delete");
      else if (dx >= threshold) finish("share");
      else finish("reset");
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
    <div ref={wrap} className="relative overflow-hidden rounded-lg shadow-[var(--shadow-border)]">
      <div
        ref={shareBg}
        className="pointer-events-none absolute inset-0 flex items-center justify-start bg-accent px-5 text-accent-fg opacity-0"
        aria-hidden
      >
        <span ref={shareIcon} className="inline-flex">
          <UserPlus className="size-6" />
        </span>
      </div>
      <div
        ref={deleteBg}
        className="pointer-events-none absolute inset-0 flex items-center justify-end bg-[#8b3a32] px-5 text-[#f3eee6] opacity-0"
        aria-hidden
      >
        <span ref={deleteIcon} className="inline-flex">
          <Trash2 className="size-6" />
        </span>
      </div>
      <div
        ref={layer}
        role="link"
        className="relative bg-surface will-change-transform"
        style={{ touchAction: "pan-y" }}
        onClick={() => {
          if (Math.abs(x.current) > 12) return;
          void navigate({ to: "/notebook/$id", params: { id: note.id } });
        }}
      >
        <div className="flex min-h-16 items-center gap-3 px-4 py-3 text-fg">
          <span className="w-14 shrink-0 text-[11px] font-medium tracking-wide text-muted uppercase">
            {formatDay(note.happenedAt, locale)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{note.title || t(locale, "notebookMeeting")}</span>
            {preview ? <span className="mt-0.5 block truncate text-xs text-muted">{preview}</span> : null}
          </span>
          {people.length ? (
            <span className="flex">
              {people.map((speaker, index) =>
                speaker ? (
                  <span
                    key={speaker.id}
                    className={cn("size-6 rounded-full ring-2 ring-bg", index ? "-ml-1.5" : "")}
                    style={{ background: speaker.color }}
                  />
                ) : null,
              )}
            </span>
          ) : null}
        </div>
      </div>
      <SendToFriendButton kind="note" targetId={note.id} hideTrigger open={share} onOpenChange={setShare} />
      {askDelete ? (
        <ViewportSheet onClose={() => setAskDelete(false)}>
          <div
            className="w-full max-w-sm rounded-t-xl bg-elevated p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-medium text-fg">{t(locale, "notebookDeleteAsk")}</p>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" variant="ghost" onClick={() => setAskDelete(false)}>
                {t(locale, "linkCancel")}
              </Button>
              <Button
                className="flex-1 bg-[#8b3a32] text-[#f3eee6] hover:bg-[#8b3a32]/90"
                onClick={() => {
                  setAskDelete(false);
                  setGone(true);
                  deleteLocalNote(note.id);
                }}
              >
                {t(locale, "notebookDelete")}
              </Button>
            </div>
          </div>
        </ViewportSheet>
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
  const [filter, setFilter] = useState<Filter>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [speakerId, setSpeakerId] = useState<string | null>(null);
  const [granted, setGranted] = useState<Note[]>([]);
  const today = notes.find((item) => item.happenedAt === todayKey());

  useEffect(() => {
    if (!user) return;
    void listGrantedNotes()
      .then(setGranted)
      .catch(() => setGranted([]));
  }, [user]);

  const tags = useMemo(() => [...new Set(notes.flatMap((item) => item.tags))].sort(), [notes]);

  const visible = useMemo(() => {
    let list = notes.filter((item) => noteMatches(item, query, speakers));
    if (filter === "tags" && tag) list = list.filter((item) => item.tags.includes(tag));
    if (filter === "speakers" && speakerId) list = list.filter((item) => noteSpeakerIds(item).includes(speakerId));
    if (filter === "shared") list = granted.filter((item) => noteMatches(item, query, speakers));
    return list;
  }, [notes, query, speakers, filter, tag, speakerId, granted]);

  function openToday() {
    const note = ensureTodayNote();
    void navigate({ to: "/notebook/$id", params: { id: note.id } });
  }

  function openNew() {
    const note = createLocalNote();
    void navigate({ to: "/notebook/$id", params: { id: note.id } });
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t(locale, "notebookAll") },
    { id: "tags", label: t(locale, "notebookTags") },
    { id: "speakers", label: t(locale, "notebookSpeakers") },
    { id: "shared", label: t(locale, "notebookShared") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={openToday}
        className="flex min-h-20 flex-col justify-center rounded-lg bg-accent px-4 py-3 text-left text-accent-fg shadow-[var(--shadow-border)]"
      >
        <span className="text-[11px] font-medium tracking-wide uppercase opacity-70">{t(locale, "notebookToday")}</span>
        <span className="font-display text-2xl italic">
          {today?.title || t(locale, "notebookMeeting")}
        </span>
      </button>

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
              "min-h-9 shrink-0 rounded-full px-3 text-xs font-medium",
              filter === item.id ? "bg-accent text-accent-fg" : "bg-surface text-muted",
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
              className={cn("rounded-full px-3 py-1 text-xs", tag === item ? "bg-accent text-accent-fg" : "bg-surface text-muted")}
            >
              #{item}
            </button>
          ))}
        </div>
      ) : null}

      {filter === "speakers" ? (
        <div className="flex flex-wrap gap-2">
          {speakers.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSpeakerId(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1 text-xs",
                speakerId === item.id ? "bg-accent text-accent-fg" : "bg-surface text-muted",
              )}
            >
              <span className="size-2 rounded-full" style={{ background: item.color }} />
              {item.name}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="text-sm text-muted">
          {filter === "shared" ? t(locale, "notebookSharedEmpty") : t(locale, "notebookEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((item) => (
            <li key={item.id}>
              {filter === "shared" ? (
                <Link
                  to="/n/$id"
                  params={{ id: item.id }}
                  className="flex min-h-16 items-center gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)]"
                >
                  <span className="w-14 shrink-0 text-[11px] font-medium tracking-wide text-muted uppercase">
                    {formatDay(item.happenedAt, locale)}
                  </span>
                  <span className="truncate text-sm font-medium">{item.title || t(locale, "notebookMeeting")}</span>
                </Link>
              ) : (
                <NoteCard note={item} />
              )}
            </li>
          ))}
        </ul>
      )}

      <Button className="fixed right-4 z-20 size-12 rounded-full" style={{ bottom: "calc(var(--tab-bar-height) + 1rem)" }} onClick={openNew} aria-label={t(locale, "notebookNew")}>
        <Plus />
      </Button>
    </div>
  );
}
