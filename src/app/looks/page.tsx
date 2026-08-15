import Link from "next/link";
import { TabBar } from "@/components/shell/TabBar";
import { StoryBar } from "@/components/looks/StoryBar";
import { PostCard } from "@/components/looks/PostCard";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { getFeed, getStories } from "@/lib/feed";
import { l } from "@/lib/i18n";

export default async function LooksPage() {
  const [lang, user] = await Promise.all([getLanguage(), getCurrentUser()]);
  const [posts, stories] = await Promise.all([
    getFeed(lang, user?.id ?? null),
    getStories(lang, user?.id ?? null),
  ]);

  const composer = (
    <div className="glass-card p-3 flex gap-3 items-center">
      <span className="flex-1">
        <span className="block font-bold text-sm">
          {l(lang, "Share a look", "Bagikan tampilan")}
        </span>
        <span className="block text-[11.5px] text-muted-3 mt-1 leading-snug">
          {l(
            lang,
            "Upload a photo, tag the package, post it to the feed.",
            "Unggah foto, tandai paket, bagikan ke feed."
          )}
        </span>
      </span>
      <Link
        href="/looks/compose"
        className="h-[38px] px-4 rounded-[13px] text-white text-[13px] font-bold flex items-center glass-fill"
      >
        {l(lang, "Post", "Unggah")}
      </Link>
    </div>
  );

  return (
    <>
      <MobileOnly>
      <div className="ambient-glow min-h-dvh flex flex-col pt-[58px] relative">
        <div className="px-5 pt-2 pb-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="font-extrabold text-[22px] tracking-tight">
              {l(lang, "Looks", "Looks")}
            </div>
            <div className="text-xs text-muted-3 mt-0.5">
              {l(
                lang,
                "Stories and posts from Shana and her clients",
                "Story dan unggahan dari Shana dan kliennya"
              )}
            </div>
          </div>
          <Link
            href={user?.role === "ARTIST" ? "/manage/chats" : "/chat"}
            className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px]"
          >
            ✉
          </Link>
        </div>

        <StoryBar lang={lang} stories={stories} canPost={Boolean(user)} />

        <div className="px-5 pb-4">{composer}</div>

        <div className="flex flex-col gap-4 px-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} lang={lang} next="/looks" />
          ))}
        </div>

        <div className="flex-1 min-h-6" />
        <TabBar lang={lang} />
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <div className="flex items-end justify-between gap-6 mb-7">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            {l(lang, "Looks", "Looks")}
          </h1>
          <p className="text-sm text-muted mt-2">
            {l(
              lang,
              "Stories and posts from Shana and her clients",
              "Story dan unggahan dari Shana dan kliennya"
            )}
          </p>
        </div>
        <Link
          href="/looks/compose"
          className="h-[46px] px-5 rounded-2xl text-white text-sm font-bold flex items-center glass-fill"
        >
          {l(lang, "Share a look", "Bagikan tampilan")}
        </Link>
      </div>

      <div className="-mx-5 mb-6">
        <StoryBar lang={lang} stories={stories} canPost={Boolean(user)} />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 items-start pb-24">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} lang={lang} next="/looks" />
        ))}
      </div>
    </div>
      </DesktopOnly>
    </>
  );
}
