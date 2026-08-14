import { getLanguage } from "@/lib/language";
import { getLooks } from "@/lib/looks";
import { MobileHome } from "@/components/home/MobileHome";
import { DesktopHome } from "@/components/home/DesktopHome";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const [lang, allLooks, params] = await Promise.all([
    getLanguage(),
    getLooks(),
    searchParams,
  ]);

  const category = params.cat && params.cat !== "All" ? params.cat : "All";
  const looks =
    category === "All" ? allLooks : allLooks.filter((k) => k.category === category);
  const featured = allLooks.find((k) => k.id === "akad") ?? allLooks[0];

  return (
    <>
      <MobileOnly>
        <MobileHome lang={lang} looks={looks} category={category} />
      </MobileOnly>
      <DesktopOnly>
        <DesktopHome
          lang={lang}
          looks={looks}
          category={category}
          featured={featured}
        />
      </DesktopOnly>
    </>
  );
}
