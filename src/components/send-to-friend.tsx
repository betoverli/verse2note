import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProfileAvatar } from "@/lib/avatars";
import { t } from "@/lib/i18n";
import { listLinks, sendCollectionToFriend, sendPlanToFriend, type LinkPerson } from "@/lib/links";
import { sendNoteToFriend } from "@/lib/notebook-cloud";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SheetGrabber, ViewportSheet, formSheetClass } from "@/components/viewport-sheet";
import { cn } from "@/lib/utils";

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

  const sheet = open ? (
    <ViewportSheet onClose={() => setOpen(false)}>
      <div className={cn(formSheetClass, "px-4")}>
        <SheetGrabber />
        <p className="mb-3 text-center text-[17px] font-semibold text-fg">{t(locale, "linkSend")}</p>
        {friends == null ? (
          <div className="h-24 rounded-[16px] bg-surface" aria-hidden />
        ) : friends.length === 0 ? (
          <p className="px-1 py-4 text-center text-[15px] text-muted">
            {t(locale, "linkNone")}{" "}
            <Link to="/profile/friends" className="text-accent" onClick={() => setOpen(false)}>
              {t(locale, "friends")}
            </Link>
          </p>
        ) : (
          <ul className="ios-group max-h-72 overflow-y-auto">
            {friends.map((person) => (
              <li key={person.userId}>
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => void send(person)}
                  className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-fg active:bg-fill disabled:opacity-40"
                >
                  <ProfileAvatar
                    id={person.avatarId}
                    url={person.avatarUrl}
                    className="size-8 bg-fill"
                    iconClassName="size-4"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[17px]">
                      {person.firstName || `@${person.handle}`}
                    </span>
                    {person.handle ? <span className="block truncate text-[13px] text-muted">@{person.handle}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="mt-2 flex min-h-11 w-full items-center justify-center text-[17px] font-semibold text-accent active:opacity-60"
          onClick={() => setOpen(false)}
        >
          {t(locale, "linkCancel")}
        </button>
      </div>
    </ViewportSheet>
  ) : null;

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
