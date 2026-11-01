import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/native/runtime";
import { getBearerToken } from "@/lib/auth/client";

export const Route = createFileRoute("/native-phase0")({
  head: () => ({
    meta: [{ title: "Native Phase 0" }],
  }),
  component: NativePhase0Debug,
});

type ShellMode = "capacitorSite" | "hybrid" | "editorSpike";

type Phase0Plugin = {
  getShellMode(): Promise<{ mode: ShellMode }>;
  setShellMode(options: { mode: ShellMode }): Promise<{ mode: ShellMode }>;
  syncBearer(options: { token: string | null }): Promise<{ ok: boolean }>;
  fetchNotes(): Promise<{ ok: boolean; count?: number; error?: string; status?: number }>;
  openEditorSpike(options: { noteId?: string; demo?: boolean }): Promise<{ ok: boolean }>;
};

async function plugin(): Promise<Phase0Plugin | null> {
  if (!isNativeApp()) return null;
  const { registerPlugin } = await import("@capacitor/core");
  return registerPlugin<Phase0Plugin>("NativePhase0");
}

/**
 * TestFlight debug page for Phase 0 (does not change the default shell).
 * Open `/native-phase0` inside the iOS app after signing in.
 */
function NativePhase0Debug() {
  const [mode, setMode] = useState<ShellMode>("capacitorSite");
  const [log, setLog] = useState<string[]>([]);
  const native = isNativeApp();

  function push(line: string) {
    setLog((prev) => [line, ...prev].slice(0, 40));
  }

  useEffect(() => {
    void (async () => {
      const p = await plugin();
      if (!p) return;
      try {
        const info = await p.getShellMode();
        setMode(info.mode);
        push(`mode=${info.mode}`);
        const token = getBearerToken();
        if (token) {
          await p.syncBearer({ token });
          push("bearer synced to Keychain");
        }
      } catch (error) {
        push(`init error: ${String(error)}`);
      }
    })();
  }, []);

  async function setShell(next: ShellMode) {
    const p = await plugin();
    if (!p) {
      push("not in Capacitor");
      return;
    }
    const info = await p.setShellMode({ mode: next });
    setMode(info.mode);
    push(`set mode=${info.mode}`);
  }

  async function sync() {
    const p = await plugin();
    if (!p) return;
    const token = getBearerToken();
    await p.syncBearer({ token });
    push(token ? "bearer synced" : "bearer cleared");
  }

  async function fetchNotes() {
    const p = await plugin();
    if (!p) {
      // Browser fallback against same-origin API
      const headers: HeadersInit = {};
      const token = getBearerToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/native/v1/notes", { headers });
      const data = (await res.json()) as { notes?: unknown[]; error?: string };
      push(`GET /notes → ${res.status} count=${data.notes?.length ?? "?"} ${data.error ?? ""}`);
      return;
    }
    const result = await p.fetchNotes();
    push(
      result.ok
        ? `Keychain GET /notes ok count=${result.count}`
        : `Keychain GET /notes fail ${result.status ?? ""} ${result.error ?? ""}`,
    );
  }

  async function openSpike(demo: boolean) {
    const p = await plugin();
    if (!p) {
      window.location.assign(demo ? "/native-editor?demo=1" : "/native-editor");
      return;
    }
    await p.openEditorSpike({ demo });
    push(demo ? "opened editor spike (demo)" : "opened editor spike");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8 text-fg">
      <h1 className="text-xl font-semibold">Native Phase 0</h1>
      <p className="text-sm text-muted">
        Default shell stays <code>capacitorSite</code> (current UI). Use these controls only to verify the
        API, Keychain bearer, and editor spike on TestFlight.
      </p>
      <p className="text-sm">
        Runtime: {native ? "Capacitor iOS" : "browser"} · mode: <strong>{mode}</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-md bg-fill px-3 py-2 text-sm" onClick={() => void setShell("capacitorSite")}>
          mode: capacitorSite
        </button>
        <button type="button" className="rounded-md bg-fill px-3 py-2 text-sm" onClick={() => void setShell("hybrid")}>
          mode: hybrid
        </button>
        <button type="button" className="rounded-md bg-fill px-3 py-2 text-sm" onClick={() => void setShell("editorSpike")}>
          mode: editorSpike
        </button>
        <button type="button" className="rounded-md bg-accent px-3 py-2 text-sm text-accent-fg" onClick={() => void sync()}>
          Sync bearer → Keychain
        </button>
        <button type="button" className="rounded-md bg-accent px-3 py-2 text-sm text-accent-fg" onClick={() => void fetchNotes()}>
          GET /api/native/v1/notes
        </button>
        <button type="button" className="rounded-md bg-accent px-3 py-2 text-sm text-accent-fg" onClick={() => void openSpike(true)}>
          Open editor spike
        </button>
      </div>
      <ul className="mt-4 space-y-1 font-mono text-xs text-muted">
        {log.map((line, index) => (
          <li key={`${index}-${line}`}>{line}</li>
        ))}
      </ul>
    </main>
  );
}
