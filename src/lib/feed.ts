import { prisma } from "./prisma";
import type { Lang } from "./i18n";
import { l } from "./i18n";
import type { FeedPost } from "@/components/looks/PostCard";
import type { Story } from "@/components/looks/StoryBar";

/** The public handle for a byline. Falls back to the display name only for rows
 * that predate the username column and somehow escaped the backfill. */
function handleFor(user: { username: string | null; name: string }) {
  return user.username ?? user.name;
}

export async function getFeed(
  lang: Lang,
  viewerId: string | null
): Promise<FeedPost[]> {
  const rows = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      look: true,
      likes: true,
      saves: viewerId ? { where: { userId: viewerId } } : false,
    },
  });

  return rows.map((post) => ({
    id: post.id,
    who: handleFor(post.user),
    avatarUrl: post.user.avatarUrl,
    badge:
      post.user.id === viewerId
        ? l(lang, "You", "Kamu")
        : post.user.role === "ARTIST"
          ? "Artist"
          : l(lang, "Client", "Klien"),
    place: post.place,
    title: post.title,
    packageName: post.look ? l(lang, post.look.title, post.look.titleId) : null,
    caption: post.description,
    imageUrl: post.imageUrl,
    lookId: post.lookId,
    likes: post.likes.length,
    liked: viewerId ? post.likes.some((x) => x.userId === viewerId) : false,
    saved: viewerId ? (post.saves as { id: string }[]).length > 0 : false,
    credit: post.credit,
  }));
}

function agoLabel(lang: Lang, createdAt: Date, now: number) {
  const minutes = Math.floor((now - createdAt.getTime()) / 60_000);
  if (minutes < 1) return l(lang, "just now", "baru saja");
  if (minutes < 60) return l(lang, `${minutes}m ago`, `${minutes} mnt lalu`);
  const hours = Math.floor(minutes / 60);
  return l(lang, `${hours}h ago`, `${hours} jam lalu`);
}

function leftLabel(lang: Lang, expiresAt: Date, now: number) {
  const minutes = Math.max(0, Math.ceil((expiresAt.getTime() - now) / 60_000));
  if (minutes < 60) return l(lang, `${minutes}m left`, `sisa ${minutes} mnt`);
  const hours = Math.floor(minutes / 60);
  return l(lang, `${hours}h left`, `sisa ${hours} jam`);
}

export async function getStories(
  lang: Lang,
  viewerId: string | null
): Promise<Story[]> {
  const now = Date.now();
  const rows = await prisma.story.findMany({
    where: { expiresAt: { gt: new Date(now) } },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      views: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
    },
  });

  const stories = rows.map((story) => ({
    id: story.id,
    name: handleFor(story.user),
    avatarUrl: story.user.avatarUrl,
    time: agoLabel(lang, story.createdAt, now),
    expiresIn: leftLabel(lang, story.expiresAt, now),
    caption: story.caption,
    imageUrl: story.imageUrl,
    mine: story.userId === viewerId,
    seen: viewerId ? (story.views as { id: string }[]).length > 0 : false,
  }));

  // Anything already watched shifts to the right, so the rail always opens on
  // something new. Each group stays newest-first within itself.
  return [
    ...stories.filter((story) => !story.seen),
    ...stories.filter((story) => story.seen),
  ];
}
