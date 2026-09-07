import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Landing } from "@/components/landing";
import { useAppStore } from "@/lib/store";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Home,
  head: () =>
    pageHead({
      title: "Verse2Note — links ricos de referências bíblicas",
      description:
        "Crie links ricos de referências bíblicas, coleções por tema e planos de leitura de capítulos para YouVersion, Logos e outros apps. Português, English, Español. Sem conta, funciona offline.",
      path: "/",
    }),
});

function Home() {
  const navigate = useNavigate();
  const onboarded = useAppStore((s) => s.onboarded);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const api = useAppStore.persist;
    if (!api || api.hasHydrated()) {
      setReady(true);
      return;
    }
    return api.onFinishHydration(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready && onboarded) void navigate({ to: "/app" });
  }, [ready, onboarded, navigate]);

  return <Landing />;
}
