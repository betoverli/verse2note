import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { ProfileEdit } from "@/components/profile-page";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/edit")({
  component: ProfileEditRoute,
  head: () =>
    pageHead({
      title: "Verse2Note — Editar perfil",
      description: "Edite avatar, @, nome e e-mail.",
      path: "/profile/edit",
    }),
});

function ProfileEditRoute() {
  const locale = useAppStore((s) => s.locale);
  return (
    <>
      <AppHeader title={t(locale, "editProfile")} backTo="/profile" />
      <ProfileEdit />
    </>
  );
}
