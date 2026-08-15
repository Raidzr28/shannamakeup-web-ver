import Link from "next/link";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { PackageForm } from "@/components/manage/PackageForm";
import { getLanguage } from "@/lib/language";
import { requireArtistPage } from "@/lib/require-artist";
import { l } from "@/lib/i18n";
import { createPackageAction } from "@/lib/actions/packages";

export default async function NewPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireArtistPage("/manage/new");
  const [lang, params] = await Promise.all([getLanguage(), searchParams]);

  const heading = l(lang, "New package", "Paket baru");
  const form = (
    <PackageForm lang={lang} action={createPackageAction} error={params.error} />
  );

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2 flex items-center gap-3">
            <Link
              href="/manage/packages"
              className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
            >
              ←
            </Link>
            <h1 className="font-extrabold text-[19px] tracking-tight">{heading}</h1>
          </div>
          <div className="px-5 pt-4">{form}</div>
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <Link href="/manage/packages" className="text-[13px] font-semibold text-muted">
            ← {l(lang, "Back to packages", "Kembali ke paket")}
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mt-4 mb-7">{heading}</h1>
          <div className="max-w-[620px]">{form}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
