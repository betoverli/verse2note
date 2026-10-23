export type ApnsAlert = {
  title: string;
  body: string;
  href: string;
};

/** APNs alert body. `href` is read by the iOS app when the person taps the alert. */
export function apnsPayload(alert: ApnsAlert) {
  return {
    aps: {
      alert: {
        title: alert.title.slice(0, 120),
        body: alert.body.slice(0, 240),
      },
      sound: "default",
    },
    href: alert.href.startsWith("/") && !alert.href.startsWith("//") ? alert.href.slice(0, 200) : "/app",
  };
}
