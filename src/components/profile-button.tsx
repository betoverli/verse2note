import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AvatarMark } from "@/lib/avatars";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function ProfileButton() {
  const locale = useAppStore((s) => s.locale);
  const avatarId = useAppStore((s) => s.avatarId);
  const { user, isPending } = useCurrentUserState();

  return (
    <Link
      to="/profile"
      aria-label={t(locale, "profile")}
      className="grid size-9 place-items-center rounded-full text-fg hover:bg-elevated"
    >
      {isPending ? (
        <span className="size-8 rounded-full bg-elevated" />
      ) : user ? (
        <AvatarMark id={avatarId} className="size-8 bg-elevated" iconClassName="size-4" />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-elevated text-muted">
          <User className="size-4" />
        </span>
      )}
    </Link>
  );
}
