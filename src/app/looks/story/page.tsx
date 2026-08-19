import Link from "next/link";
import { redirect } from "next/navigation";
import { StoryForm } from "@/components/looks/StoryForm";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { l } from "@/lib/i18n";
import { BackIcon } from "@/components/ui/Icons";

export default async function StoryPage() {
  const [lang, user] = await Promise.all([getLanguage(), getCurrentUser()]);

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent("/looks/story")}&reason=${encodeURIComponent(
        "Stories are posted under your name, so they need an account."
      )}`
    );
  }

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2 flex items-center gap-3">
            <Link
              href="/looks"
              className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
            >
              <BackIcon className="w-[18px] h-[18px]" />
            </Link>
            <div className="flex-1 text-center font-bold text-[15.5px]">
              {l(lang, "New story", "Story baru")}
            </div>
            <span className="w-[38px]" />
          </div>
          <div className="px-5 py-4 pb-10">
            <StoryForm lang={lang} />
          </div>
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <Link href="/looks" className="text-[13px] font-semibold text-muted">
            <BackIcon className="w-4 h-4" /> {l(lang, "Back to Looks", "Kembali ke Looks")}
          </Link>
          <h1 className="text-4xl font-display mt-4 mb-7">
            {l(lang, "New story", "Story baru")}
          </h1>
          <div className="max-w-[620px] pb-24">
            <StoryForm lang={lang} />
          </div>
        </div>
      </DesktopOnly>
    </>
  );
}
