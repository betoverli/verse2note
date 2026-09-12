import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { t } from "@/lib/i18n";
import { noteMatches, notePreview, noteSpeakerIds, todayKey } from "@/lib/notebook";
import { createLocalNote, ensureTodayNote } from "@/lib/notebook-local";
import { listGrantedNotes } from "@/lib/notebook-cloud";
import type { Note } from "@/lib/notebook";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
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
  const people = noteSpeakerIds(note)
    .map((id) => speakers.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 3);
  const preview = notePreview(note);
  return (
    <Link
      to="/notebook/$id"
      params={{ id: note.id }}
      className="flex min-h-16 items-center gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
    >
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
    </Link>
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
