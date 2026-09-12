import { savePrefs, type CloudPrefs } from "@/lib/cloud";
import { markPlanDay, resetPlanMarks } from "@/lib/plan-marks";
import type { UserCollection } from "@/lib/user-collection";
import { createMyCollection, deleteMyCollection, updateMyCollection } from "@/lib/user-collections";
import { useAppStore } from "@/lib/store";

const KEY = "verse2note-outbox";

type JobBody =
  | { type: "prefs" }
  | { type: "collection.upsert"; collection: UserCollection }
  | { type: "collection.delete"; collectionId: string }
  | { type: "plan.mark"; planId: string; day: number; on: boolean }
  | { type: "plan.reset"; planId: string };

type Job = JobBody & { id: string };

function read(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Job[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(jobs: Job[]) {
  if (typeof window === "undefined") return;
  try {
    if (jobs.length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(jobs.slice(-80)));
  } catch {
    /* ignore */
  }
}

export function clearOutbox() {
  write([]);
}

export function enqueue(job: JobBody) {
  const id = crypto.randomUUID();
  const current = read();
  if (job.type === "prefs") {
    if (current.some((item) => item.type === "prefs")) return;
    write([...current, { id, type: "prefs" }]);
    return;
  }
  if (job.type === "collection.delete") {
    const rest = current.filter(
      (item) =>
        !(item.type === "collection.upsert" && item.collection.id === job.collectionId) &&
        !(item.type === "collection.delete" && item.collectionId === job.collectionId),
    );
    write([...rest, { id, type: "collection.delete", collectionId: job.collectionId }]);
    return;
  }
  if (job.type === "plan.reset") {
    const rest = current.filter(
      (item) =>
        !(item.type === "plan.reset" && item.planId === job.planId) &&
        !(item.type === "plan.mark" && item.planId === job.planId),
    );
    write([...rest, { id, type: "plan.reset", planId: job.planId }]);
    return;
  }
  if (job.type === "plan.mark") {
    const rest = current.filter(
      (item) => !(item.type === "plan.mark" && item.planId === job.planId && item.day === job.day),
    );
    write([...rest, { id, type: "plan.mark", planId: job.planId, day: job.day, on: job.on }]);
    return;
  }
  const rest = current.filter(
    (item) => !(item.type === "collection.upsert" && item.collection.id === job.collection.id),
  );
  write([...rest, { id, type: "collection.upsert", collection: job.collection }]);
}

function snapshot(): CloudPrefs {
  const s = useAppStore.getState();
  return {
    locale: s.locale,
    copyLocale: s.copyLocale,
    appId: s.appId,
    translationId: s.translationId,
    preferNative: s.preferNative,
    copyFormat: s.copyFormat,
    booksCompact: s.booksCompact,
    theme: s.theme,
    activePlans: s.activePlans,
    planProgress: s.planProgress,
    avatarId: s.avatarId,
    avatarUrl: s.avatarUrl,
    handle: s.handle,
    firstName: s.firstName,
    lastName: s.lastName,
    profileEmail: s.profileEmail,
  };
}

let flushing = false;

export async function flushOutbox() {
  if (flushing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const jobs = read();
  if (jobs.length === 0) return;
  flushing = true;
  const left: Job[] = [];
  try {
    for (const job of jobs) {
      try {
        if (job.type === "prefs") {
          const result = await savePrefs({ data: snapshot() });
          if (result && "error" in result) left.push(job);
          continue;
        }
        if (job.type === "collection.delete") {
          await deleteMyCollection({ data: { id: job.collectionId } });
          continue;
        }
        if (job.type === "plan.reset") {
          await resetPlanMarks({ data: { planId: job.planId } });
          continue;
        }
        if (job.type === "plan.mark") {
          await markPlanDay({ data: { planId: job.planId, day: job.day, on: job.on } });
          continue;
        }
        const item = job.collection;
        const updated = await updateMyCollection({
          data: {
            id: item.id,
            title: item.title,
            passages: item.passages,
            visibility: item.visibility,
          },
        });
        if (updated && "error" in updated && updated.error === "missing") {
          const created = await createMyCollection({
            data: {
              id: item.id,
              title: item.title,
              passages: item.passages,
              sourceId: item.sourceId,
            },
          });
          if (created && "ok" in created && !created.ok) left.push(job);
        }
      } catch {
        left.push(job);
      }
    }
    write(left);
  } finally {
    flushing = false;
  }
}

export function startOutbox() {
  if (typeof window === "undefined") return () => undefined;
  const onOnline = () => {
    void flushOutbox();
  };
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onOnline);
  void flushOutbox();
  return () => {
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onOnline);
  };
}
