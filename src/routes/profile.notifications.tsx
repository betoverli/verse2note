import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { NotifySettings } from "@/components/notify-settings";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/notifications")({
  component: ProfileNotifications,
});

function ProfileNotifications() {
  const locale = useAppStore((s) => s.locale);
  return (
    <>
      <AppHeader title={t(locale, "notifications")} backTo="/profile" />
      <NotifySettings />
    </>
  );
}
