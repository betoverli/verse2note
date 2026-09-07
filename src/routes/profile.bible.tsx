import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { BibleSettings } from "@/components/settings-panel";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/bible")({
  component: ProfileBible,
});

function ProfileBible() {
  const locale = useAppStore((s) => s.locale);
  return (
    <>
      <AppHeader title={t(locale, "bibleApp")} backTo="/profile" />
      <BibleSettings />
    </>
  );
}
