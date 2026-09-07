import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { ProfileView } from "@/components/profile-page";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/")({
  component: ProfileIndex,
});

function ProfileIndex() {
  const locale = useAppStore((s) => s.locale);
  return (
    <>
      <AppHeader title={t(locale, "profile")} backTo="/app" />
      <ProfileView />
    </>
  );
}
