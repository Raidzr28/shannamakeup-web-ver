"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { changePasswordAction } from "@/lib/actions/profile";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

export function PasswordForm({ lang }: { lang: Lang }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const outcome = await changePasswordAction(data);
      if (!outcome.ok)
        throw new Error(outcome.error ?? "Could not change your password.");
      setSaved(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : l(lang, "Could not change your password.", "Tidak bisa mengubah kata sandimu.")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-[18px] flex flex-col gap-3.5">
      <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
        {l(lang, "Password", "Kata sandi")}
      </div>
      <Label label={l(lang, "Current password", "Kata sandi saat ini")}>
        <Input type="password" name="current" autoComplete="current-password" required />
      </Label>
      <Label label={l(lang, "New password", "Kata sandi baru")}>
        <Input
          type="password"
          name="next"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </Label>
      <Label label={l(lang, "Confirm new password", "Ulangi kata sandi baru")}>
        <Input
          type="password"
          name="confirm"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </Label>

      {error && (
        <p
          role="alert"
          className="m-0 text-[13px] leading-snug text-[#b23a3a] bg-[#f8e8e2] border border-[#b23a3a]/25 rounded-2xl px-3.5 py-3"
        >
          {error}
        </p>
      )}
      {saved && !error && (
        <p
          role="status"
          className="m-0 text-[13px] leading-snug text-maroon bg-tint border border-maroon/20 rounded-2xl px-3.5 py-3"
        >
          {l(lang, "Password changed.", "Kata sandi diubah.")}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full h-[50px] rounded-2xl text-ink text-[14.5px] font-bold cursor-pointer glass-light disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy
          ? l(lang, "Saving…", "Menyimpan…")
          : l(lang, "Change password", "Ubah kata sandi")}
      </button>
    </form>
  );
}
