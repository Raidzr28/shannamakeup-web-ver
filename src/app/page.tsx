import { getLanguage } from "@/lib/language";
import { getLooks } from "@/lib/looks";
import { getCurrentUser } from "@/lib/auth";
import { getAdminStats, getPendingBookings, getNextConfirmed } from "@/lib/admin-stats";
import { MobileHome } from "@/components/home/MobileHome";
import { DesktopHome } from "@/components/home/DesktopHome";
import { StudioDashboard } from "@/components/manage/StudioDashboard";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { l } from "@/lib/i18n";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const [lang, params, user] = await Promise.all([
    getLanguage(),
    searchParams,
    getCurrentUser(),
  ]);

  const isArtist = user?.role === "ARTIST";

  /* Shana's home is her studio, not the sales page. She is not shopping for a
     package, and the one screen she opens most should be the one that tells
     her what is waiting. The client-facing home is still reachable at /studio
     and through the public links. */
  if (isArtist) {
    const [stats, pending, next] = await Promise.all([
      getAdminStats(),
      getPendingBookings(),
      getNextConfirmed(),
    ]);

    const heading = l(lang, "Studio", "Studio");
    const sub = l(
      lang,
      `${user.name.split(" ")[0]} — everything waiting on you, in one place.`,
      `${user.name.split(" ")[0]} — semua yang menunggumu, dalam satu tempat.`
    );
    const dashboard = (
      <StudioDashboard lang={lang} stats={stats} pending={pending} next={next} />
    );

    return (
      <>
        <MobileOnly>
          <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
            <div className="px-5 pt-2">
              <h1 className="font-extrabold text-[22px] tracking-tight">{heading}</h1>
              <p className="text-xs text-muted-3 mt-1.5 leading-snug">{sub}</p>
            </div>
            <div className="px-5 pt-4.5">{dashboard}</div>
            <div className="flex-1 min-h-6" />
            <TabBar lang={lang} />
          </div>
        </MobileOnly>

        <DesktopOnly>
          <div className="ambient-glow flex-1 px-11 py-11">
            <h1 className="text-4xl font-extrabold tracking-tight">{heading}</h1>
            <p className="text-sm text-muted mt-3 max-w-[60ch]">{sub}</p>
            <div className="max-w-[760px] mt-8 pb-24">{dashboard}</div>
          </div>
        </DesktopOnly>
      </>
    );
  }

  const allLooks = await getLooks();
  const category = params.cat && params.cat !== "All" ? params.cat : "All";
  const looks =
    category === "All" ? allLooks : allLooks.filter((k) => k.category === category);
  const featured = allLooks.find((k) => k.id === "akad") ?? allLooks[0];
  const waitingChats = 0;

  return (
    <>
      <MobileOnly>
        <MobileHome
          lang={lang}
          looks={looks}
          category={category}
          viewer={user && { name: user.name, avatarUrl: user.avatarUrl }}
          chatHref="/chat"
          isArtist={false}
          waitingChats={waitingChats}
        />
      </MobileOnly>
      <DesktopOnly>
        <DesktopHome
          lang={lang}
          looks={looks}
          category={category}
          featured={featured}
          chatHref="/chat"
        />
      </DesktopOnly>
    </>
  );
}
