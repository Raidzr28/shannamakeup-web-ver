import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { l } from "@/lib/i18n";
import { logoutAction } from "@/lib/actions/auth";

const GUEST_LIMITS = [
  { en: "Browse the portfolio and the Looks feed", id: "Lihat portofolio dan feed Looks", ok: true },
  { en: "Check dates, prices and add-ons", id: "Cek tanggal, harga dan tambahan", ok: true },
  { en: "Like, save and post to Looks", id: "Suka, simpan dan unggah ke Looks", ok: false },
  { en: "Confirm a booking, chat, leave a review", id: "Konfirmasi pesanan, chat, tulis ulasan", ok: false },
];

export default async function AccountPage() {
  const [lang, user] = await Promise.all([
    getLanguage(),
    getCurrentUser(),
  ]);

  const [orderCount, postCount] = user
    ? await Promise.all([
        prisma.booking.count({ where: { userId: user.id } }),
        prisma.post.count({ where: { userId: user.id } }),
      ])
    : [0, 0];

  const body = (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-[18px] flex gap-3.5 items-center">
        <span className="w-16 h-16 flex-none">
          <Media
            src={user?.avatarUrl}
            alt={user?.name ?? "Guest"}
            placeholder={user ? user.name.slice(0, 1) : "?"}
            className="w-16 h-16"
          />
        </span>
        <span className="flex-1">
          <span className="block font-extrabold text-lg tracking-tight">
            {user?.name ?? l(lang, "Guest", "Tamu")}
          </span>
          <span className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-tint text-green">
              {user
                ? user.role === "ARTIST"
                  ? l(lang, "Artist · admin", "Artist · admin")
                  : l(lang, "Client", "Klien")
                : l(lang, "Guest", "Tamu")}
            </span>
            <span className="text-[11.5px] text-muted-3">
              {user?.email ?? l(lang, "Not signed in", "Belum masuk")}
            </span>
          </span>
        </span>
      </div>

      {!user && (
        <div className="glass-card p-[18px]">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "As a guest you can", "Sebagai tamu kamu bisa")}
          </div>
          <div className="flex flex-col gap-2 mt-3">
            {GUEST_LIMITS.map((x) => (
              <div key={x.en} className="flex gap-2.5 items-center text-[13px] text-[#3d4a43]">
                <span
                  className={`w-[22px] h-[22px] rounded-full flex-none flex items-center justify-center text-[10.5px] font-extrabold ${
                    x.ok ? "bg-tint text-green" : "bg-[#f1eeee] text-[#a06a6a]"
                  }`}
                >
                  {x.ok ? "✓" : "🔒"}
                </span>
                {l(lang, x.en, x.id)}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 mt-4.5">
            <Link
              href="/login?next=/account"
              className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center glass-fill"
            >
              {l(lang, "Sign in", "Masuk")}
            </Link>
            <Link
              href="/register?next=/account"
              className="w-full h-[50px] rounded-2xl text-ink text-[14.5px] font-bold flex items-center justify-center glass-light"
            >
              {l(lang, "Create an account", "Buat akun")}
            </Link>
          </div>
        </div>
      )}

      {user && (
        <>
          <div className="glass-card p-1.5">
            {[
              { name: l(lang, "My orders", "Pesanan saya"), meta: String(orderCount), href: "/orders" },
              { name: l(lang, "My posts", "Unggahanku"), meta: String(postCount), href: "/looks" },
              { name: l(lang, "Chat with Shana", "Chat dengan Shana"), meta: "", href: "/chat" },
            ].map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="flex items-center gap-2.5 w-full p-3.5 rounded-2xl text-sm font-semibold text-ink"
              >
                <span className="flex-1">{m.name}</span>
                <span className="text-xs text-[#8a998f]">{m.meta}</span>
              </Link>
            ))}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full h-[50px] rounded-2xl text-[14.5px] font-bold cursor-pointer text-[#b23a3a] glass-light border-[#b23a3a]/30"
            >
              {l(lang, "Log out", "Keluar")}
            </button>
          </form>
        </>
      )}

      <div className="glass-card p-[18px] flex flex-col gap-3">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Preferences", "Preferensi")}
        </div>
        <div className="flex items-center gap-3 justify-between">
          <span className="text-[13px] text-muted">{l(lang, "Language", "Bahasa")}</span>
          <LanguageSwitcher lang={lang} />
        </div>
        <p className="text-[11.5px] leading-snug text-muted-2">
          {l(
            lang,
            "The phone app and the desktop site switch automatically with your window width.",
            "Aplikasi ponsel dan situs desktop berganti otomatis mengikuti lebar jendelamu."
          )}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <MobileOnly>
      <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
        <div className="px-5 pt-2 text-center font-bold text-[15.5px]">
          {l(lang, "Profile", "Profil")}
        </div>
        <div className="px-5 pt-5">{body}</div>
        <div className="flex-1 min-h-6" />
        <MobileTabBar lang={lang} />
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <h1 className="text-4xl font-extrabold tracking-tight mb-7">
        {l(lang, "Profile", "Profil")}
      </h1>
      <div className="max-w-[560px]">{body}</div>
    </div>
      </DesktopOnly>
    </>
  );
}
