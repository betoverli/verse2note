import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { ProfilePage } from "@/components/profile-page";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  component: ProfileRoute,
  head: () =>
    pageHead({
      title: "Verse2Note — Perfil",
      description: "Conta Verse2Note: avatar, @, nome e e-mail.",
      path: "/profile",
    }),
});

function ProfileRoute() {
  const locale = useAppStore((s) => s.locale);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader title={t(locale, "profile")} backTo="/app" />
      <ProfilePage />
    </main>
  );
}
