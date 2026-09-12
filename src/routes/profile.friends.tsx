import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { FriendsPage } from "@/components/friends-page";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/friends")({
  component: ProfileFriends,
});

function ProfileFriends() {
  const locale = useAppStore((s) => s.locale);
  return (
    <>
      <AppHeader title={t(locale, "friends")} backTo="/profile" />
      <FriendsPage />
    </>
  );
}
