# Verse2Note iOS — native migration plan

**Product decision (Beto, 2026-11-01):** In the Verse2Note **iOS app**, everything becomes native (Swift / SwiftUI / UIKit) **except** the note body / editor content (the *miolo*), which stays in a WKWebView. The public website is out of scope for compatibility — no requirement to keep the Capacitor “full site in a WebView” model. Native screens talk to the existing **verse2note.com** backend (Better Auth session + server data) directly.

**This document is the plan only.** It does not implement the migration.

**Baseline:** `main` after TF88 fixes (PR #34 / sha around `3535c2a`). Current app: Capacitor 8 shell loading `https://verse2note.com` with LiquidChrome, NativeMenus, NativeAuth, Share, Push.

---

## 1. Goals and non-goals

### Goals

- Native navigation, lists, sheets, alerts, settings, groups, profile, verses/reading chrome.
- Single note **document editor** (blocks, refs, speakers inline, typing) remains web (*miolo*).
- Same backend and user accounts; bearer (or equivalent) session usable from URLSession and from the embedded editor WebView.
- Offline-capable notebook (local-first notes/speakers) preserved or improved.
- Ship in **small TestFlight phases**, each usable.

### Non-goals (this program)

- Rewriting the public marketing site or forcing web parity with native UX.
- Rewriting the note block editor in Swift in phase 1–N (explicitly deferred; *miolo* stays web).
- Android (separate track later).
- Keeping Capacitor as the long-term UI host once native screens replace it.

### End state (sketch)

```text
┌─────────────────────────────────────────────┐
│  Native UIKit / SwiftUI shell               │
│  Tab bar · nav · lists · sheets · settings  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Note screen (native chrome)           │  │
│  │  title / date / tags / speakers / …   │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │ WKWebView — note miolo only     │  │  │
│  │  │ (blocks editor, same origin API)│  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
│         │ URLSession + Bearer / cookies     │
│         ▼                                   │
│  https://verse2note.com  (Better Auth + API)│
└─────────────────────────────────────────────┘
```

---

## 2. Inventory — current screens, modals, flows

Legend: **Primary** = main tab shell; **Secondary** = pushed / detail; **System** = auth handoff / platform; **Web-only today** = marketing/legal (low priority for native).

### 2.1 App shell (already partly native)

| Piece | Today | Notes |
| --- | --- | --- |
| Tabs | LiquidChrome `UITabBar` via `APP_TABS` | verses `/app`, groups `/groups`, notebook `/notebook`, reading `/reading`, profile `/profile` (`src/lib/tabs.ts`) |
| Top bar | LiquidChrome `UINavigationBar` | title, back, search, trailing `…` / badge |
| FAB | LiquidChrome FAB + optional `UIMenu` | compose, new group |
| Menus / alerts | `NativeMenus` plugin | `menu` / `sheet` / `alert` / `prompt` |
| Login browser | `NativeAuth` + ASWebAuthenticationSession | Google |
| Share | `@capacitor/share` | note swipe share |
| Push | `@capacitor/push-notifications` + APNs | `saveApnsDevice` / `dropApnsDevice` |
| Splash / status | Capacitor SplashScreen + StatusBar | LaunchScreen storyboard |

### 2.2 Auth / session

| Flow | Route / entry | UI today |
| --- | --- | --- |
| Login screen | `/login` | Google + email/password (web form) |
| Native Google start | `/auth/native-start` | redirect into OAuth |
| Native return / done | `/auth/native-return`, `/auth/native-done` | handoff seal → bearer in WebView `localStorage` |
| Native config | `/auth/native-config` | `{ universalLinks: false }` JSON |
| Gate / onboarding | `app-shell` overlays | `Onboarding`, `CompleteProfile`, `Coachmarks` |

### 2.3 Notebook

| Flow | Route / UI | Class |
| --- | --- | --- |
| Note list | `/notebook/` · `NotebookHome` | Primary |
| Note editor (full page) | `/notebook/$id` · `NotebookEditor` | Secondary (tab bar hidden) |
| Shared / granted note | `/n/$id` | Secondary / deep link |
| Import | `/notebook/import` | Secondary |
| Compose | FAB UIMenu or ActionSheet: Nova nota / Importar | Modal |
| Swipe share / delete | `NoteCard` + confirm ActionSheet | Gesture + alert |
| Note settings | `…` → Settings → ViewportSheet (date, tags, note speaker) | Sheet (web after TF88) |
| Speakers manage / pick | `NotebookSpeakerSheet` | Sheet |
| First-speaker scope | ActionSheet whole-note vs section | Alert/sheet |
| Publish to group | editor / group flows | Sheet / actions |
| Send to friend | `SendToFriendButton` | Sheet |
| Offline banner | `OfflineBanner` | Chrome |

### 2.4 Groups

| Flow | Route / UI | Class |
| --- | --- | --- |
| Groups home | `/groups/` · `NotebookGroupsHome` | Primary |
| Group detail | `/groups/$id` · `NotebookGroupDetail` | Primary |
| Novo grupo | FAB / button → ViewportSheet (name + private/listed) | Sheet |
| Join / members / roles / delete | group detail | Sheets + ActionSheet |
| Group notes list | inside detail | List |

### 2.5 Verses / collections

| Flow | Route | Class |
| --- | --- | --- |
| Verse picker + preview | `/app` | Primary |
| Collections index / themes / category / detail | `/collections/*` | Primary |
| User / shared collection | `/c/$id` | Primary |
| Save to collection | `SaveToCollectionButton` | Sheet |
| Open in Bible app | link / `NativeAuth.open` | External |

### 2.6 Reading plans

| Flow | Route | Class |
| --- | --- | --- |
| Reading home | `/reading/` | Primary |
| Plan lists / detail | `/reading/all`, `/reading/category/$id`, `/reading/$id` | Primary |
| Join plan group | `/g/$id` | Secondary / invite |
| Day marks | in plan detail | Local + outbox |

### 2.7 Profile / settings

| Flow | Route | Class |
| --- | --- | --- |
| Profile home | `/profile/` | Primary |
| Edit / friends / badges / bible / language / theme / notifications / help | `/profile/*` | Primary |
| Delete account | ActionSheet on profile | Alert |
| Public profile | `/u/$handle` | Secondary (optional native later) |
| Inbox | `/inbox` → redirect `/app` | NotifyBell sheet instead |

### 2.8 Notifications

| Flow | UI | Class |
| --- | --- | --- |
| In-app notify list | `NotifyBell` ViewportSheet | Overlay |
| Notify settings / prompt | `NotifySettings`, `NotifyPrompt` | Settings |
| APNs register / tap | `src/lib/native/push.ts` | System |

### 2.9 Low priority / web-only for native app

| Flow | Route | Note |
| --- | --- | --- |
| Marketing landing | `/` | Native cold start → login or last tab |
| Privacy / about / for-ai | `/privacy`, `/about`, `/for-ai` | Optional Safari or later Settings links |
| Admin | `/admin` | Keep web or omit from App Store binary |

---

## 3. Backend surface — what native must call

### 3.1 Reality check

Almost all app data I/O today is **TanStack Start `createServerFn` RPC** (cookie and/or `Authorization: Bearer`), not a documented public REST JSON API. Capacitor works because the WebView shares origin with those RPCs.

**Native URLSession cannot call `createServerFn` as-is** without reverse-engineering the Start RPC protocol. Therefore the migration **requires a first-class HTTP JSON API** (or an official RPC bridge) on verse2note.com that wraps the same handlers / SQL.

Public HTTP routes that already exist under `src/routes/api`:

| Path | Role |
| --- | --- |
| `/api/auth/*` | Better Auth (session, OAuth callbacks, bearer plugin) |
| `/api/link` | Bible link helper (public) |
| `/api/collections` | Catalog collections (public) |
| `/api/plans` | Catalog plans (public) |
| `/api/mcp` | MCP JSON-RPC for AI tools (public) |

Auth handoff (non-`/api`): `/auth/native-start|done|return|config`.

### 3.2 Domains to expose for native (from existing `createServerFn`s)

Proposed mount: **`/api/native/v1/...`** (name TBD), all JSON, all authenticated unless marked public. Reuse `authMiddleware` / `getSessionUser` (cookie **or** Bearer).

| Domain | Existing server fns (representative) | Native needs |
| --- | --- | --- |
| **Session** | Better Auth `/api/auth/get-session`, sign-in, sign-out | GET session, email sign-in, sign-out; keep native Google handoff |
| **Notes** | `listMyNotes`, `upsertMyNote`, `deleteMyNote`, `getSharedNote`, `getGrantedNote`, `listGrantedNotes`, `sendNoteToFriend` | Full CRUD + share/grant |
| **Speakers** | `listMySpeakers`, `upsertMySpeaker`, `deleteMySpeaker` | Full CRUD |
| **Groups** | `listMyGroups`, `searchListedGroups`, `getNotebookGroup`, `create/update/join/decide/role/leave/delete`, `listGroupMembers`, `listGroupNotes`, `listMyNoteGroups`, `publishNoteToGroup`, `unpublishNoteFromGroup` | Full surface |
| **Friends / links** | `searchPeople`, `listLinks`, `getLinkStatus`, `request/accept/declineLink`, `sendPlanToFriend`, `sendCollectionToFriend` | Full surface |
| **User collections** | list/get/create/update/remix/delete/granted + `getSharedCollection` | Full surface |
| **Plan groups / marks** | invite/join/get/list + mark/reset + preview | Full surface |
| **Prefs / profile** | `getPrefs`, `savePrefs`, `syncAccountPhoto` | GET/PATCH prefs; avatar |
| **Account** | `exportMyData`, `deleteMyAccount`, `addEmailPassword` | Settings |
| **Notify (web push)** | VAPID, prefs, subscriptions, list, unread, markRead | Optional on iOS (APNs is primary) |
| **APNs** | `saveApnsDevice`, `dropApnsDevice` | Keep |
| **Badges** | `getMyBadges`, `getPublicProfile` | Profile |
| **Handoff** | `mintNativeHandoff`, `claimNativeHandoff`, `abortNativeReturn` | Keep for Google login |
| **Catalog (public)** | `/api/link`, `/api/collections`, `/api/plans` | Reuse as-is for verses/reading chrome |

### 3.3 Missing endpoints / work to add

| Gap | Why | Suggested work |
| --- | --- | --- |
| **Native JSON API layer** | Swift cannot use Start RPC | Add `/api/native/v1/*` (or OpenAPI) wrapping existing handlers; shared zod schemas |
| **Batch sync / delta** | Native offline store needs efficient pull | `GET /notes?since=` / `GET /speakers?since=` (or single `/sync`) — **new** |
| **Note snapshot for editor bootstrap** | Miolo WebView needs one note + speakers without full SPA | `GET /notes/:id` returning note JSON (+ speakers) — thin wrapper |
| **Editor session bootstrap** | Inject auth into miolo WebView | `POST /auth/native-editor-token` short-lived token **or** cookie set on dedicated editor origin path — **new** |
| **Device-aware notify** | In-app notify list without web push | Ensure notify list APIs work with Bearer (already authMiddleware) |
| **Multipart / photo** | Profile photo sync | Confirm `syncAccountPhoto` shape; may need upload URL |
| **Rate limits / pagination** | Mobile chatty clients | Explicit page cursors on list endpoints where today `limit 200` |

No need to expose `/api/mcp` or admin stats to the App Store client.

---

## 4. Auth and session — native ↔ note WebView

### 4.1 Today

- Better Auth at `/api/auth/*` with **bearer plugin** + HttpOnly `__Host-grok-auth.*` cookies.
- **Native Google:** ASWebAuthenticationSession → handoff → `claimNativeHandoff` → bearer in WebView `localStorage` (`grok-auth.bearer-token`).
- **Email/password:** sets `__Host-` cookie inside WKWebView; may also copy bearer.
- Capacitor remote URL keeps cookies on `https://verse2note.com`.

### 4.2 Target

| Store | Owner | Use |
| --- | --- | --- |
| **Keychain** | Native app | Long-lived refresh/session bearer (or session token) |
| **URLSession** | Native screens | `Authorization: Bearer …` on `/api/native/v1/*` and `/api/auth/*` |
| **Note miolo WKWebView** | Embedded only on note screen | Must authenticate to same API for autosave / outbox flush |

### 4.3 Bridging auth into the miolo WebView

Recommended approach (phased):

1. **Editor bundle** hosted at e.g. `https://verse2note.com/native-editor/` (minimal HTML/JS: block editor only — extract from `notebook-doc` / `notebook-line`, not full app shell).
2. On open note, native:
   - Loads that URL (or `about:blank` + injected bundle later).
   - Calls `POST /api/native/v1/editor/session` with the Keychain bearer → server sets a short-lived HttpOnly cookie **or** returns a one-time code.
   - Native injects via `WKUserScript`: `window.__V2N_EDITOR__ = { noteId, bearerOrCode, locale, bridge: true }`.
3. Editor JS uses Bearer (from injected token) for `upsertMyNote`-equivalent API; never relies on full SPA router.
4. On logout, native clears Keychain, wipes WebView data store for editor, calls sign-out API.

**Do not** keep the full Capacitor site WebView as the session source of truth once native lists exist.

Google login can keep ASWebAuthenticationSession + handoff; email/password should move to native form posting to Better Auth HTTP APIs, storing bearer in Keychain.

---

## 5. Offline strategy

### 5.1 Today (web)

- Zustand persist (`cita-settings`): notes (≤200), speakers (≤80), prefs, collections, plan marks, etc.
- Outbox (`verse2note-outbox`): `note.*`, `speaker.*`, `collection.*`, `plan.*`, `prefs` → flush via server fns when online.
- Service worker caches app shell; **never** `/api/*`.
- Groups / friends / notify are mostly online-only (+ `groups-cache`).

### 5.2 Target (native)

| Data | Store | Sync |
| --- | --- | --- |
| Notes + speakers | On-device DB (SwiftData or SQLite) | Outbox mirror of today’s jobs; pull via `/sync` or list+since |
| Prefs / theme / locale | UserDefaults or DB | PATCH prefs |
| Own collections + plan marks | DB + outbox | Same job types |
| Groups / members / friends | Network-first cache | Optional disk cache; stale-while-revalidate |
| Catalog (books, plans, collections) | Bundle or CDN cache | Public `/api/collections`, `/api/plans` |
| Editor miolo | May keep a small JS local draft buffer | Must call native bridge `noteDidChange` so native owns durable save |

**Rule:** Native owns durable note records. The WebView is a **projection + editor** of `blocks` (and maybe title live-edit), not the source of truth for the note list.

Cold start offline: native shell + local DB works without Capacitor `offline.html`. Editor WebView needs a **bundled** editor assets fallback (ship editor www in the app binary) so opening a note offline still types.

---

## 6. Note miolo WebView — embed and communication

### 6.1 What stays web

- Block document: paragraphs, headings, lists, inline bible refs, speaker sections, caret/selection, import paste quirks (`notebook-doc`, `notebook-line`, `notebook-html`, import helpers).
- Anything that is “contentEditable / complex caret” risk in Swift.

### 6.2 What becomes native on the note screen

- Nav bar (back, title display policy, `…` menu).
- Note settings (date, tags, whole-note speaker).
- Speaker pick / manage sheets.
- Share, send to friend, publish to group.
- Delete note, offline indicator, keyboard chrome insets (Liquid Glass / safe area).

### 6.3 Bridge protocol (draft)

Bidirectional `WKScriptMessageHandler` + `window.webkit.messageHandlers.v2n`:

| Direction | Message | Purpose |
| --- | --- | --- |
| N→W | `loadNote { note, speakers, readOnly }` | Initial document |
| N→W | `setSpeakers` / `setReadOnly` / `focus` | Updates from native sheets |
| W→N | `noteChanged { note }` (debounced) | Native writes DB + outbox |
| W→N | `openRef { bookId, chapter, … }` | Native opens Bible / preview |
| W→N | `requestSpeaker { blockId? }` | Native presents speaker sheet |
| W→N | `height` / `scroll` / `focus` | Layout / keyboard |
| W→N | `ready` / `error` | Lifecycle |

Editor URL must not show site chrome, tab bar, or marketing. Strip to a dedicated editor entry (new route or static package under `native/editor`).

---

## 7. Phased PR order (each shippable to TestFlight)

Principles: **small**, **user-visible or foundational**, **reversible feature flags** where possible (`NativeShellMode`: `capacitorSite` → `hybrid` → `nativePrimary`). Website deploy can add APIs without removing the old SPA.

### Phase 0 — Foundation (API + auth + flag) — **first shippable scope**

**Goal:** Native binary can authenticate and call a real JSON API; editor extraction spike can load one note. App UI can still be Capacitor site behind a flag.

**Scope (this is the first implementation PR series; start here):**

1. **API:** Introduce `/api/native/v1` with at least:
   - `GET /session`
   - `GET/POST /notes`, `GET/PATCH/DELETE /notes/:id`
   - `GET/POST /speakers`, `DELETE /speakers/:id`
   - `POST /devices/apns` (wrap existing)
   - OpenAPI or typed client stub for Swift
2. **Auth:** Document + implement Keychain bearer storage helper in iOS; claim-handoff → Keychain; URLSession interceptor.
3. **Editor package:** Minimal `/native-editor` (or bundled www) that renders one note JSON and posts `noteChanged` (can still be opened inside Capacitor for the spike).
4. **Feature flag** in app: keep current Capacitor UI default ON for TestFlight until Phase 1 UI is ready.
5. **Docs/tests:** Contract tests for the new endpoints (auth required, bearer accepted).

**Out of scope for Phase 0:** Replacing tab UI, deleting Capacitor browsing of the full site.

**Exit criteria:** TestFlight build can sign in (existing Google path OK), `GET /api/native/v1/notes` returns data with Keychain bearer; spike editor loads a note by id.

---

### Phase 1 — Native notebook list + open note (hybrid)

- Native `UITabBar` / notebook list (local DB seeded from API).
- Swipe actions, compose, delete confirms (UIKit).
- Tapping a row pushes native note chrome + **miolo WKWebView**.
- Other tabs can still briefly host WKWebView of the site **or** show “coming soon” — prefer keeping Capacitor only for non-notebook tabs behind the same shell to limit scope.
- Offline: read/edit local notes; outbox flush.

### Phase 2 — Native groups

- Groups home + detail + create/join/members native.
- Publish/unpublish note to group from native note chrome.
- APIs: full groups section of §3.2.

### Phase 3 — Native profile, settings, friends, APNs UI

- Profile, edit, language, theme, bible app prefs, notify settings.
- Friends search/request/accept.
- Delete account / export via API.
- Push permission + device registration (already partially native).

### Phase 4 — Native verses + reading

- Verse picker, collection browser, reading plans, day marks.
- Reuse public `/api/collections` + `/api/plans` + native marks API.
- Bible app open via `UIApplication.open`.

### Phase 5 — Remove Capacitor site host

- App no longer sets `server.url` to the full SPA as the root UI.
- Capacitor optional only for plugins **or** replace Share/Push/Splash with pure native and drop Capacitor dependency.
- Delete LiquidChrome-as-WebView-chrome path; keep design language in SwiftUI/UIKit.
- Miolo remains the only WKWebView.

### Phase 6 — Hardening

- Sync conflicts, migration from WebView localStorage/outbox → native DB (one-time import).
- Performance, accessibility, TestFlight rollout, App Store metadata.
- Optional: share extensions / widgets (later).

---

## 8. First phase — explicit checklist

**Phase 0 PR(s) should include:**

| Item | Done when |
| --- | --- |
| Design doc linked from repo (`docs/ios-native-migration.md`) | This file |
| `/api/native/v1` router + auth (Bearer) | Notes + speakers + session smoke |
| Swift `APIClient` + Keychain token | Unit / integration smoke on device |
| Editor entry spike (`/native-editor` or bundled) | Loads note, posts change message |
| TF build with flag default = old Capacitor UI | No regression for current users |
| List of follow-up Phase 1 tickets | Notebook list native |

**Do not** in Phase 0: rewrite all tabs, remove website, rewrite editor in Swift.

---

## 9. Risks

| Risk | Mitigation |
| --- | --- |
| Start RPC lock-in | Phase 0 API layer mandatory before UI rewrite |
| Dual write (WebView localStorage vs native DB) | Single writer: native owns notes; one-time import |
| Auth cookie vs bearer confusion | Bearer Keychain primary for native; editor gets explicit inject |
| Scope creep (“native everything”) | Phases 1–4 ordered by notebook → groups → profile → verses |
| Editor bundle drift from web editor | Share one package (`packages/note-editor` or path alias) built for web+native |
| App Review / login | Keep ASWebAuthenticationSession for Google |

---

## 10. References (code)

- Tabs: `src/lib/tabs.ts`
- Capacitor host: `capacitor.config.ts`, `ios/App/App/NativeShell.swift`
- Chrome: `ios/App/App/LiquidChrome.swift`, `src/components/native-chrome.tsx`
- Menus: `ios/App/App/NativeMenus.swift`, `src/lib/native/menus.ts`
- Notes model / cloud: `src/lib/notebook.ts`, `src/lib/notebook-cloud.ts`, `src/lib/notebook-local.ts`, `src/lib/outbox.ts`
- Groups: `src/lib/notebook-groups.ts`
- Auth: `src/lib/auth/server.ts`, `src/lib/auth/client.ts`, `src/lib/auth/bearer-store.ts`, `src/lib/native/handoff.ts`
- Push: `src/lib/native/push.ts`, `src/lib/native/devices.ts`

---

## 11. Decision log

| Date | Decision |
| --- | --- |
| 2026-11-01 | Everything native except note miolo; website compatibility not required; plan-first PR (this doc). |
| 2026-11-01 | First implementation phase = API + auth Keychain + editor spike (Phase 0), not a big-bang UI rewrite. |
