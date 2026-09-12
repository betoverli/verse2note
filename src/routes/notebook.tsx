import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { isOwnerHandle } from "@/lib/admin";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/notebook")({
  component: NotebookLayout,
});

function NotebookLayout() {
  const hydrated = useAppStore((s) => s.cloudHydrated);
  const preview = useAppStore((s) => s.notebookPreview);
  const handle = useAppStore((s) => s.handle);
  if (!hydrated) return null;
  if (!preview && !isOwnerHandle(handle)) return <Navigate to="/app" />;
  return <Outlet />;
}