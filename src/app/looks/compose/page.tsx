import Link from "next/link";
import { redirect } from "next/navigation";
import { ComposeForm } from "@/components/looks/ComposeForm";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { getLooks } from "@/lib/looks";
import { l } from "@/lib/i18n";

export default async function ComposePage() {
  const [lang, user] = await Promise.all([
    getLanguage(),
    getCurrentUser(),
  ]);

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent("/looks/compose")}&reason=${encodeURIComponent(
        "Posting to Looks needs an account — your photos are credited to you."
      )}`
    );
  }

  const looks = await getLooks();

  return (
    <>
      <MobileOnly>
      <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
        <div className="px-5 pt-2 flex items-center gap-3">
          <Link
            href="/looks"
            className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
          >
            ←
          </Link>
          <div className="flex-1 text-center font-bold text-[15.5px]">
            {l(lang, "New post", "Unggahan baru")}
          </div>
          <span className="w-[38px]" />
        </div>
        <div className="px-5 py-4 pb-10">
          <ComposeForm lang={lang} looks={looks} />
        </div>
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <Link href="/looks" className="text-[13px] font-semibold text-muted">
        ← {l(lang, "Back to Looks", "Kembali ke Looks")}
      </Link>
      <h1 className="text-4xl font-extrabold tracking-tight mt-4 mb-7">
        {l(lang, "New post", "Unggahan baru")}
      </h1>
      <div className="max-w-[620px] pb-24">
        <ComposeForm lang={lang} looks={looks} />
      </div>
    </div>
      </DesktopOnly>
    </>
  );
}
