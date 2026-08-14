import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Label } from "@/components/ui/Field";
import { getLanguage } from "@/lib/language";
import { getSession } from "@/lib/auth";
import { l } from "@/lib/i18n";
import { loginAction, demoArtistLoginAction } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reason?: string }>;
}) {
  const [lang, session, params] = await Promise.all([
    getLanguage(),
    getSession(),
    searchParams,
  ]);
  if (session) redirect(params.next ?? "/");

  const next = params.next ?? "/";

  return (
    <AuthShell>
      {params.reason && (
        <div className="glass-card p-4 mb-5 flex gap-3 items-start">
          <span className="w-9 h-9 rounded-xl glass-fill text-white flex items-center justify-center flex-none">
            🔒
          </span>
          <p className="text-[13px] leading-relaxed text-muted">{params.reason}</p>
        </div>
      )}

      <h1 className="text-[30px] font-extrabold tracking-[-0.03em] leading-tight">
        {l(lang, "Welcome back", "Selamat datang kembali")}
      </h1>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
        {l(
          lang,
          "Sign in to book, post and message Shana.",
          "Masuk untuk memesan, mengunggah dan chat Shana."
        )}
      </p>

      {params.error && (
        <p className="mt-4 text-[13px] font-semibold text-[#b23a3a]">{params.error}</p>
      )}

      <form action={loginAction} className="flex flex-col gap-4 mt-5.5">
        <input type="hidden" name="next" value={next} />
        <div className="glass-card p-[18px] flex flex-col gap-3.5">
          <Label label="Email">
            <Input name="email" type="email" placeholder="aruna@studio.co" required />
          </Label>
          <Label label={l(lang, "Password", "Kata sandi")}>
            <Input name="password" type="password" placeholder="••••••••" required />
          </Label>
        </div>
        <button
          type="submit"
          className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
        >
          {l(lang, "Sign in", "Masuk")}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[#9c8975] text-[11.5px] my-4">
        <span className="flex-1 h-px bg-line-2" />
        {l(lang, "or", "atau")}
        <span className="flex-1 h-px bg-line-2" />
      </div>

      <form action={demoArtistLoginAction}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="w-full h-[50px] rounded-2xl text-ink text-[14.5px] font-bold cursor-pointer glass-light"
        >
          {l(lang, "Sign in as the artist", "Masuk sebagai artist")}
        </button>
      </form>

      <Link
        href={`/register?next=${encodeURIComponent(next)}`}
        className="mt-3 flex items-center justify-center h-11 text-maroon text-[13.5px] font-bold"
      >
        {l(lang, "No account yet? Register", "Belum punya akun? Daftar")}
      </Link>

      <div className="glass-card p-4 mt-6 text-[12px] leading-relaxed text-muted">
        <strong className="text-ink">{l(lang, "Demo accounts", "Akun demo")}</strong>
        <div className="mt-1.5">Client — aruna@studio.co / aruna2026</div>
        <div>Artist — shana@shanamakeup.id / shana2026</div>
      </div>
    </AuthShell>
  );
}
