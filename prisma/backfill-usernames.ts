/** One-off backfill for accounts created before the username column existed.
 *
 * Safe to re-run: it only touches rows where username is still null. Run with
 *   npx dotenv -e .env.local -- npx tsx prisma/backfill-usernames.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MIN = 3;
const MAX = 20;

function slugify(base: string) {
  const slug = base
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    .replace(/^[._]+/, "")
    .slice(0, MAX);
  return slug.length >= MIN ? slug : `${slug}user`.slice(0, MAX);
}

async function main() {
  const pending = await prisma.user.findMany({
    where: { username: null },
    select: { id: true, name: true, email: true },
  });

  if (!pending.length) {
    console.log("nothing to backfill — every user already has a username");
    return;
  }

  for (const user of pending) {
    const root = slugify(user.name || user.email.split("@")[0]);
    let username = root;
    for (let n = 2; ; n++) {
      const clash = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (!clash) break;
      username = `${root}${n}`.slice(0, MAX);
    }
    await prisma.user.update({ where: { id: user.id }, data: { username } });
    console.log(`${user.email} -> @${username}`);
  }

  const left = await prisma.user.count({ where: { username: null } });
  console.log(`backfilled ${pending.length}; still null: ${left}`);
}

main().finally(() => prisma.$disconnect());
