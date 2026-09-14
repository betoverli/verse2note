import type { GroupNoteCard, NotebookGroup } from "@/lib/notebook-groups";

let userId: string | null = null;
let mine: NotebookGroup[] | null = null;
const notes = new Map<string, GroupNoteCard[]>();

export function peekMyGroups(forUser: string) {
  return userId === forUser ? mine : null;
}

export function setMyGroupsCache(forUser: string, rows: NotebookGroup[]) {
  userId = forUser;
  mine = rows;
}

export function upsertMyGroup(forUser: string, group: Partial<NotebookGroup> & { id: string }) {
  const list = peekMyGroups(forUser) ?? [];
  const current = list.find((item) => item.id === group.id);
  const next = { ...(current as NotebookGroup | undefined), ...group } as NotebookGroup;
  mine = [next, ...list.filter((item) => item.id !== group.id)];
  userId = forUser;
}

export function removeMyGroup(id: string) {
  if (!mine) return;
  mine = mine.filter((item) => item.id !== id);
  notes.delete(id);
}

export function peekGroupNotes(id: string) {
  return notes.get(id) ?? null;
}

export function setGroupNotesCache(id: string, rows: GroupNoteCard[]) {
  notes.set(id, rows);
}

export function clearMyGroupsCache() {
  userId = null;
  mine = null;
  notes.clear();
}
