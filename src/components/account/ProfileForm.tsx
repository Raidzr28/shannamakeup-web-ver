"use client";
import { useState } from "react";
import Image from "next/image";
import { compressImage } from "@/lib/compress-image";
import { Input, Textarea, Label } from "@/components/ui/Field";
import { Media } from "@/components/ui/Media";
import { updateProfileAction } from "@/lib/actions/profile";
import { normalizeUsername, validateUsername, USERNAME_MAX } from "@/lib/username";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

const MAX_BYTES = 12 * 1024 * 1024;

export type ProfileValues = {
  name: string;
  username: string;
  bio: string;
  phone: string;
  address: string;
  city: string;
  avatarUrl: string | null;
};

export function ProfileForm({
  lang,
  profile,
}: {
  lang: Lang;
  profile: ProfileValues;
}) {
  const [username, setUsername] = useState(profile.username);
  const [preview, setPreview] = useState<string | null>(null);
  // null = leave as-is, "remove" = clear it, otherwise a freshly chosen File.
  const [photo, setPhoto] = useState<File | "remove" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const shownAvatar = photo === "remove" ? null : (preview ?? profile.avatarUrl);
  const usernameError = username ? validateUsername(normalizeUsername(username)) : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      if (photo === "remove") {
        data.set("avatarUrl", "remove");
      } else if (photo) {
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
        upload.set("folder", "avatars");

        const response = await fetch("/api/upload", { method: "POST", body: upload });
        const result = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !result.url) {
          throw new Error(
            result.error ??
              l(lang, "Upload failed. Try again.", "Unggahan gagal. Coba lagi.")
          );
        }
        data.set("avatarUrl", result.url);
      } else {
        data.set("avatarUrl", "");
      }

      const outcome = await updateProfileAction(data);
      if (!outcome.ok) throw new Error(outcome.error ?? "Could not save your profile.");

      setSaved(true);
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : l(lang, "Could not save your profile.", "Tidak bisa menyimpan profilmu.")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Profile photo", "Foto profil")}
        </div>
        <div className="flex gap-3.5 items-center">
          <span className="w-20 h-20 flex-none">
            {preview && photo !== "remove" ? (
              <span className="relative block w-20 h-20 rounded-full overflow-hidden">
                <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
              </span>
            ) : (
              <Media
                src={shownAvatar}
                alt={profile.name}
                shape="circle"
                placeholder={profile.name.slice(0, 1).toUpperCase()}
                className="w-20 h-20"
              />
            )}
          </span>
          <div className="flex-1 flex flex-col gap-2">
            <label className="h-[42px] px-4 rounded-2xl text-[13px] font-bold cursor-pointer flex items-center justify-center glass-light text-ink">
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
              {l(lang, "Choose a photo", "Pilih foto")}
            </label>
            {shownAvatar && (
              <button
                type="button"
                onClick={() => {
                  setPhoto("remove");
                  setPreview(null);
                }}
                className="h-[42px] px-4 rounded-2xl text-[13px] font-bold cursor-pointer glass-light text-[var(--paes-alarm)] border-[var(--paes-alarm)]/30"
              >
                {l(lang, "Remove photo", "Hapus foto")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Who you are", "Tentang kamu")}
        </div>
        <Label label={l(lang, "Display name", "Nama tampilan")}>
          <Input name="name" defaultValue={profile.name} maxLength={60} required />
        </Label>
        <Label label={l(lang, "Username", "Nama pengguna")}>
          <span className="relative flex items-center">
            <span className="absolute left-3.5 text-sm text-muted-3">@</span>
            <Input
              name="username"
              value={username}
              onChange={(e) => setUsername(normalizeUsername(e.target.value))}
              maxLength={USERNAME_MAX}
              className="pl-7"
              required
            />
          </span>
        </Label>
        <p className="m-0 text-[11.5px] leading-snug text-muted-2">
          {usernameError
            ? usernameError
            : l(
                lang,
                "This is the handle shown on your posts and stories.",
                "Ini nama yang tampil di unggahan dan story-mu."
              )}
        </p>
        <Label label={l(lang, "Bio", "Bio")}>
          <Textarea
            name="bio"
            defaultValue={profile.bio}
            maxLength={200}
            placeholder={l(
              lang,
              "Bride, Jakarta. Booked Shana for the akad and the resepsi.",
              "Pengantin, Jakarta. Pesan Shana untuk akad dan resepsi."
            )}
          />
        </Label>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Where to find you", "Alamat kamu")}
        </div>
        <p className="m-0 text-[11.5px] leading-snug text-muted-2">
          {l(
            lang,
            "Saved once here, then offered as the default when you book — Shana travels to you.",
            "Disimpan sekali di sini, lalu dipakai otomatis saat memesan — Shana datang ke tempatmu."
          )}
        </p>
        <Label label={l(lang, "Phone", "Telepon")}>
          <Input name="phone" defaultValue={profile.phone} maxLength={30} placeholder="+62 812 0000 0000" />
        </Label>
        <Label label={l(lang, "Address", "Alamat")}>
          <Textarea
            name="address"
            defaultValue={profile.address}
            maxLength={200}
            placeholder={l(lang, "Street, building, unit…", "Jalan, gedung, unit…")}
          />
        </Label>
        <Label label={l(lang, "City", "Kota")}>
          <Input name="city" defaultValue={profile.city} maxLength={60} placeholder="Jakarta" />
        </Label>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3">
        {error && (
          <p
            role="alert"
            className="m-0 text-[13px] leading-snug text-[var(--paes-alarm)] bg-[var(--paes-ground-2)] border border-[var(--paes-alarm)]/25 rounded-2xl px-3.5 py-3"
          >
            {error}
          </p>
        )}
        {saved && !error && (
          <p
            role="status"
            className="m-0 text-[13px] leading-snug text-maroon bg-tint border border-maroon/20 rounded-2xl px-3.5 py-3"
          >
            {l(lang, "Profile saved.", "Profil tersimpan.")}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || Boolean(usernameError)}
          className="w-full h-[52px] rounded-2xl text-[15px] font-bold cursor-pointer prada-leaf disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? l(lang, "Saving…", "Menyimpan…") : l(lang, "Save profile", "Simpan profil")}
        </button>
      </div>
    </form>
  );
}
