import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { HelpSettings } from "@/components/settings-panel";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/help")({
  component: ProfileHelp,
});

function ProfileHelp() {
  const locale = useAppStore((s) => s.locale);
  return (
    <>
      <AppHeader title={t(locale, "aboutTitle")} backTo="/profile" />
      <HelpSettings />
    </>
  );
}
