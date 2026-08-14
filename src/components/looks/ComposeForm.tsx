"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { compressImage } from "@/lib/compress-image";
import { Input, Textarea, Label } from "@/components/ui/Field";
import { Radio, Check } from "@/components/ui/Option";
import { createPostAction } from "@/lib/actions/posts";
import type { Lang } from "@/lib/i18n";
import { l, idr } from "@/lib/i18n";
import type { LookDTO } from "@/lib/looks";
import { EXTRAS } from "@/lib/static-data";

const MAX_BYTES = 12 * 1024 * 1024;

export function ComposeForm({
  lang,
  looks,
}: {
  lang: Lang;
  looks: LookDTO[];
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [lookId, setLookId] = useState(looks[0]?.id ?? "");
  const [extras, setExtras] = useState<string[]>(["lashes"]);
  const [credit, setCredit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Compress the photo in the browser, hand it to /api/upload, then submit only
   * the resulting URL. The raw file never goes through the Server Action, which
   * rejects bodies over 1 MB — smaller than any phone photo. */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const photo = data.get("photo");

    setBusy(true);
    setError(null);
    try {
      let imageUrl = "";
      if (photo instanceof File && photo.size > 0) {
        if (photo.size > MAX_BYTES) {
          throw new Error(
            l(
              lang,
              "That photo is larger than 12 MB. Please choose a smaller one.",
              "Foto itu lebih dari 12 MB. Pilih yang lebih kecil."
            )
          );
        }

        const compressed = await compressImage(photo);
        const upload = new FormData();
        upload.set("file", compressed);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: upload,
        });
        const result = (await response.json()) as {
          url?: string;
          error?: string;
        };
        if (!response.ok || !result.url) {
          throw new Error(
            result.error ??
              l(lang, "Upload failed. Try again.", "Unggahan gagal. Coba lagi.")
          );
        }
        imageUrl = result.url;
      }

      data.delete("photo");
      data.set("imageUrl", imageUrl);
      await createPostAction(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : l(lang, "Upload failed. Try again.", "Unggahan gagal. Coba lagi.")
      );
      setBusy(false);
    }
  }

  const chosen = looks.find((k) => k.id === lookId) ?? looks[0];
  const addonWord =
    extras.length === 1 ? l(lang, "add-on", "tambahan") : l(lang, "add-ons", "tambahan");
  const summary = chosen
    ? l(lang, chosen.title, chosen.titleId) +
      (extras.length ? ` + ${extras.length} ${addonWord}` : "")
    : "";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="lookId" value={lookId} />
      {extras.map((e) => (
        <input key={e} type="hidden" name="extras" value={e} />
      ))}
      {credit && <input type="hidden" name="credit" value="on" />}

      <label className="relative h-[300px] glass-card border-[1.5px] border-dashed border-maroon/50 overflow-hidden cursor-pointer flex items-center justify-center rounded-[22px]">
        <input
          type="file"
          name="photo"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        {preview ? (
          <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
        ) : (
          <span className="text-[13.5px] font-semibold text-muted">
            {l(lang, "Tap to choose your photo", "Ketuk untuk memilih fotomu")}
          </span>
        )}
      </label>

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <Label label={l(lang, "Title", "Judul")}>
          <Input name="title" placeholder={l(lang, "Akad morning in Menteng", "Pagi akad di Menteng")} />
        </Label>
        <Label label={l(lang, "Description", "Deskripsi")}>
          <Textarea
            name="description"
            placeholder={l(
              lang,
              "What the look was for, how it held, what you would change…",
              "Untuk acara apa, seberapa tahan, apa yang ingin diubah…"
            )}
          />
        </Label>
        <Label label={l(lang, "Location", "Lokasi")}>
          <Input name="place" placeholder="Menteng · Jakarta" />
        </Label>
      </div>

      <div className="glass-card p-[18px]">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Makeup package used", "Paket rias yang dipakai")}
        </div>
        <p className="mt-2 text-xs leading-snug text-muted-3">
          {l(
            lang,
            "Tagging the package lets anyone book the same look from your post.",
            "Menandai paket membuat orang bisa memesan tampilan yang sama dari unggahanmu."
          )}
        </p>
        <div className="flex flex-col gap-2 mt-3">
          {looks.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setLookId(k.id)}
              className={clsx(
                "flex gap-3 items-center w-full p-3.5 rounded-2xl cursor-pointer text-left border-[1.5px]",
                lookId === k.id ? "bg-[#f5e6dc] border-maroon" : "bg-white border-line"
              )}
            >
              <Radio active={lookId === k.id} />
              <span className="flex-1">
                <span className="block font-bold text-sm">{l(lang, k.title, k.titleId)}</span>
                <span className="block text-[11.5px] text-muted-3 mt-0.5">
                  {l(lang, k.category, k.categoryId)} · {k.durationLabel}
                </span>
              </span>
              <span className="font-extrabold text-[13px] text-maroon">{idr(k.priceIdr)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-[18px]">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Add-ons used", "Tambahan yang dipakai")}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {EXTRAS.map((e) => {
            const on = extras.includes(e.id);
            return (
              <button
                key={e.id}
                type="button"
                onClick={() =>
                  setExtras((cur) =>
                    cur.includes(e.id) ? cur.filter((x) => x !== e.id) : [...cur, e.id]
                  )
                }
                className={clsx(
                  "px-[15px] py-2.5 rounded-full text-[12.5px] font-semibold cursor-pointer whitespace-nowrap border",
                  on
                    ? "glass-fill text-white border-transparent"
                    : "glass-light text-[#5c4a3f] border-white/80"
                )}
              >
                {l(lang, e.name, e.nameId)}
              </button>
            );
          })}
        </div>

        <div className="h-px bg-line my-4" />

        <button
          type="button"
          onClick={() => setCredit((v) => !v)}
          className="flex gap-3 items-center w-full border-0 bg-transparent cursor-pointer p-0 text-ink text-left"
        >
          <Check active={credit} />
          <span className="flex-1 text-[13px] leading-snug">
            {l(
              lang,
              "Credit Shana as the artist on this post",
              "Cantumkan Shana sebagai artist di unggahan ini"
            )}
          </span>
        </button>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-3">{l(lang, "Tagged package", "Paket ditandai")}</span>
          <span className="font-extrabold text-[15px]">{summary}</span>
        </div>
        {error && (
          <p
            role="alert"
            className="text-[13px] leading-snug text-[#b23a3a] bg-[#f8e8e2] border border-[#b23a3a]/25 rounded-2xl px-3.5 py-3"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy
            ? l(lang, "Posting…", "Mengunggah…")
            : l(lang, "Post to Looks", "Unggah ke Looks")}
        </button>
      </div>
    </form>
  );
}
