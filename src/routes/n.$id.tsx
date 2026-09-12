import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { NotebookEditor } from "@/components/notebook-editor";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isOwnerHandle } from "@/lib/admin";
import { t } from "@/lib/i18n";
import { getGrantedNote, getSharedNote } from "@/lib/notebook-cloud";
import { remixNote } from "@/lib/notebook-local";
import type { Note, Speaker } from "@/lib/notebook";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/n/$id")({
  component: SharedNoteRoute,
  head: () => {
    const seo = pageHead({
      title: "Verse2Note — Nota",
      description: "Nota compartilhada do caderno.",
      path: "/n",
    });
    return { ...seo, meta: [...seo.meta, { name: "robots", content: "noindex" }] };
  },
});

function SharedNoteRoute() {
  const { id } = Route.useParams();
  const locale = useAppStore((s) => s.locale);
  const hydrated = useAppStore((s) => s.cloudHydrated);
  const preview = useAppStore((s) => s.notebookPreview);
  const mine = useAppStore((s) => s.notes.find((item) => item.id === id));
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [payload, setPayload] = useState<{ note: Note; speakers: Speaker[] } | null | undefined>(undefined);

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    void (async () => {
      if (user) {
        try {
          const granted = await getGrantedNote({ data: { id } });
          if (cancelled) return;
          if (granted) {
            setPayload(granted);
            return;
          }
        } catch {
          /* fall through */
        }
      }
      try {
        const shared = await getSharedNote({ data: { id } });
        if (!cancelled) setPayload(shared);
      } catch {
        if (!cancelled) setPayload(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user, isPending]);

  if (!hydrated) return null;
  if (!preview && !isOwnerHandle(useAppStore.getState().handle)) return <Navigate to="/app" />;

  if (mine) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 pt-0 sm:px-6">
        <NotebookEditor note={mine} />
      </main>
    );
  }

  const note = payload?.note;
  if (payload === undefined) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pt-0 sm:px-6">
        <AppHeader title={t(locale, "notebook")} backTo="/notebook" />
      </main>
    );
  }
  if (!note) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 sm:px-6">
        <AppHeader title={t(locale, "notebook")} backTo="/notebook" />
        <p className="text-sm text-muted">{t(locale, "notebookEmpty")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 pt-0 pb-[calc(var(--tab-bar-height)+2rem)] sm:px-6">
      <NotebookEditor note={note} readOnly speakerList={payload?.speakers ?? []} />
      <Button
        onClick={() => {
          const copy = remixNote(note, payload?.speakers ?? []);
          if (copy) void navigate({ to: "/notebook/$id", params: { id: copy.id } });
        }}
      >
        {t(locale, "notebookRemix")}
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/notebook">{t(locale, "back")}</Link>
      </Button>
    </main>
  );
}
