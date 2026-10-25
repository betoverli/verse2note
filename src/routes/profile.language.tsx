import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { ProfileScreen } from "@/components/screen";
import { LanguageSettings } from "@/components/settings-panel";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/language")({
  component: ProfileLanguage,
});

function ProfileLanguage() {
  const locale = useAppStore((s) => s.locale);
  return (
    <ProfileScreen>
      <AppHeader title={t(locale, "language")} backTo="/profile" />
      <LanguageSettings />
    </ProfileScreen>
  );
}
