import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/notebook")({
  component: NotebookLayout,
});

function NotebookLayout() {
  const hydrated = useAppStore((s) => s.cloudHydrated);
  const preview = useAppStore((s) => s.notebookPreview);
  if (!hydrated) return null;
  if (!preview) return <Navigate to="/app" />;
  return <Outlet />;
}