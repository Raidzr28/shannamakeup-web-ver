"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { compressImage } from "@/lib/compress-image";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

const MAX_BYTES = 12 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

/** Drag-and-drop / choose-file picker that uploads immediately and keeps the
 * resulting Blob URL in a hidden field, so the surrounding Server Action just
 * receives a string. Uploading on pick (rather than on submit) means the artist
 * sees the photo land before saving. */
export function ImagePicker({
  name,
  lang,
  defaultUrl,
}: {
  name: string;
  lang: Lang;
  defaultUrl?: string | null;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!ACCEPT.split(",").includes(file.type)) {
      setError(l(lang, "Choose a JPEG, PNG or WebP image.", "Pilih gambar JPEG, PNG atau WebP."));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        l(lang, "That photo is larger than 12 MB.", "Foto itu lebih dari 12 MB.")
      );
      return;
    }

    setBusy(true);
    try {
      const compressed = await compressImage(file);
      const body = new FormData();
      body.set("file", compressed);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(
          result.error ?? l(lang, "Upload failed.", "Unggahan gagal.")
        );
      }
      setUrl(result.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : l(lang, "Upload failed. Try again.", "Unggahan gagal. Coba lagi.")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* The value the Server Action reads. */}
      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={clsx(
          "relative rounded-[22px] border-[1.5px] border-dashed overflow-hidden transition-colors",
          dragging ? "border-green bg-tint" : "border-green/40 bg-white/50",
          url ? "h-[240px]" : "h-[170px]"
        )}
      >
        {url ? (
          <>
            <Image
              src={url}
              alt={l(lang, "Package photo", "Foto paket")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 620px"
            />
            <button
              type="button"
              onClick={() => setUrl("")}
              className="absolute top-3 right-3 px-3 py-2 rounded-xl text-[12px] font-bold text-[#b23a3a] bg-white/90 backdrop-blur-md border border-[#b23a3a]/25 cursor-pointer"
            >
              {l(lang, "Remove", "Hapus")}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-transparent"
          >
            <span className="text-[13.5px] font-bold text-ink">
              {busy
                ? l(lang, "Uploading…", "Mengunggah…")
                : l(lang, "Drag a photo here", "Taruh foto di sini")}
            </span>
            <span className="text-[12px] text-muted-3">
              {l(lang, "or tap to choose a file", "atau ketuk untuk pilih file")}
            </span>
          </button>
        )}

        {busy && url && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[13px] font-bold text-ink">
            {l(lang, "Uploading…", "Mengunggah…")}
          </span>
        )}
      </div>

      <div className="flex gap-2.5 items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="h-[42px] px-4 rounded-xl text-[13px] font-bold text-ink glass-light cursor-pointer disabled:opacity-60"
        >
          {url
            ? l(lang, "Replace photo", "Ganti foto")
            : l(lang, "Choose file", "Pilih file")}
        </button>
        <span className="text-[11.5px] text-muted-3 leading-snug">
          {l(
            lang,
            "Resized automatically before upload.",
            "Ukurannya dikecilkan otomatis sebelum diunggah."
          )}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {error && (
        <p
          role="alert"
          className="text-[12.5px] leading-snug text-[#b23a3a] bg-[#f7eeee] border border-[#b23a3a]/25 rounded-2xl px-3 py-2.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}
