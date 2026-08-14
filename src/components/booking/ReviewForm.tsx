"use client";

import { useState } from "react";
import clsx from "clsx";
import { Textarea, Label } from "@/components/ui/Field";
import { submitReviewAction } from "@/lib/actions/review";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

export function ReviewForm({
  lang,
  bookingId,
}: {
  lang: Lang;
  bookingId: string;
}) {
  const [rating, setRating] = useState(5);
  const [traits, setTraits] = useState<string[]>([]);

  const traitOptions = [
    l(lang, "On time", "Tepat waktu"),
    l(lang, "Held all day", "Tahan sepanjang hari"),
    l(lang, "Listened", "Mendengarkan"),
    l(lang, "Calm on set", "Tenang di lokasi"),
    l(lang, "Skin felt good", "Kulit nyaman"),
  ];

  return (
    <form action={submitReviewAction} className="flex flex-col gap-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      {traits.map((t) => (
        <input key={t} type="hidden" name="traits" value={t} />
      ))}

      <div className="glass-card p-[18px] text-center">
        <p className="text-[13.5px] leading-relaxed text-muted-2">
          {l(lang, "How was the day? Two taps is enough.", "Bagaimana harinya? Dua ketukan cukup.")}
        </p>
        <div className="flex gap-2.5 justify-center mt-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={clsx(
                "w-11 h-11 rounded-2xl cursor-pointer text-lg border-[1.5px]",
                n <= rating
                  ? "border-gold bg-gold text-ink"
                  : "border-line bg-white text-[#d8c6ae]"
              )}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-[18px]">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "What stood out", "Yang menonjol")}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {traitOptions.map((t) => {
            const on = traits.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setTraits((cur) =>
                    cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]
                  )
                }
                className={clsx(
                  "px-[15px] py-2.5 rounded-full text-[12.5px] font-semibold cursor-pointer whitespace-nowrap border",
                  on
                    ? "glass-fill text-white border-transparent"
                    : "glass-light text-[#5c4a3f] border-white/80"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="mt-4.5">
          <Label label={l(lang, "In your words", "Dengan kata-katamu")}>
            <Textarea
              name="note"
              placeholder={l(
                lang,
                "The base held through eleven hours…",
                "Base-nya tahan sebelas jam…"
              )}
            />
          </Label>
        </div>

        <div className="mt-3.5 bg-[#f1e7d8] rounded-2xl px-3.5 py-3 text-xs leading-relaxed text-muted">
          {l(
            lang,
            "Shana may show your photographs in the portfolio. You can withdraw this at any time.",
            "Shana boleh menampilkan fotomu di portofolio. Bisa ditarik kapan saja."
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
      >
        {l(lang, "Send review", "Kirim ulasan")}
      </button>
    </form>
  );
}
