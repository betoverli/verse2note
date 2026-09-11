import type { Passage } from "@/lib/bible/passage";

export type CollectionVisibility = "private" | "unlisted" | "public";

export type CollectionPassage = Passage & {
  title?: string;
};

export type UserCollection = {
  id: string;
  title: string;
  slug: string;
  visibility: CollectionVisibility;
  sourceId: string;
  passages: CollectionPassage[];
  updatedAt: string;
};
