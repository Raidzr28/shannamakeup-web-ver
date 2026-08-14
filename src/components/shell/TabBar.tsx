import { getSession } from "@/lib/auth";
import { MobileTabBar } from "./MobileTabBar";
import type { Lang } from "@/lib/i18n";

/** Server wrapper so pages can drop in the tab bar without each one having to
 * load the session just to decide between the Book and Manage slots. */
export async function TabBar({ lang }: { lang: Lang }) {
  const session = await getSession();
  return <MobileTabBar lang={lang} isArtist={session?.role === "ARTIST"} />;
}
