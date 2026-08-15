import { redirect } from "next/navigation";
import { requireArtistPage } from "@/lib/require-artist";

/** The studio dashboard is the artist's Home now, so there is only ever one
 * of it. This route stays as a redirect because links, bookmarks and the
 * package actions still point here. */
export default async function ManagePage() {
  await requireArtistPage("/manage");
  redirect("/");
}
