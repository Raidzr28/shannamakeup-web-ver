"use client";
import { useState } from "react";
import Image from "next/image";
import { compressImage } from "@/lib/compress-image";
import { Textarea, Label } from "@/components/ui/Field";
import { createStoryAction } from "@/lib/actions/stories";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

const MAX_BYTES = 12 * 1024 * 1024;

export function StoryForm({ lang }: { lang: Lang }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Same two-step upload as the post composer: compress in the browser, hand
   * the bytes to /api/upload, then send only the URL through the Server Action,
   * which rejects bodies over 1 MB. */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const photo = data.get("photo");

    setBusy(true);
    setError(null);
    try {
      if (!(photo instanceof File) || photo.size === 0) {
        throw new Error(
          l(lang, "Choose a photo first.", "Pilih foto dulu.")
        );
      }
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
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(
          result.error ??
            l(lang, "Upload failed. Try again.", "Unggahan gagal. Coba lagi.")
        );
      }

      data.delete("photo");
      data.set("imageUrl", result.url);
      await createStoryAction(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : l(lang, "Upload failed. Try again.", "Unggahan gagal. Coba lagi.")
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="relative h-[380px] glass-card border-[1.5px] border-dashed border-maroon/50 overflow-hidden cursor-pointer flex items-center justify-center rounded-[22px]">
        <input
          type="file"
          name="photo"
          accept="image/png,image/jpeg,image/webp"
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
        <Label label={l(lang, "Caption", "Keterangan")}>
          <Textarea
            name="caption"
            maxLength={280}
            placeholder={l(
              lang,
              "Base test under 4pm daylight — no flash, no filter.",
              "Uji base di cahaya jam 4 — tanpa flash, tanpa filter."
            )}
          />
        </Label>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3">
        <p className="m-0 text-xs leading-snug text-muted-3">
          {l(
            lang,
            "This story disappears 24 hours after you post it. You can delete it yourself at any point before then.",
            "Story ini hilang 24 jam setelah diunggah. Kamu bisa menghapusnya sendiri kapan saja sebelum itu."
          )}
        </p>
        {error && (
          <p
            role="alert"
            className="text-[13px] leading-snug text-[var(--paes-alarm)] bg-[var(--paes-ground-2)] border border-[var(--paes-alarm)]/25 rounded-2xl px-3.5 py-3"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full h-[52px] rounded-2xl text-[15px] font-bold cursor-pointer prada-leaf disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy
            ? l(lang, "Posting…", "Mengunggah…")
            : l(lang, "Share story", "Bagikan story")}
        </button>
      </div>
    </form>
  );
}
