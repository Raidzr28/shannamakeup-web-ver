"use client";
import { useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { changePasswordAction } from "@/lib/actions/profile";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

/** Changes a password, or sets the first one.
 *
 * An account that arrived through the Google button has no password to ask
 * for, so the current-password field is dropped rather than shown and left
 * impossible to fill — it is `required`, and a Google-only user would be stuck
 * looking at a form that cannot be submitted. The action makes the same
 * distinction server-side; this only keeps the form honest about it. */
export function PasswordForm({
  lang,
  hasPassword,
}: {
  lang: Lang;
  hasPassword: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Seeded from the server, then flipped on the first successful save. Without
  // that, setting a password and immediately changing it again would submit
  // without the current one and be refused by an action that now demands it.
  const [needsCurrent, setNeedsCurrent] = useState(hasPassword);

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
      setNeedsCurrent(true);
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

      {needsCurrent ? (
        <Label label={l(lang, "Current password", "Kata sandi saat ini")}>
          <Input
            type="password"
            name="current"
            autoComplete="current-password"
            required
          />
        </Label>
      ) : (
        <p className="m-0 text-[12.5px] leading-relaxed text-muted">
          {l(
            lang,
            "You signed in with Google, so you have no password yet. Set one to be able to sign in with your email as well.",
            "Kamu masuk dengan Google, jadi belum punya kata sandi. Atur satu agar bisa masuk dengan email juga."
          )}
        </p>
      )}

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
          {/* Neutral wording covers both a first password and a change,
              without the message having to guess which just happened. */}
          {l(lang, "Password saved.", "Kata sandi disimpan.")}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full h-[50px] rounded-2xl text-ink text-[14.5px] font-bold cursor-pointer glass-light disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy
          ? l(lang, "Saving…", "Menyimpan…")
          : needsCurrent
            ? l(lang, "Change password", "Ubah kata sandi")
            : l(lang, "Set password", "Atur kata sandi")}
      </button>
    </form>
  );
}
