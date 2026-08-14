"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Media } from "@/components/ui/Media";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

export type Story = {
  id: string;
  name: string;
  time: string;
  caption: string;
  imageUrl: string | null;
};

export function StoryBar({ lang, stories }: { lang: Lang; stories: Story[] }) {
  const [open, setOpen] = useState<number>(-1);
  const [seen, setSeen] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);

  const active = open >= 0 ? stories[open] : null;

  useEffect(() => {
    if (open < 0) return;
    const timer = setTimeout(() => {
      setOpen((i) => (i + 1 >= stories.length ? -1 : i + 1));
      setLiked(false);
    }, 4200);
    return () => clearTimeout(timer);
  }, [open, stories.length]);

  function openStory(i: number) {
    setOpen(i);
    setLiked(false);
    setSeen((s) => (s.includes(stories[i].id) ? s : [...s, stories[i].id]));
  }

  return (
    <>
      <div className="no-scrollbar flex gap-3.5 px-5 pt-1 pb-4 overflow-auto">
        {stories.map((story, i) => {
          const isSeen = seen.includes(story.id);
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
                {story.name}
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
                      : i === open
                        ? { animation: "story-fill 4.2s linear forwards" }
                        : { transform: "scaleX(0)" }
                  }
                />
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2.5 p-3.5">
            <span className="w-9 h-9 flex-none">
              <Media
                src={active.imageUrl}
                alt={active.name}
                shape="circle"
                placeholder={active.name.slice(0, 1).toUpperCase()}
                className="w-9 h-9"
              />
            </span>
            <span className="flex-1 text-white">
              <span className="block font-bold text-[13.5px]">{active.name}</span>
              <span className="block text-[11px] opacity-70 mt-0.5">{active.time}</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(-1)}
              className="w-[34px] h-[34px] rounded-xl text-white text-sm cursor-pointer bg-white/16 border border-white/28 backdrop-blur-md"
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
                open + 1 >= stories.length ? setOpen(-1) : openStory(open + 1)
              }
              className="absolute right-0 top-0 bottom-0 w-2/3 border-0 bg-transparent cursor-pointer"
            />
          </div>

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
        </div>
      )}
    </>
  );
}
