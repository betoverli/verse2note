import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { OfflineSupport } from "@/components/offline-support";
import { ThemeSync } from "@/components/theme-sync";
import { AppShell } from "@/components/app-shell";
import appCss from "../styles.css?url";

import { pageHead } from "@/lib/seo";

const THEME_BOOT = `(function(){try{var p=JSON.parse(localStorage.getItem("cita-settings")||"{}");var t=(p.state&&p.state.theme)||"system";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=d?"dark":"light";document.documentElement.classList.add(r);document.documentElement.style.colorScheme=r;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#121110":"#f4efe6");}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}})();`;

export const Route = createRootRoute({
  head: () => {
    const seo = pageHead({
      title: "Verse2Note",
      description:
        "Verse2Note — links ricos de referências bíblicas e coleções por tema para YouVersion, Logos e outros apps. Português, English, Español.",
      path: "/",
    });
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        ...seo.meta,
        { name: "theme-color", content: "#121110" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-title", content: "Verse2Note" },
        { name: "application-name", content: "Verse2Note" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "prefetch", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/icon-180.png" },
        { rel: "prefetch", href: "/__grok/icon-180.png" },
        { rel: "describedby", href: "/llms.txt" },
        ...seo.links,
      ],
    };
  },
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="pt" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <PreviewHostBridge />
        <OfflineSupport />
        <ThemeSync />
        <AuthProvider>
          <AppShell />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
