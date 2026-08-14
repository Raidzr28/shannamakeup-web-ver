"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { compressImage } from "@/lib/compress-image";
import { Input, Label } from "@/components/ui/Field";
import { Radio } from "@/components/ui/Option";
import { submitPaymentAction } from "@/lib/actions/payment";
import { PAY_METHODS } from "@/lib/static-data";
import type { Lang } from "@/lib/i18n";
import { l, idr } from "@/lib/i18n";

const MAX_BYTES = 12 * 1024 * 1024;

export type PaymentChannels = {
  bank: string;
  accountNumber: string;
  accountName: string;
  qrisImageUrl: string | null;
  qrisMerchant: string;
};

export function PaymentForm({
  lang,
  bookingId,
  code,
  depositIdr,
  channels,
}: {
  lang: Lang;
  bookingId: string;
  code: string;
  depositIdr: number;
  channels: PaymentChannels;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<string>("transfer");
  const [preview, setPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setBusy(true);
    setError(null);
    try {
      if (!photo) {
        throw new Error(
          l(
            lang,
            "Attach a photo of your payment receipt.",
            "Lampirkan foto bukti pembayaranmu."
          )
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

      const upload = new FormData();
      upload.set("file", await compressImage(photo));
      upload.set("folder", "receipts");
      const response = await fetch("/api/upload", { method: "POST", body: upload });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(
          result.error ??
            l(lang, "Upload failed. Try again.", "Unggahan gagal. Coba lagi.")
        );
      }

      data.set("bookingId", bookingId);
      data.set("method", method);
      data.set("proof", result.url);

      const outcome = await submitPaymentAction(data);
      if (!outcome.ok) throw new Error(outcome.error ?? "Could not send your payment.");

      router.push(`/orders/${bookingId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : l(lang, "Could not send your payment.", "Tidak bisa mengirim pembayaranmu.")
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="glass-fill text-white rounded-[20px] p-[18px]">
        <div className="text-[11.5px] font-semibold tracking-[0.06em] uppercase opacity-80">
          {l(lang, "Deposit due", "Deposit yang harus dibayar")}
        </div>
        <div className="font-extrabold text-[28px] mt-2 tracking-tight">
          {idr(depositIdr)}
        </div>
        <div className="text-xs leading-snug opacity-85 mt-1.5">
          {l(
            lang,
            `Use ${code} as the transfer note so Shana can match it to your booking.`,
            `Tulis ${code} di berita transfer agar Shana bisa mencocokkannya.`
          )}
        </div>
      </div>

      <div className="glass-card p-[18px]">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "How you want to pay", "Cara pembayaran")}
        </div>
        <div className="flex flex-col gap-2 mt-3">
          {PAY_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={clsx(
                "flex gap-3 items-center w-full p-3.5 rounded-2xl cursor-pointer text-left border-[1.5px]",
                method === m.id ? "bg-[#f5e6dc] border-maroon" : "bg-white border-line"
              )}
            >
              <Radio active={method === m.id} />
              <span className="flex-1">
                <span className="block font-bold text-sm">{l(lang, m.name, m.nameId)}</span>
                <span className="block text-[11.5px] text-muted-2 mt-0.5">
                  {l(lang, m.note, m.noteId)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {method === "transfer" ? (
        <div className="glass-card p-[18px]">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "Transfer to", "Transfer ke")}
          </div>
          <div className="flex flex-col gap-2.5 mt-3">
            {[
              { k: l(lang, "Bank", "Bank"), v: channels.bank },
              { k: l(lang, "Account number", "Nomor rekening"), v: channels.accountNumber },
              { k: l(lang, "Account name", "Atas nama"), v: channels.accountName },
            ].map((row) => (
              <div key={row.k} className="flex justify-between gap-3 text-[13.5px]">
                <span className="text-muted">{row.k}</span>
                <span className="font-bold whitespace-nowrap">{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-[18px] flex flex-col items-center">
          <div className="w-full text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "Scan to pay", "Pindai untuk bayar")}
          </div>
          {channels.qrisImageUrl ? (
            <span className="relative w-[220px] h-[220px] mt-4 rounded-2xl overflow-hidden bg-white">
              <Image
                src={channels.qrisImageUrl}
                alt="QRIS"
                fill
                className="object-contain"
                sizes="220px"
                unoptimized
              />
            </span>
          ) : (
            <span className="w-[220px] h-[220px] mt-4 rounded-2xl border-[1.5px] border-dashed border-maroon/40 flex items-center justify-center text-center text-[12px] leading-snug text-muted-2 px-5">
              {l(
                lang,
                "The studio QRIS code has not been set up yet. Use bank transfer instead.",
                "Kode QRIS studio belum diatur. Gunakan transfer bank dulu."
              )}
            </span>
          )}
          <span className="mt-3 text-[12.5px] font-bold">{channels.qrisMerchant}</span>
        </div>
      )}

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Your receipt", "Bukti pembayaranmu")}
        </div>
        <label className="relative h-[240px] border-[1.5px] border-dashed border-maroon/50 rounded-[18px] overflow-hidden cursor-pointer flex items-center justify-center bg-white/60">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setPhoto(file);
              setPreview(URL.createObjectURL(file));
            }}
          />
          {preview ? (
            <Image src={preview} alt="receipt" fill className="object-contain" unoptimized />
          ) : (
            <span className="text-[13.5px] font-semibold text-muted px-6 text-center leading-snug">
              {l(
                lang,
                "Tap to attach your transfer or QRIS receipt",
                "Ketuk untuk melampirkan bukti transfer atau QRIS"
              )}
            </span>
          )}
        </label>
        <Label label={l(lang, "Sender name or reference", "Nama pengirim atau referensi")}>
          <Input
            name="reference"
            maxLength={120}
            placeholder={l(lang, "Optional — helps Shana match it", "Opsional — memudahkan pencocokan")}
          />
        </Label>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3">
        {error && (
          <p
            role="alert"
            className="m-0 text-[13px] leading-snug text-[#b23a3a] bg-[#f8e8e2] border border-[#b23a3a]/25 rounded-2xl px-3.5 py-3"
          >
            {error}
          </p>
        )}
        <p className="m-0 text-[11.5px] leading-snug text-muted-2">
          {l(
            lang,
            "Shana checks the receipt by hand. Your date is locked once she confirms it.",
            "Shana memeriksa bukti secara manual. Tanggalmu terkunci setelah dia konfirmasi."
          )}
        </p>
        <button
          type="submit"
          disabled={busy}
          className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy
            ? l(lang, "Sending…", "Mengirim…")
            : l(lang, "Send payment for review", "Kirim untuk diperiksa")}
        </button>
      </div>
    </form>
  );
}
