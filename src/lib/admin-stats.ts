import "server-only";
import { prisma } from "./prisma";
import { getWaitingChatCount } from "./inbox";
import { dayKey } from "./booking-time";

export type AdminStats = {
  /** Bookings sitting on the artist: new requests plus receipts to check. */
  requests: number;
  paymentsToCheck: number;
  waitingChats: number;
  /** Confirmed bookings whose event has not happened yet. */
  upcoming: number;
  /** Deposits actually received — money in hand, not billed. */
  depositsHeld: number;
  /** Contract value of everything confirmed. */
  confirmedValue: number;
  /** Confirmed bookings with an event date inside the current month. */
  monthBookings: number;
  monthValue: number;
  clients: number;
  reviewCount: number;
  avgRating: number | null;
  /** Days carrying more than one live booking, which the one-a-day rule
   * says should never happen. Surfaced here because nothing else would. */
  doubleBookedDays: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [byStatus, upcoming, monthRows, clients, reviews, waitingChats, liveDates] =
    await Promise.all([
      prisma.booking.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { totalIdr: true, depositIdr: true },
      }),
      prisma.booking.count({
        where: { status: "confirmed", date: { gte: now } },
      }),
      prisma.booking.aggregate({
        where: {
          status: "confirmed",
          date: { gte: monthStart, lt: monthEnd },
        },
        _count: { _all: true },
        _sum: { totalIdr: true },
      }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.review.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
      getWaitingChatCount(),
      prisma.booking.findMany({
        where: { status: { not: "declined" } },
        select: { date: true },
      }),
    ]);

  const countOf = (status: string) =>
    byStatus.find((row) => row.status === status)?._count._all ?? 0;
  const confirmed = byStatus.find((row) => row.status === "confirmed");

  const perDay = new Map<string, number>();
  for (const row of liveDates) {
    const key = dayKey(row.date);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  return {
    requests: countOf("requested"),
    paymentsToCheck: countOf("payment_review"),
    waitingChats,
    upcoming,
    depositsHeld: confirmed?._sum.depositIdr ?? 0,
    confirmedValue: confirmed?._sum.totalIdr ?? 0,
    monthBookings: monthRows._count._all,
    monthValue: monthRows._sum.totalIdr ?? 0,
    clients,
    reviewCount: reviews._count._all,
    avgRating: reviews._avg.rating,
    doubleBookedDays: [...perDay.values()].filter((n) => n > 1).length,
  };
}

/** The queue itself, oldest first — the person who has waited longest is the
 * one to answer next. */
export async function getPendingBookings(take = 4) {
  return prisma.booking.findMany({
    where: { status: { in: ["requested", "payment_review"] } },
    orderBy: { createdAt: "asc" },
    include: { look: true },
    take,
  });
}

/** The next confirmed job, so the dashboard opens on what is actually next. */
export async function getNextConfirmed() {
  return prisma.booking.findFirst({
    where: { status: "confirmed", date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { look: true },
  });
}
