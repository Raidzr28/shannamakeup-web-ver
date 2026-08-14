import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/** Page-level guard for the manage area. Mirrors the check inside every
 * package action, so a stale tab cannot render the editor after a role change. */
export async function requireArtistPage(next: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(next)}&reason=${encodeURIComponent(
        "Sign in as the artist to manage packages."
      )}`
    );
  }
  if (user.role !== "ARTIST") redirect("/");
  return user;
}
