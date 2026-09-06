import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { LinkPreview } from "@/components/link-preview";
import { Picker } from "@/components/picker";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppPage,
  head: () => ({
    meta: [{ title: "Verse2Note" }],
  }),
});

function AppPage() {
  const bookId = useAppStore((s) => s.bookId);
  const chapter = useAppStore((s) => s.chapter);
  const listCount = useAppStore((s) => s.list.length);
  const dock = Boolean((bookId && chapter) || listCount);

  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-6 px-4 pt-0 sm:px-6",
        dock
          ? "pb-[calc(env(safe-area-inset-bottom)+18rem)]"
          : "pb-[calc(env(safe-area-inset-bottom)+2rem)]",
      )}
    >
      <AppHeader />
      <Picker />
      <LinkPreview />
    </main>
  );
}
