import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { NotebookEditor } from "@/components/notebook-editor";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notebook/$id")({
  component: NotebookNoteRoute,
  head: () =>
    pageHead({
      title: "Verse2Note — Nota",
      description: "Nota do caderno.",
      path: "/notebook",
    }),
});

function NotebookNoteRoute() {
  const { id } = Route.useParams();
  const locale = useAppStore((s) => s.locale);
  const note = useAppStore((s) => s.notes.find((item) => item.id === id));
  if (!note) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-8 sm:px-6">
        <AppHeader title={t(locale, "notebook")} backTo="/notebook" />
        <p className="text-sm text-muted">{t(locale, "notebookEmpty")}</p>
        <Button asChild>
          <Link to="/notebook">{t(locale, "back")}</Link>
        </Button>
      </main>
    );
  }
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 pt-0 sm:px-6">
      <NotebookEditor note={note} />
    </main>
  );
}
