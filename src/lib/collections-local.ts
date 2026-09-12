import type { Passage } from "@/lib/bible/passage";
import { enqueue, flushOutbox } from "@/lib/outbox";
import type { CollectionPassage, UserCollection } from "@/lib/user-collection";
import { useAppStore } from "@/lib/store";

function newId() {
  return crypto.randomUUID().replaceAll("-", "");
}

function touch(collection: UserCollection): UserCollection {
  return { ...collection, updatedAt: new Date().toISOString() };
}

export function mergeCollections(local: UserCollection[], remote: UserCollection[]) {
  const map = new Map<string, UserCollection>();
  for (const item of remote) map.set(item.id, item);
  for (const item of local) {
    const other = map.get(item.id);
    if (!other || item.updatedAt >= other.updatedAt) map.set(item.id, item);
  }
  return [...map.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function upsertLocalCollection(next: UserCollection) {
  const item = touch(next);
  const list = useAppStore.getState().myCollections;
  const index = list.findIndex((row) => row.id === item.id);
  const rows = index >= 0 ? list.map((row, i) => (i === index ? item : row)) : [item, ...list];
  useAppStore.getState().setMyCollections(rows);
  enqueue({ type: "collection.upsert", collection: item });
  void flushOutbox();
  return item;
}

export function createLocalCollection(title: string, passages: Passage[] = [], sourceId = "") {
  return upsertLocalCollection({
    id: newId(),
    title: title.trim() || "Coleção",
    slug: "",
    visibility: "private",
    sourceId,
    passages: passages as CollectionPassage[],
    updatedAt: new Date().toISOString(),
  });
}

export function deleteLocalCollection(id: string) {
  const rows = useAppStore.getState().myCollections.filter((item) => item.id !== id);
  useAppStore.getState().setMyCollections(rows);
  enqueue({ type: "collection.delete", collectionId: id });
  void flushOutbox();
}
