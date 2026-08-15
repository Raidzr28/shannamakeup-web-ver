import "server-only";
import { prisma } from "./prisma";
import { asBookingStatus } from "./booking-status";
import { CLIENT_AUTHOR } from "./chat";

export type InboxThread = {
  userId: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  pinned: boolean;
  archived: boolean;
  messageCount: number;
  lastAt: Date | null;
  lastText: string;
  lastFromClient: boolean;
  /** True while this client still has a booking that is going somewhere. */
  active: boolean;
  openBookings: number;
  /** The client has written since the artist last opened this thread. */
  waiting: boolean;
  lastClientAt: Date | null;
};

/** How many conversations are waiting on the artist.
 *
 * Deliberately a count of threads, not of messages: the question being
 * answered is "how many people am I leaving hanging", and a client who sent
 * five messages in a row is still one person waiting.
 *
 * Kept separate from getInboxThreads so the nav and the profile menu can show
 * a badge without assembling the whole inbox on every page. */
export async function getWaitingChatCount(): Promise<number> {
  const [clientLatest, threads] = await Promise.all([
    prisma.message.groupBy({
      by: ["userId"],
      where: { who: CLIENT_AUTHOR },
      _max: { createdAt: true },
    }),
    prisma.chatThread.findMany({
      select: { userId: true, lastReadAt: true, archived: true },
    }),
  ]);

  const threadBy = new Map(threads.map((t) => [t.userId, t]));
  let waiting = 0;

  for (const row of clientLatest) {
    const thread = threadBy.get(row.userId);
    if (thread?.archived) continue;
    const lastClientAt = row._max.createdAt;
    if (!lastClientAt) continue;
    if (!thread?.lastReadAt || lastClientAt > thread.lastReadAt) waiting += 1;
  }

  return waiting;
}

/** A conversation sits at the top while the client has something running:
 * a request Shana has not answered, a deposit in flight, or a confirmed
 * booking whose event has not happened yet. Everything else — no bookings,
 * declined, or confirmed and already past — drops below. */
function isActive(
  bookings: { status: string; date: Date }[],
  now: Date
): { active: boolean; open: number } {
  let open = 0;
  for (const booking of bookings) {
    const status = asBookingStatus(booking.status);
    if (status === "declined") continue;
    if (status === "confirmed") {
      if (booking.date.getTime() >= now.getTime()) open += 1;
      continue;
    }
    // requested, accepted, payment_review are all mid-flight.
    open += 1;
  }
  return { active: open > 0, open };
}

export async function getInboxThreads(): Promise<InboxThread[]> {
  const grouped = await prisma.message.groupBy({
    by: ["userId"],
    _count: { _all: true },
    _max: { createdAt: true },
  });
  if (grouped.length === 0) return [];

  const userIds = grouped.map((g) => g.userId);
  const lastTimes = grouped
    .map((g) => g._max.createdAt)
    .filter((d): d is Date => d !== null);

  const [users, threads, bookings, lastMessages, clientLatest] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true, avatarUrl: true },
    }),
    prisma.chatThread.findMany({ where: { userId: { in: userIds } } }),
    prisma.booking.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, status: true, date: true },
    }),
    // Fetching exactly the newest row per client, rather than every message
    // and slicing in memory: the groupBy already told us each one's timestamp.
    prisma.message.findMany({
      where: { userId: { in: userIds }, createdAt: { in: lastTimes } },
      select: { userId: true, who: true, text: true, createdAt: true },
    }),
    // Newest client message per thread, which is what "waiting" compares
    // against — the assistant's own replies must not clear the flag.
    prisma.message.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, who: CLIENT_AUTHOR },
      _max: { createdAt: true },
    }),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const threadBy = new Map(threads.map((t) => [t.userId, t]));

  const bookingsBy = new Map<string, { status: string; date: Date }[]>();
  for (const b of bookings) {
    const list = bookingsBy.get(b.userId) ?? [];
    list.push(b);
    bookingsBy.set(b.userId, list);
  }

  const lastBy = new Map<string, (typeof lastMessages)[number]>();
  for (const m of lastMessages) {
    const held = lastBy.get(m.userId);
    if (!held || m.createdAt.getTime() > held.createdAt.getTime()) {
      lastBy.set(m.userId, m);
    }
  }

  const clientLatestBy = new Map(
    clientLatest.map((row) => [row.userId, row._max.createdAt])
  );

  const now = new Date();

  const rows = grouped.flatMap((group) => {
    const user = userById.get(group.userId);
    if (!user) return [];
    const thread = threadBy.get(group.userId);
    const last = lastBy.get(group.userId);
    const { active, open } = isActive(bookingsBy.get(group.userId) ?? [], now);
    const lastClientAt = clientLatestBy.get(group.userId) ?? null;
    const waiting = Boolean(
      lastClientAt && (!thread?.lastReadAt || lastClientAt > thread.lastReadAt)
    );

    return [
      {
        userId: group.userId,
        name: user.name,
        handle: user.username ?? user.name,
        avatarUrl: user.avatarUrl,
        pinned: thread?.pinned ?? false,
        archived: thread?.archived ?? false,
        messageCount: group._count._all,
        lastAt: group._max.createdAt,
        lastText: last?.text ?? "",
        lastFromClient: last?.who === CLIENT_AUTHOR,
        active,
        openBookings: open,
        waiting,
        lastClientAt,
      } satisfies InboxThread,
    ];
  });

  // Pinned first, then anyone actually waiting on a reply, then in-progress
  // bookings, then newest activity. Waiting outranks in-progress because a
  // finished booking whose client just asked something still needs an answer.
  return rows.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.waiting !== b.waiting) return a.waiting ? -1 : 1;
    if (a.active !== b.active) return a.active ? -1 : 1;
    return (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0);
  });
}
