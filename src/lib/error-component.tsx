import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-muted" aria-hidden="true">
        <TriangleAlert className="size-8" strokeWidth={1.75} />
      </span>
      <h1>
        <Wordmark size="sm" />
      </h1>
      <p className="max-w-md text-sm break-words text-muted">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
    </main>
  );
}
