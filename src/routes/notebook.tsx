import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/notebook")({
  component: NotebookLayout,
});

function NotebookLayout() {
  return <Outlet />;
}
