"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Media } from "@/components/ui/Media";
import {
  deleteStoryAction,
  markStoryViewedAction,
  updateStoryCaptionAction,
} from "@/lib/actions/stories";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

export type Story = {
  id: string;
  name: string;
  avatarUrl: string | null;
  time: string;
  expiresIn: string;
  caption: string;
  imageUrl: string | null;
  mine: boolean;
  /** Watched on an earlier visit — the server has already sorted these right. */
  seen: boolean;
};

export function StoryBar({
  lang,
  stories,
  canPost,
}: {
  lang: Lang;
  stories: Story[];
  canPost: boolean;
}) {
  const [open, setOpen] = useState<number>(-1);
  // Stories watched in this session. The rail deliberately does not re-sort
  // underneath the viewer, so these only grey the ring out until the next load.
  const [justSeen, setJustSeen] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const reported = useRef<Set<string>>(new Set());

  // A story can expire, or its owner can delete it, while the viewer sits open.
  // The server then re-renders with a shorter list, so range-check rather than
  // index past the end.
  const active = open >= 0 && open < stories.length ? stories[open] : null;
  const editing = draft !== null;

  const close = useCallback(() => {
    setOpen(-1);
    setDraft(null);
  }, []);

  const openStory = useCallback(
    (i: number) => {
      const story = stories[i];
      if (!story) return;
      setOpen(i);
      setLiked(false);
      setDraft(null);
      setJustSeen((s) => (s.includes(story.id) ? s : [...s, story.id]));
      // Ref rather than state: this must fire exactly once per story per session
      // without the bookkeeping feeding back into a re-render.
      if (!story.seen && !reported.current.has(story.id)) {
        reported.current.add(story.id);
        startTransition(() => markStoryViewedAction(story.id));
      }
    },
    [stories]
  );

  // Auto-advance runs through openStory rather than nudging the index directly,
  // so a story watched to the end counts as seen exactly like a tapped one.
  useEffect(() => {
    if (!active || editing) return;
    const timer = setTimeout(() => {
      if (open + 1 >= stories.length) close();
      else openStory(open + 1);
    }, 4200);
    return () => clearTimeout(timer);
  }, [active, editing, open, stories.length, openStory, close]);

  function remove(id: string) {
    close();
    startTransition(() => deleteStoryAction(id));
  }

  function saveCaption(id: string, caption: string) {
    setDraft(null);
    startTransition(() => updateStoryCaptionAction(id, caption));
  }

  if (!canPost && stories.length === 0) return null;

  return (
    <>
      <div className="no-scrollbar flex gap-3.5 px-5 pt-1 pb-4 overflow-auto">
        {canPost && (
          <Link
            href="/looks/story"
            className="flex flex-col items-center gap-1.5 flex-none w-[70px] no-underline"
          >
            <span className="relative w-16 h-16 rounded-full flex items-center justify-center box-border border-[1.5px] border-dashed border-maroon/50 glass-light text-xl text-maroon">
              +
            </span>
            <span className="text-[10.5px] font-semibold text-[#4a3b32] max-w-[68px] overflow-hidden text-ellipsis whitespace-nowrap">
              {l(lang, "Your story", "Story kamu")}
            </span>
          </Link>
        )}

        {stories.map((story, i) => {
          const isSeen = story.seen || justSeen.includes(story.id);
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => openStory(i)}
              className="flex flex-col items-center gap-1.5 border-0 bg-transparent cursor-pointer flex-none w-[70px] p-0"
            >
              <span
                className={clsx(
                  "relative w-16 h-16 rounded-full flex items-center justify-center box-border p-[2.5px]",
                  isSeen
                    ? "bg-gradient-to-br from-[#d9c3a8] to-[#d9c3a8]/45"
                    : "bg-gradient-to-br from-gold to-maroon"
                )}
              >
                <span className="w-full h-full rounded-full overflow-hidden bg-[#ead9c7] border-2 border-[#f7f0e5] box-border">
                  <Media
                    src={story.imageUrl}
                    alt={story.name}
                    shape="circle"
                    placeholder={story.name.slice(0, 1).toUpperCase()}
                    className="w-full h-full"
                  />
                </span>
              </span>
              <span
                className={clsx(
                  "text-[10.5px] font-semibold max-w-[68px] overflow-hidden text-ellipsis whitespace-nowrap",
                  isSeen ? "text-[#9c8975]" : "text-[#4a3b32]"
                )}
              >
                {story.mine ? l(lang, "You", "Kamu") : story.name}
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex flex-col pt-[58px] bg-[#1a1a1a]/95 backdrop-blur-lg animate-[pop-in_0.28s_ease]">
          <div className="flex gap-1.5 px-3.5">
            {stories.map((s, i) => (
              <span
                key={s.id}
                className="flex-1 h-[3px] rounded-full bg-white/28 overflow-hidden"
              >
                <span
                  className="block h-full rounded-full bg-white origin-left"
                  style={
                    i < open
                      ? { transform: "scaleX(1)" }
                      : i === open && !editing
                        ? { animation: "story-fill 4.2s linear forwards" }
                        : i === open
                          ? { transform: "scaleX(1)" }
                          : { transform: "scaleX(0)" }
                  }
                />
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2.5 p-3.5">
            <span className="w-9 h-9 flex-none">
              <Media
                src={active.avatarUrl ?? active.imageUrl}
                alt={active.name}
                shape="circle"
                placeholder={active.name.slice(0, 1).toUpperCase()}
                className="w-9 h-9"
              />
            </span>
            <span className="flex-1 text-white">
              <span className="block font-bold text-[13.5px]">{active.name}</span>
              <span className="block text-[11px] opacity-70 mt-0.5">
                {active.time}
                {active.mine && ` · ${active.expiresIn}`}
              </span>
            </span>
            {active.mine && (
              <>
                <button
                  type="button"
                  onClick={() => setDraft(editing ? null : active.caption)}
                  className="w-[34px] h-[34px] rounded-xl text-white text-sm cursor-pointer bg-white/16 border border-white/28 backdrop-blur-md"
                  aria-label={l(lang, "Edit caption", "Ubah keterangan")}
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => remove(active.id)}
                  className="w-[34px] h-[34px] rounded-xl text-white text-sm cursor-pointer bg-[#c2415c]/70 border border-white/28 backdrop-blur-md"
                  aria-label={l(lang, "Delete story", "Hapus story")}
                >
                  🗑
                </button>
              </>
            )}
            <button
              type="button"
              onClick={close}
              className="w-[34px] h-[34px] rounded-xl text-white text-sm cursor-pointer bg-white/16 border border-white/28 backdrop-blur-md"
              aria-label={l(lang, "Close", "Tutup")}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 relative mx-3.5 rounded-[22px] overflow-hidden bg-[#241e1a]">
            <Media
              src={active.imageUrl}
              alt={active.name}
              shape="rect"
              placeholder={active.name}
              className="h-full w-full"
              sizes="100vw"
            />
            <span className="absolute left-4 right-4 bottom-4 text-white text-[13.5px] leading-relaxed px-3.5 py-3 rounded-2xl bg-[#1a1a1a]/50 backdrop-blur-md border border-white/20">
              {active.caption}
            </span>
            {!editing && (
              <>
                <button
                  type="button"
                  aria-label="previous"
                  onClick={() => open > 0 && openStory(open - 1)}
                  className="absolute left-0 top-0 bottom-0 w-1/3 border-0 bg-transparent cursor-pointer"
                />
                <button
                  type="button"
                  aria-label="next"
                  onClick={() =>
                    open + 1 >= stories.length ? close() : openStory(open + 1)
                  }
                  className="absolute right-0 top-0 bottom-0 w-2/3 border-0 bg-transparent cursor-pointer"
                />
              </>
            )}
          </div>

          {editing ? (
            <div className="flex gap-2.5 items-center p-3.5 pb-8">
              <input
                autoFocus
                value={draft}
                maxLength={280}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={l(lang, "Update your caption…", "Perbarui keteranganmu…")}
                className="flex-1 box-border h-11 rounded-2xl px-3.5 text-[13.5px] text-white bg-white/12 border border-white/25 backdrop-blur-md outline-none placeholder:text-white/50"
              />
              <button
                type="button"
                onClick={() => saveCaption(active.id, draft)}
                className="h-11 px-4 flex-none rounded-2xl text-[13.5px] font-bold cursor-pointer text-white bg-white/14 border border-white/28 backdrop-blur-md"
              >
                {l(lang, "Save", "Simpan")}
              </button>
            </div>
          ) : (
            <div className="flex gap-2.5 items-center p-3.5 pb-8">
              <input
                placeholder={l(lang, "Reply to this story…", "Balas story ini…")}
                className="flex-1 box-border h-11 rounded-2xl px-3.5 text-[13.5px] text-white bg-white/12 border border-white/25 backdrop-blur-md outline-none placeholder:text-white/50"
              />
              <button
                type="button"
                onClick={() => setLiked((v) => !v)}
                className={clsx(
                  "w-11 h-11 flex-none rounded-2xl text-lg cursor-pointer text-white bg-white/14 border border-white/28 backdrop-blur-md",
                  liked && "animate-[heart-pop_0.32s_ease]"
                )}
              >
                {liked ? "♥" : "♡"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
