import {
  appendPassageToBlocks,
  asNote,
  asSpeaker,
  emptyNote,
  newNoteId,
  todayKey,
  type Note,
  type Speaker,
} from "@/lib/notebook";
import type { Passage } from "@/lib/bible/passage";
import { enqueue, flushOutbox } from "@/lib/outbox";
import { useAppStore } from "@/lib/store";

function touchNote(note: Note): Note {
  return { ...note, updatedAt: new Date().toISOString() };
}

function touchSpeaker(speaker: Speaker): Speaker {
  return { ...speaker, updatedAt: new Date().toISOString() };
}

export function mergeNotes(local: Note[], remote: Note[]) {
  const map = new Map<string, Note>();
  for (const item of remote) map.set(item.id, item);
  for (const item of local) {
    const other = map.get(item.id);
    if (!other || item.updatedAt >= other.updatedAt) map.set(item.id, item);
  }
  return [...map.values()].sort((a, b) => (a.happenedAt === b.happenedAt ? (a.updatedAt < b.updatedAt ? 1 : -1) : a.happenedAt < b.happenedAt ? 1 : -1));
}

export function mergeSpeakers(local: Speaker[], remote: Speaker[]) {
  const map = new Map<string, Speaker>();
  for (const item of remote) map.set(item.id, item);
  for (const item of local) {
    const other = map.get(item.id);
    if (!other || item.updatedAt >= other.updatedAt) map.set(item.id, item);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function upsertLocalNote(next: Note) {
  const item = touchNote(next);
  const list = useAppStore.getState().notes;
  const index = list.findIndex((row) => row.id === item.id);
  const rows = index >= 0 ? list.map((row, i) => (i === index ? item : row)) : [item, ...list];
  useAppStore.getState().setNotes(rows);
  enqueue({ type: "note.upsert", note: item });
  void flushOutbox();
  return item;
}

export function createLocalNote(partial?: Partial<Note>) {
  return upsertLocalNote({ ...emptyNote(), ...partial, id: partial?.id || newNoteId() });
}

export function deleteLocalNote(id: string) {
  const rows = useAppStore.getState().notes.filter((item) => item.id !== id);
  useAppStore.getState().setNotes(rows);
  enqueue({ type: "note.delete", noteId: id });
  void flushOutbox();
}

export function upsertLocalSpeaker(next: Speaker) {
  const item = touchSpeaker(next);
  const list = useAppStore.getState().speakers;
  const index = list.findIndex((row) => row.id === item.id);
  const rows = index >= 0 ? list.map((row, i) => (i === index ? item : row)) : [...list, item];
  useAppStore.getState().setSpeakers(rows);
  enqueue({ type: "speaker.upsert", speaker: item });
  void flushOutbox();
  return item;
}

export function ensureTodayNote() {
  const key = todayKey();
  const existing = useAppStore.getState().notes.find((item) => item.happenedAt === key);
  if (existing) return existing;
  return createLocalNote({ happenedAt: key });
}

export function appendToToday(passage: Passage) {
  const note = ensureTodayNote();
  const speakerId = useAppStore.getState().notebookActiveSpeakerId;
  return upsertLocalNote({
    ...note,
    blocks: appendPassageToBlocks(note.blocks, passage, speakerId),
  });
}

export function remixNote(note: Note, speakers: Speaker[]) {
  const map = new Map<string, string>();
  for (const block of note.blocks) {
    if (block.type !== "speaker") continue;
    if (map.has(block.speakerId)) continue;
    const source = speakers.find((item) => item.id === block.speakerId);
    const created = upsertLocalSpeaker({
      id: newNoteId(),
      name: source?.name || "Speaker",
      color: source?.color || "#c4a574",
      updatedAt: new Date().toISOString(),
    });
    map.set(block.speakerId, created.id);
  }
  const copy = asNote({
    ...note,
    id: newNoteId(),
    visibility: "private",
    updatedAt: new Date().toISOString(),
    blocks: note.blocks.map((block) => {
      if (block.type !== "speaker") return { ...block, id: newNoteId() };
      return {
        ...block,
        id: newNoteId(),
        speakerId: map.get(block.speakerId) || block.speakerId,
        children: block.children.map((child) => ({ ...child, id: newNoteId() })),
      };
    }),
  });
  return copy ? upsertLocalNote(copy) : null;
}

export function sanitizeNotes(input: unknown): Note[] {
  if (!Array.isArray(input)) return [];
  return input.map(asNote).filter((item): item is Note => Boolean(item)).slice(0, 200);
}

export function sanitizeSpeakers(input: unknown): Speaker[] {
  if (!Array.isArray(input)) return [];
  return input.map(asSpeaker).filter((item): item is Speaker => Boolean(item)).slice(0, 80);
}
