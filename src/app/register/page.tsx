import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Label } from "@/components/ui/Field";
import { getLanguage } from "@/lib/language";
import { getSession } from "@/lib/auth";
import { l } from "@/lib/i18n";
import { registerAction } from "@/lib/actions/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [lang, session, params] = await Promise.all([
    getLanguage(),
    getSession(),
    searchParams,
  ]);
  if (session) redirect(params.next ?? "/");

  const next = params.next ?? "/";

  return (
    <AuthShell back={`/login?next=${encodeURIComponent(next)}`}>
      <h1 className="text-[30px] font-extrabold tracking-[-0.03em] leading-tight">
        {l(lang, "Create your account", "Buat akunmu")}
      </h1>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
        {l(
          lang,
          "Three fields and you can post, book and chat.",
          "Tiga kolom dan kamu bisa unggah, pesan dan chat."
        )}
      </p>

      {params.error && (
        <p className="mt-4 text-[13px] font-semibold text-[#b23a3a]">{params.error}</p>
      )}

      <form action={registerAction} className="flex flex-col gap-4 mt-5.5">
        <input type="hidden" name="next" value={next} />
        <div className="glass-card p-[18px] flex flex-col gap-3.5">
          <Label label={l(lang, "Full name", "Nama lengkap")}>
            <Input name="name" placeholder="Aruna Prameswari" required />
          </Label>
          <Label label="Email">
            <Input name="email" type="email" placeholder="aruna@studio.co" required />
          </Label>
          <Label label={l(lang, "Password", "Kata sandi")}>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </Label>
        </div>
        <button
          type="submit"
          className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
        >
          {l(lang, "Register", "Daftar")}
        </button>
      </form>

      <p className="mt-4 text-[11.5px] leading-relaxed text-[#8a998f]">
        {l(
          lang,
          "By registering you agree to the booking terms and the deposit policy.",
          "Dengan mendaftar kamu setuju pada ketentuan pemesanan dan kebijakan deposit."
        )}
      </p>

      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="mt-2 flex items-center justify-center h-11 text-green text-[13.5px] font-bold"
      >
        {l(lang, "Already have an account? Sign in", "Sudah punya akun? Masuk")}
      </Link>
    </AuthShell>
  );
}
