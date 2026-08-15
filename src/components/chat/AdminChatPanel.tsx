"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { replyToClientAction } from "@/lib/actions/inbox";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

export type AdminMessage = {
  id: string;
  who: string;
  text: string;
  at: string;
};

/** The artist's side of a conversation.
 *
 * A client component only for the two things a chat needs and a server
 * component cannot do: keeping the transcript pinned to the newest message,
 * and clearing the input after a reply sends. Everything else — who said
 * what, the bookings, the destructive actions — stays on the server page. */
export function AdminChatPanel({
  lang,
  messages,
  userId,
  clientName,
  clientAuthor,
  artistAuthor,
}: {
  lang: Lang;
  messages: AdminMessage[];
  userId: string;
  clientName: string;
  clientAuthor: string;
  artistAuthor: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const firstName = clientName.split(" ")[0];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 overflow-auto flex-1 min-h-0 px-4 py-4"
      >
        {messages.length === 0 && (
          <p className="m-0 text-[13px] text-muted text-center py-8">
            {l(lang, "No messages yet.", "Belum ada pesan.")}
          </p>
        )}

        {messages.map((m, i) => {
          // Flipped from the client's own panel: here the studio is "us" and
          // the client sits on the left.
          const fromClient = m.who === clientAuthor;
          const fromArtist = m.who === artistAuthor;
          const prev = messages[i - 1];
          // Only label a bubble when the speaker changes, so a run of replies
          // reads as one turn rather than a stack of repeated names.
          const showWho = !prev || prev.who !== m.who;

          return (
            <div
              key={m.id}
              className={clsx(
                "flex flex-col max-w-[84%]",
                fromClient ? "self-start items-start" : "self-end items-end"
              )}
            >
              {showWho && (
                <span className="text-[10.5px] font-bold text-muted-3 mb-1 px-1">
                  {fromClient
                    ? firstName
                    : fromArtist
                      ? l(lang, "You", "Kamu")
                      : l(lang, "Assistant", "Asisten")}
                </span>
              )}
              <span
                className={clsx(
                  "text-[13.5px] leading-relaxed px-3.5 py-3 whitespace-pre-wrap break-words",
                  fromClient
                    ? "rounded-[18px_18px_18px_6px] text-ink glass-light"
                    : fromArtist
                      ? "rounded-[18px_18px_6px_18px] bg-maroon text-white"
                      : "rounded-[18px_18px_6px_18px] bg-[#e8dcf0] text-[#4a3b32]"
                )}
              >
                {m.text}
              </span>
              <span className="text-[10px] text-faint mt-1 px-1">{m.at}</span>
            </div>
          );
        })}
      </div>

      <form
        ref={formRef}
        action={async (formData) => {
          await replyToClientAction(formData);
          formRef.current?.reset();
        }}
        // flex-none so the composer is never squeezed by a long transcript, and
        // the extra bottom padding clears a phone's gesture bar.
        className="flex gap-2.5 items-center bg-white border-t border-line flex-none px-4 py-3.5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      >
        <input type="hidden" name="userId" value={userId} />
        <input
          name="text"
          required
          maxLength={2000}
          autoComplete="off"
          placeholder={l(lang, `Reply to ${firstName}…`, `Balas ${firstName}…`)}
          className="flex-1 min-w-0 min-h-[44px] box-border rounded-2xl border-[1.5px] border-line-2 bg-white px-3.5 text-sm outline-none focus:border-maroon"
        />
        <SubmitButton
          aria-label={l(lang, "Send reply", "Kirim balasan")}
          pendingLabel="…"
          className="w-[46px] h-[46px] flex-none rounded-2xl text-white text-lg cursor-pointer glass-fill"
        >
          →
        </SubmitButton>
      </form>
    </div>
  );
}
