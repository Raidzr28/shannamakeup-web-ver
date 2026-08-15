"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useRef, useEffect } from "react";
import { sendMessageAction } from "@/lib/actions/chat";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import { QUICK_REPLIES } from "@/lib/chat";

export type ChatMessage = { id: string; who: string; text: string };

export function ChatPanel({
  lang,
  messages,
  signedIn,
  variant = "full",
  lookTitle = "Akad Pagi",
  lookPrice = 8500000,
  whenLine = "22 Aug · 05:00",
}: {
  lang: Lang;
  messages: ChatMessage[];
  signedIn: boolean;
  variant?: "full" | "floating";
  lookTitle?: string;
  lookPrice?: number;
  whenLine?: string;
}) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const bubbles = messages.length
    ? messages
    : [
        {
          id: "seed",
          who: "bot",
          text: l(
            lang,
            "Good evening. I keep Shana’s calendar — tell me your date and city and I’ll tell you what is still open.",
            "Selamat malam. Saya memegang jadwal Shana — sebutkan tanggal dan kota, saya beri tahu yang masih terbuka."
          ),
        },
      ];

  return (
    <div
      className={clsx(
        "flex flex-col",
        // `h-full` here resolved to the whole container height even though the
        // header had already taken its share, so header + panel overflowed and
        // the composer sat below the fold. `flex-1 min-h-0` makes the panel
        // take what is left instead, and lets it shrink — a flex item defaults
        // to min-height:auto, which refuses to shrink past its content.
        variant === "full" ? "flex-1 min-h-0" : ""
      )}
    >
      <div
        ref={scrollRef}
        className={clsx(
          "flex flex-col gap-3 overflow-auto",
          variant === "full" ? "flex-1 min-h-0 px-5 py-5" : "max-h-54 p-3.5"
        )}
      >
        {bubbles.map((m) => {
          const mine = m.who === "You";
          return (
            <div
              key={m.id}
              className={clsx("flex max-w-[84%]", mine ? "self-end" : "self-start")}
            >
              <span
                className={clsx(
                  "text-[13.5px] leading-relaxed px-3.5 py-3",
                  mine
                    ? "rounded-[18px_18px_6px_18px] bg-maroon text-white"
                    : "rounded-[18px_18px_18px_6px] text-ink glass-light"
                )}
              >
                {m.text}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className={clsx(
          "flex gap-2 overflow-auto no-scrollbar flex-none",
          variant === "full" ? "px-5 pb-3" : "px-3.5 pb-3"
        )}
      >
        {QUICK_REPLIES.map((q) => {
          const text = l(lang, q.en, q.id);
          return (
            <form key={text} action={sendMessageAction}>
              <input type="hidden" name="text" value={text} />
              <input type="hidden" name="next" value={pathname} />
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="lookTitle" value={lookTitle} />
              <input type="hidden" name="lookPrice" value={lookPrice} />
              <input type="hidden" name="whenLine" value={whenLine} />
              <SubmitButton className="px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap glass-light text-[#5c4a3f] cursor-pointer">
                {text}
              </SubmitButton>
            </form>
          );
        })}
      </div>

      <form
        action={sendMessageAction}
        className={clsx(
          "flex gap-2.5 items-center bg-white border-t border-line flex-none",
          // The extra bottom padding clears a phone's home indicator or gesture
          // bar; env() adds the device's own inset on top where it reports one.
          variant === "full"
            ? "px-5 py-3.5 pb-[calc(2rem+env(safe-area-inset-bottom))]"
            : "px-3.5 py-3"
        )}
      >
        <input type="hidden" name="next" value={pathname} />
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="lookTitle" value={lookTitle} />
        <input type="hidden" name="lookPrice" value={lookPrice} />
        <input type="hidden" name="whenLine" value={whenLine} />
        <input
          name="text"
          placeholder={l(lang, "Ask about a date, price, travel…", "Tanya tanggal, harga, perjalanan…")}
          className="flex-1 min-h-[44px] box-border rounded-2xl border-[1.5px] border-line-2 bg-white px-3.5 text-sm outline-none focus:border-maroon"
          autoComplete="off"
        />
        <SubmitButton
          aria-label={l(lang, "Send", "Kirim")}
          pendingLabel="…"
          className="w-[46px] h-[46px] flex-none rounded-2xl text-white text-lg cursor-pointer glass-fill"
        >
          →
        </SubmitButton>
      </form>
      {!signedIn && (
        <p className="px-5 pb-4 text-[11.5px] text-muted-2">
          {l(
            lang,
            "Sending a message will ask you to sign in first.",
            "Mengirim pesan akan meminta kamu masuk terlebih dahulu."
          )}
        </p>
      )}
    </div>
  );
}
