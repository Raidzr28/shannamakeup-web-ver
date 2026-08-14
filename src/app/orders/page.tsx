import Link from "next/link";
import { redirect } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { l, idr } from "@/lib/i18n";

export default async function OrdersPage() {
  const [lang, user] = await Promise.all([
    getLanguage(),
    getCurrentUser(),
  ]);

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent("/orders")}&reason=${encodeURIComponent(
        "Orders live in your account. Sign in to see the ones you have placed."
      )}`
    );
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { look: true, review: true },
  });

  const list = (
    <div className="flex flex-col gap-3">
      {bookings.length === 0 && (
        <div className="glass-card p-6 text-center">
          <p className="text-[13.5px] text-muted leading-relaxed">
            {l(
              lang,
              "No bookings yet. Pick a look and hold a date.",
              "Belum ada pesanan. Pilih tampilan dan kunci tanggal."
            )}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-11 px-5 rounded-2xl text-white text-sm font-bold items-center glass-fill"
          >
            {l(lang, "Browse looks", "Lihat tampilan")}
          </Link>
        </div>
      )}
      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/orders/${b.id}`}
          className="glass-card p-[18px] flex gap-3.5 items-center"
        >
          <span className="w-16 h-16 flex-none">
            <Media
              src={b.look.heroImage}
              alt={b.look.title}
              placeholder={l(lang, b.look.title, b.look.titleId).slice(0, 1)}
              className="w-16 h-16"
            />
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-2 justify-between">
              <span className="font-bold text-[15px]">
                {l(lang, b.look.title, b.look.titleId)}
              </span>
              <span
                className={`flex-none text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                  b.status === "confirmed" ? "bg-maroon text-white" : "bg-[#efe4d5] text-muted-2"
                }`}
              >
                {b.review
                  ? l(lang, "Reviewed", "Diulas")
                  : l(lang, "Confirmed", "Terkonfirmasi")}
              </span>
            </span>
            <span className="block text-[11.5px] text-muted-2 mt-1.5">
              {b.date.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              · {b.timeLabel} · {b.code}
            </span>
            <span className="block font-extrabold text-[13.5px] text-maroon mt-1">
              {idr(b.totalIdr)}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <MobileOnly>
      <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
        <div className="px-5 pt-2 text-center font-bold text-[15.5px]">
          {l(lang, "My orders", "Pesanan saya")}
        </div>
        <div className="px-5 pt-4.5">{list}</div>
        <div className="flex-1 min-h-6" />
        <TabBar lang={lang} />
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <h1 className="text-4xl font-extrabold tracking-tight mb-7">
        {l(lang, "My orders", "Pesanan saya")}
      </h1>
      <div className="max-w-[720px] pb-24">{list}</div>
    </div>
      </DesktopOnly>
    </>
  );
}
