import type { Passage } from "@/lib/bible/passage";

export type CollectionVisibility = "private" | "unlisted" | "public";

export type UserCollection = {
  id: string;
  title: string;
  slug: string;
  visibility: CollectionVisibility;
  passages: Passage[];
  updatedAt: string;
};
