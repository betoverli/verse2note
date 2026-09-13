import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/notebook/g/$id")({
  component: NotebookGroupRedirect,
});

function NotebookGroupRedirect() {
  const { id } = Route.useParams();
  return <Navigate to="/groups/$id" params={{ id }} />;
}
