import { prisma } from "./prisma";
import type { Lang } from "./i18n";
import { l } from "./i18n";
import type { FeedPost } from "@/components/looks/PostCard";

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
    who: post.user.role === "ARTIST" ? "shana.mua" : post.user.name,
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

export function buildStories(lang: Lang) {
  return [
    {
      id: "shana",
      name: "shana.mua",
      time: l(lang, "2h ago", "2 jam lalu"),
      caption: l(
        lang,
        "Base test under 4pm daylight — no flash, no filter.",
        "Uji base di cahaya jam 4 — tanpa flash, tanpa filter."
      ),
      imageUrl: null,
    },
    {
      id: "aruna",
      name: "aruna.p",
      time: l(lang, "5h ago", "5 jam lalu"),
      caption: l(
        lang,
        "Eleven hours in and the base has not moved.",
        "Sebelas jam dan base-nya belum bergerak."
      ),
      imageUrl: null,
    },
    {
      id: "studio",
      name: "kemang.studio",
      time: l(lang, "8h ago", "8 jam lalu"),
      caption: l(
        lang,
        "Chair one, 05:00 call. Kit laid out the night before.",
        "Kursi satu, panggilan 05:00. Kit disiapkan malam sebelumnya."
      ),
      imageUrl: null,
    },
    {
      id: "nadia",
      name: "nadia.r",
      time: l(lang, "yesterday", "kemarin"),
      caption: l(lang, "Sangjit morning, warm tones only.", "Pagi sangjit, hanya nada hangat."),
      imageUrl: null,
    },
    {
      id: "lens",
      name: "rifqi.lens",
      time: l(lang, "yesterday", "kemarin"),
      caption: l(
        lang,
        "Straight off the back of the camera.",
        "Langsung dari belakang kamera."
      ),
      imageUrl: null,
    },
  ];
}
