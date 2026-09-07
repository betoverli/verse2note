import { Outlet, createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile")({
  component: ProfileLayout,
  head: () =>
    pageHead({
      title: "Verse2Note — Perfil",
      description: "Conta Verse2Note: avatar, @ e nome.",
      path: "/profile",
    }),
});

function ProfileLayout() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <Outlet />
    </main>
  );
}
