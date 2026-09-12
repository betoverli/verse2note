import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProfileAvatar } from "@/lib/avatars";
import { t } from "@/lib/i18n";
import { listLinks, sendCollectionToFriend, sendPlanToFriend, type LinkPerson } from "@/lib/links";
import { sendNoteToFriend } from "@/lib/notebook-cloud";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function SendToFriendButton({
  kind,
  targetId,
  iconOnly,
  hideTrigger,
  open: openProp,
  onOpenChange,
}: {
  kind: "plan" | "collection" | "note";
  targetId: string;
  iconOnly?: boolean;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const [innerOpen, setInnerOpen] = useState(false);
  const open = openProp ?? innerOpen;
  function setOpen(value: boolean) {
    if (openProp === undefined) setInnerOpen(value);
    onOpenChange?.(value);
  }
  const [friends, setFriends] = useState<LinkPerson[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void listLinks()
      .then((data) => setFriends(data.friends))
      .catch(() => setFriends([]));
  }, [open]);

  async function send(person: LinkPerson) {
    if (busy) return;
    setBusy(person.handle);
    const result =
      kind === "plan"
        ? await sendPlanToFriend({ data: { handle: person.handle, planId: targetId } })
        : kind === "note"
          ? await sendNoteToFriend({ data: { handle: person.handle, noteId: targetId } })
          : await sendCollectionToFriend({ data: { handle: person.handle, collectionId: targetId } });
    setBusy(null);
    if (!result?.ok) {
      const id = toast.error(t(locale, "linkSendFail"));
      window.setTimeout(() => toast.dismiss(id), 2000);
      return;
    }
    const id = toast.success(t(locale, "linkSent"));
    window.setTimeout(() => toast.dismiss(id), 2000);
    setOpen(false);
  }

  const sheet =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-fg/50 px-4 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))]"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)]"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-sm font-medium text-fg">{t(locale, "linkSend")}</p>
              {friends == null ? (
                <div className="mt-3 h-24 rounded-md bg-surface" aria-hidden />
              ) : friends.length === 0 ? (
                <p className="mt-3 text-sm text-muted">
                  {t(locale, "linkNone")}{" "}
                  <Link to="/profile/friends" className="text-fg underline-offset-2 hover:underline" onClick={() => setOpen(false)}>
                    {t(locale, "friends")}
                  </Link>
                </p>
              ) : (
                <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
                  {friends.map((person) => (
                    <li key={person.userId}>
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => void send(person)}
                        className="flex min-h-12 w-full items-center gap-3 rounded-md px-2 text-left text-fg hover:bg-surface"
                      >
                        <ProfileAvatar
                          id={person.avatarId}
                          url={person.avatarUrl}
                          className="size-8 bg-surface"
                          iconClassName="size-4"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {person.firstName || `@${person.handle}`}
                          </span>
                          {person.handle ? (
                            <span className="block truncate text-xs text-muted">@{person.handle}</span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="ghost" className="mt-3 w-full text-muted" onClick={() => setOpen(false)}>
                {t(locale, "back")}
              </Button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {hideTrigger ? null : iconOnly ? (
        <Button
          size="icon"
          variant="ghost"
          className="size-12 text-fg [&_svg]:size-6"
          aria-label={t(locale, "linkSend")}
          onClick={() => setOpen(true)}
        >
          <UserPlus />
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          {t(locale, "linkSend")}
        </Button>
      )}
      {sheet}
    </>
  );
}
