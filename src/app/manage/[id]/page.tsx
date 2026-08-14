import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { PackageForm } from "@/components/manage/PackageForm";
import { getLanguage } from "@/lib/language";
import { getLook } from "@/lib/looks";
import { requireArtistPage } from "@/lib/require-artist";
import { l } from "@/lib/i18n";
import { updatePackageAction } from "@/lib/actions/packages";

export default async function EditPackagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  await requireArtistPage(`/manage/${id}`);
  const [lang, look, sp] = await Promise.all([
    getLanguage(),
    getLook(id),
    searchParams,
  ]);
  if (!look) notFound();

  const heading = l(lang, "Edit package", "Ubah paket");
  const form = (
    <PackageForm
      lang={lang}
      look={look}
      action={updatePackageAction}
      error={sp.error}
    />
  );

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2 flex items-center gap-3">
            <Link
              href="/manage"
              className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
            >
              ←
            </Link>
            <h1 className="font-extrabold text-[19px] tracking-tight truncate">
              {l(lang, look.title, look.titleId)}
            </h1>
          </div>
          <div className="px-5 pt-4">{form}</div>
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <Link href="/manage" className="text-[13px] font-semibold text-muted">
            ← {l(lang, "Back to packages", "Kembali ke paket")}
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mt-4">{heading}</h1>
          <p className="text-sm text-muted mt-2">{l(lang, look.title, look.titleId)}</p>
          <div className="max-w-[620px] mt-7">{form}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
