import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type NotifyKind = "reading" | "friends" | "shares";

export type NotifyPrefs = {
  reading: boolean;
  friends: boolean;
  shares: boolean;
};

export type InboxItem = {
  id: string;
  kind: NotifyKind;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export const getVapidPublicKey = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { vapidPublicKey } = await import("./notify.server");
    return vapidPublicKey();
  });

export const getNotifyPrefs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { loadPrefs, hasSubscription } = await import("./notify.server");
    const prefs = await loadPrefs(context.userId);
    const subscribed = await hasSubscription(context.userId);
    return { ...prefs, subscribed };
  });

export const saveNotifyPrefs = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: Partial<NotifyPrefs>) => data)
  .handler(async ({ context, data }) => {
    const { savePrefs } = await import("./notify.server");
    return savePrefs(context.userId, data);
  });

export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { endpoint: string; p256dh: string; auth: string }) => data)
  .handler(async ({ context, data }) => {
    const { saveSubscription } = await import("./notify.server");
    return saveSubscription(context.userId, data);
  });

export const dropPushSubscription = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { endpoint: string }) => data)
  .handler(async ({ context, data }) => {
    const { dropSubscription } = await import("./notify.server");
    await dropSubscription(context.userId, data.endpoint);
    return { ok: true as const };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listInbox, maybeSendDigests } = await import("./notify.server");
    void maybeSendDigests().catch(() => undefined);
    return listInbox(context.userId);
  });

export const getUnreadCount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { unreadCount } = await import("./notify.server");
    return unreadCount(context.userId);
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id?: string }) => data)
  .handler(async ({ context, data }) => {
    const { markRead } = await import("./notify.server");
    await markRead(context.userId, data.id);
    return { ok: true as const };
  });
