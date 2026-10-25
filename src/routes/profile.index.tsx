import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { ProfileScreen } from "@/components/screen";
import { ProfileHeaderActions, ProfileView } from "@/components/profile-page";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/")({
  component: ProfileIndex,
});

function ProfileIndex() {
  const locale = useAppStore((s) => s.locale);
  return (
    <ProfileScreen>
      <AppHeader title={t(locale, "profile")} trailing={<ProfileHeaderActions />} />
      <ProfileView />
    </ProfileScreen>
  );
}