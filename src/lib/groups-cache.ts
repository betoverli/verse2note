import type { NotebookGroup } from "@/lib/notebook-groups";

let userId: string | null = null;
let mine: NotebookGroup[] | null = null;

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
}

export function clearMyGroupsCache() {
  userId = null;
  mine = null;
}
