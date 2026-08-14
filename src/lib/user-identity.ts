import "server-only";
import { prisma } from "./prisma";
import { slugifyUsername, validateUsername } from "./username";

/** Derives a free handle from a name or email, for paths that assign one rather
 * than ask for one (registration, the seed, the backfill).
 *
 * Appends a counter until the handle is free. The loop is bounded because an
 * unbounded one would spin forever against a unique-index failure we could not
 * fix by trying harder; the random tail is the escape hatch. */
export async function reserveUsername(base: string) {
  const root = slugifyUsername(base);
  const candidates = [root, ...Array.from({ length: 20 }, (_, i) => `${root}${i + 2}`)];

  for (const candidate of candidates) {
    if (validateUsername(candidate)) continue;
    const taken = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }

  return `${root.slice(0, 12)}${Math.random().toString(36).slice(2, 8)}`;
}
