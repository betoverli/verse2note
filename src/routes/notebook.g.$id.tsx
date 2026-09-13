import { createFileRoute } from "@tanstack/react-router";
import { NotebookGroupDetail } from "@/components/notebook-group-detail";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/notebook/g/$id")({
  component: NotebookGroupRoute,
  head: () =>
    pageHead({
      title: "Verse2Note — Grupo",
      description: "Caderno compartilhado de um grupo.",
      path: "/notebook",
    }),
});

function NotebookGroupRoute() {
  const { id } = Route.useParams();
  return <NotebookGroupDetail id={id} />;
}
