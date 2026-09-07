import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { AppearanceSettings } from "@/components/settings-panel";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/theme")({
  component: ProfileTheme,
});

function ProfileTheme() {
  const locale = useAppStore((s) => s.locale);
  return (
    <>
      <AppHeader title={t(locale, "appearance")} backTo="/profile" />
      <AppearanceSettings />
    </>
  );
}
