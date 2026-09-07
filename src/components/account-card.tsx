import { useState, useSyncExternalStore } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const subscribeToNothing = () => () => {};

export function AccountCard() {
  const locale = useAppStore((s) => s.locale);
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  const gateSession = useSyncExternalStore(subscribeToNothing, hasGateSessionMarker, () => false);

  if (isPending) {
    return <div className="h-16 rounded-md bg-surface shadow-[var(--shadow-border)]" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        search={{ create: false }}
        className="flex min-h-16 items-center justify-between gap-3 rounded-md bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)]"
      >
        <span>
          <span className="block text-sm font-medium">{t(locale, "signIn")}</span>
          <span className="mt-1 block text-xs text-muted">{t(locale, "accountHint")}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" />
      </Link>
    );
  }

  const label = user.displayName ?? user.primaryEmail ?? t(locale, "account");

  return (
    <div className="flex items-center gap-3 rounded-md bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-elevated text-sm font-medium text-fg">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{label}</span>
        {user.primaryEmail ? <span className="mt-0.5 block truncate text-xs text-muted">{user.primaryEmail}</span> : null}
      </span>
      {authEnabled && !gateSession ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut().catch(() => setSigningOut(false));
          }}
        >
          {signingOut ? t(locale, "signingOut") : t(locale, "signOut")}
        </Button>
      ) : null}
    </div>
  );
}
