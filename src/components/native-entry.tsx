import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { authEnabled, signIn } from "@/lib/auth/client";
import { GOOGLE_PROVIDER_ID } from "@/lib/auth/google";
import { useGoogleSignInEnabled } from "@/lib/auth/use-google-sign-in";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="size-4 fill-current">
      <path d="M12.65 9.28c-.02-2.02 1.65-2.99 1.72-3.03-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.61-.71-2.65-.69-1.36.02-2.62.79-3.32 2.01-1.42 2.46-.36 6.1 1.02 8.1.67.98 1.48 2.08 2.53 2.04 1.02-.04 1.4-.66 2.63-.66 1.23 0 1.58.66 2.65.64 1.1-.02 1.79-1 2.46-1.98.77-1.13 1.09-2.22 1.11-2.28-.02-.01-2.13-.82-2.15-3.25zM10.9 3.36c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.56-.85 2.48.9.07 1.82-.46 2.39-1.14z" />
    </svg>
  );
}

/** True when Better Auth has Apple social configured. Hidden until then. */
function appleSignInAvailable(): boolean {
  return false;
}

/**
 * Minimal iOS-app welcome for the Capacitor shell. The public website landing
 * stays unchanged. Create / sign-in open the existing `/login` flows; Google
 * (and Apple when present) create or resume an account the same way as login.
 */
export function NativeEntry() {
  const locale = useAppStore((s) => s.locale);
  const google = useGoogleSignInEnabled();
  const apple = appleSignInAvailable();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSocial(providerId: string) {
    setError(null);
    setBusy(true);
    try {
      await signIn(providerId, { callbackURL: "/app" });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setBusy(false);
        return;
      }
      const message = err instanceof Error ? err.message : "";
      setError(/pop-up|popup/i.test(message) ? t(locale, "accountPopup") : message || t(locale, "accountError"));
      setBusy(false);
    }
  }

  return (
    <main
      className="mx-auto flex h-dvh w-full max-w-md flex-col bg-bg px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      suppressHydrationWarning
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <img
          src="/icon-192.png"
          alt=""
          width={96}
          height={96}
          className="size-24 rounded-[1.5rem] object-cover"
        />
        <div className="mt-6">
          <Wordmark size="md" />
        </div>
        <p className="mt-3 max-w-[16rem] text-pretty text-[17px] leading-snug text-muted">
          {t(locale, "tagline")}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-3">
        {authEnabled && google ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            size="lg"
            disabled={busy}
            onClick={() => void onSocial(GOOGLE_PROVIDER_ID)}
          >
            <GoogleMark />
            {t(locale, "continueGoogle")}
          </Button>
        ) : null}
        {authEnabled && apple ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            size="lg"
            disabled={busy}
            onClick={() => void onSocial("apple")}
          >
            <AppleMark />
            {t(locale, "continueApple")}
          </Button>
        ) : null}

        <Button className="w-full" size="lg" asChild>
          <Link to="/login" search={{ create: true, next: "/app" }}>
            {t(locale, "createAccount")}
          </Link>
        </Button>
        <Button variant="ghost" className="w-full text-accent" size="lg" asChild>
          <Link to="/login" search={{ create: false, next: "/app" }}>
            {t(locale, "haveAccount")}
          </Link>
        </Button>

        {error ? <p className="text-center text-[15px] text-danger">{error}</p> : null}
        {!authEnabled ? (
          <p className="text-center text-sm text-muted">{t(locale, "accountOff")}</p>
        ) : null}
      </div>
    </main>
  );
}
