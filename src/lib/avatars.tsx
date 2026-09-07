import {
  BookOpen,
  Church,
  Droplet,
  Fish,
  Flame,
  Flower2,
  Leaf,
  Moon,
  Mountain,
  Star,
  Sun,
  Wheat,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const PHOTO_AVATAR = "photo";

export const AVATARS = [
  { id: "book", Icon: BookOpen },
  { id: "cross", Icon: Church },
  { id: "flame", Icon: Flame },
  { id: "sun", Icon: Sun },
  { id: "moon", Icon: Moon },
  { id: "leaf", Icon: Leaf },
  { id: "fish", Icon: Fish },
  { id: "star", Icon: Star },
  { id: "drop", Icon: Droplet },
  { id: "mountain", Icon: Mountain },
  { id: "flower", Icon: Flower2 },
  { id: "grain", Icon: Wheat },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"] | typeof PHOTO_AVATAR;

export function isAvatarId(value: string): value is AvatarId {
  return value === PHOTO_AVATAR || AVATARS.some((item) => item.id === value);
}

export function AvatarMark({
  id,
  className,
  iconClassName,
}: {
  id?: string;
  className?: string;
  iconClassName?: string;
}) {
  const item = AVATARS.find((entry) => entry.id === id) ?? AVATARS[0];
  const Icon = item.Icon;
  return (
    <span className={cn("grid place-items-center rounded-full bg-elevated text-fg", className)}>
      <Icon className={cn("size-4", iconClassName)} />
    </span>
  );
}

export function ProfileAvatar({
  id,
  url,
  className,
  iconClassName,
}: {
  id?: string;
  url?: string;
  className?: string;
  iconClassName?: string;
}) {
  if (id === PHOTO_AVATAR && url) {
    return <img src={url} alt="" referrerPolicy="no-referrer" className={cn("rounded-full object-cover", className)} />;
  }
  return <AvatarMark id={id} className={className} iconClassName={iconClassName} />;
}
