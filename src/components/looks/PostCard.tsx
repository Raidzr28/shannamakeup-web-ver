import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { toggleLikeAction, toggleSaveAction } from "@/lib/actions/posts";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { HeartIcon, StarIcon } from "@/components/ui/Icons";

export type FeedPost = {
  id: string;
  who: string;
  avatarUrl: string | null;
  badge: string;
  place: string;
  title: string;
  packageName: string | null;
  caption: string;
  imageUrl: string | null;
  lookId: string | null;
  likes: number;
  liked: boolean;
  saved: boolean;
  credit: boolean;
};

export function PostCard({
  post,
  lang,
  next,
}: {
  post: FeedPost;
  lang: Lang;
  next: string;
}) {
  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <span className="w-9 h-9 flex-none">
          <Media
            src={post.avatarUrl}
            alt={post.who}
            shape="circle"
            placeholder={post.who.slice(0, 1).toUpperCase()}
            className="w-9 h-9"
          />
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-[13.5px]">{post.who}</span>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-tint text-maroon">
              {post.badge}
            </span>
          </span>
          <span className="block text-[11px] text-muted-3 mt-0.5">{post.place}</span>
        </span>
      </div>

      <div className="relative h-[340px]">
        <Media
          src={post.imageUrl}
          alt={post.title}
          shape="rect"
          placeholder={post.packageName ?? post.title}
          className="h-full w-full"
          sizes="(max-width: 768px) 100vw, 560px"
        />
        {post.packageName && (
          <span className="absolute left-3 bottom-3 text-[11.5px] font-bold text-white px-3 py-1.5 rounded-full bg-[var(--paes-ink)]/60 border border-prada/25">
            {post.packageName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-1">
        <form action={toggleLikeAction}>
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="next" value={next} />
          <SubmitButton
            aria-pressed={post.liked}
            className={`w-[38px] h-[38px] rounded-xl cursor-pointer flex items-center justify-center border transition-colors ${
              post.liked
                ? "border-alarm text-alarm bg-alarm/12"
                : "border-prada/30 text-melati-3 hover:text-melati"
            }`}
          >
            <HeartIcon filled={post.liked} className="w-[19px] h-[19px]" />
          </SubmitButton>
        </form>
        <span className="text-[13px] tabular-nums text-melati-2">
          {post.likes.toLocaleString("de-DE")}
        </span>
        <span className="flex-1" />
        <form action={toggleSaveAction}>
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="next" value={next} />
          <SubmitButton
            aria-pressed={post.saved}
            className={`w-[38px] h-[38px] rounded-xl cursor-pointer flex items-center justify-center border transition-colors ${
              post.saved
                ? "border-prada text-prada bg-prada/12"
                : "border-prada/30 text-melati-3 hover:text-melati"
            }`}
          >
            <StarIcon filled={post.saved} className="w-[19px] h-[19px]" />
          </SubmitButton>
        </form>
      </div>

      <div className="px-3.5 pt-1.5 pb-3.5">
        {post.title && (
          <div className="font-bold text-[15px] mb-1.5">{post.title}</div>
        )}
        <p className="m-0 text-[13px] leading-relaxed text-[var(--paes-melati-2)]">
          {post.caption}
          {post.credit && (
            <span className="text-muted-3">
              {" "}
              — {l(lang, "makeup by", "rias oleh")} @shana.mua
            </span>
          )}
        </p>
        {post.lookId && (
          <Link
            href={`/book/${post.lookId}`}
            className="mt-3 w-full h-11 rounded-2xl text-[13.5px] font-bold flex items-center justify-center text-maroon glass-light"
          >
            {l(lang, "Book this look", "Pesan tampilan ini")}
          </Link>
        )}
      </div>
    </div>
  );
}
