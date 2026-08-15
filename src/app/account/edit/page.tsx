import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { slugifyUsername } from "@/lib/username";
import { l } from "@/lib/i18n";

export default async function EditProfilePage() {
  const [lang, user] = await Promise.all([getLanguage(), getCurrentUser()]);

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent("/account/edit")}&reason=${encodeURIComponent(
        "Sign in to edit your profile."
      )}`
    );
  }

  const profile = {
    name: user.name,
    // Rows predating the username column fall back to a derived handle, so the
    // field is never blank and the form's required check is satisfiable.
    username: user.username ?? slugifyUsername(user.email.split("@")[0]),
    bio: user.bio ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    avatarUrl: user.avatarUrl,
  };

  const body = (
    <div className="flex flex-col gap-4">
      <ProfileForm lang={lang} profile={profile} />
      <PasswordForm lang={lang} hasPassword={user.passwordHash !== null} />
    </div>
  );

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2 flex items-center gap-3">
            <Link
              href="/account"
              className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
            >
              ←
            </Link>
            <div className="flex-1 text-center font-bold text-[15.5px]">
              {l(lang, "Edit profile", "Ubah profil")}
            </div>
            <span className="w-[38px]" />
          </div>
          <div className="px-5 py-4 pb-10">{body}</div>
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <Link href="/account" className="text-[13px] font-semibold text-muted">
            ← {l(lang, "Back to profile", "Kembali ke profil")}
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mt-4 mb-7">
            {l(lang, "Edit profile", "Ubah profil")}
          </h1>
          <div className="max-w-[620px] pb-24">{body}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
