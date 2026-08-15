import "server-only";
import { prisma } from "./prisma";
import type { GoogleIdentity } from "./google-oauth";
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

/** The account behind a verified Google identity, creating it on first use.
 *
 * Three cases, in order:
 *
 * 1. Known `googleId` — the returning case, and the only match that survives
 *    the user changing their Google address.
 * 2. Same email, no link yet — the account is adopted rather than refused, so
 *    someone who registered with a password can start using the Google button
 *    without ending up with two accounts and a split booking history. This is
 *    only sound because the caller has already required `email_verified`: on a
 *    provider that hands out unverified addresses the same code would let
 *    anyone take over an account by typing its address into a profile.
 * 3. Neither — a new account.
 *
 * The role is pinned to CLIENT on creation and never read from Google. ARTIST
 * is granted in the database, so no external provider can hand out the account
 * that runs the studio. An existing artist linking their Google account keeps
 * their role: this only ever writes `role` on a row it just created. */
export async function findOrCreateGoogleUser(identity: GoogleIdentity) {
  const linked = await prisma.user.findUnique({ where: { googleId: identity.sub } });
  if (linked) return linked;

  const byEmail = await prisma.user.findUnique({ where: { email: identity.email } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleId: identity.sub,
        // Fills a gap only. Overwriting would replace a photo the user chose
        // here with their Google one on every sign-in.
        avatarUrl: byEmail.avatarUrl ?? identity.picture,
      },
    });
  }

  const username = await reserveUsername(identity.name || identity.email.split("@")[0]);

  try {
    return await prisma.user.create({
      data: {
        name: identity.name,
        email: identity.email,
        googleId: identity.sub,
        // No passwordHash. The account has no password until it sets one from
        // /account/edit, and the password sign-in path refuses it until then.
        role: "CLIENT",
        avatarUrl: identity.picture,
        username,
      },
    });
  } catch {
    // Two sign-ins for a brand-new account can both get past the lookups
    // above; the unique index on email decides it and the loser re-reads the
    // row the winner wrote rather than failing the sign-in.
    const existing = await prisma.user.findUnique({ where: { email: identity.email } });
    if (existing) return existing;
    throw new Error("Could not create an account for that Google profile.");
  }
}
