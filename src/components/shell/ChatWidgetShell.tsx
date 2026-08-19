"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import { ChatIcon, ChevronDownIcon } from "@/components/ui/Icons";

const KEY = "shana_chat_open";

/** The floating studio chat, with somewhere to put it.
 *
 * It used to be permanently open on every desktop page, covering the bottom
 * right corner of whatever you were reading with no way to dismiss it. Now it
 * collapses to a launcher, and the choice is remembered — a widget you have to
 * re-close on every navigation is worse than one that never opened. */
export function ChatWidgetShell({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  // Start closed and reconcile after mount: reading localStorage during render
  // would mismatch the server HTML.
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(KEY) === "1");
    } catch {
      /* private mode — default to closed */
    }
    setReady(true);
  }, []);

  function toggle(next: boolean) {
    setOpen(next);
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* nothing to persist to; the session still works */
    }
  }

  if (!ready) return null;

  if (!open) {
    return (
      <div className="fixed bottom-0 right-0 z-40 flex w-full justify-end px-9 pb-7 pointer-events-none">
        <button
          type="button"
          onClick={() => toggle(true)}
          aria-label={l(lang, "Open the studio chat", "Buka chat studio")}
          className="prada-leaf pointer-events-auto flex h-[54px] items-center gap-2.5 rounded-full px-5 text-[13.5px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.8)]"
        >
          <ChatIcon className="h-[19px] w-[19px]" />
          {l(lang, "Ask the studio", "Tanya studio")}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-40 flex w-full justify-end px-9 pb-7 pointer-events-none">
      <div className="pointer-events-auto w-[352px] overflow-hidden rounded-[22px_22px_8px_8px] border border-prada/50 bg-ground shadow-[0_18px_44px_-14px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-2.5 border-b border-prada/30 bg-ground-3 px-4 py-3.5">
          <span className="font-display text-[15px] leading-none text-melati">
            Shana Studio
          </span>
          <span className="flex-1 text-[11px] text-melati-3">
            {l(lang, "answers day and night", "menjawab siang malam")}
          </span>
          <button
            type="button"
            onClick={() => toggle(false)}
            aria-label={l(lang, "Hide the chat", "Sembunyikan chat")}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-prada/35 text-melati-2 transition-colors hover:border-prada/70 hover:text-melati"
          >
            <ChevronDownIcon className="h-[17px] w-[17px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
