import Link from "next/link";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { requireArtistPage } from "@/lib/require-artist";
import { getKnowledge } from "@/lib/knowledge";
import { geminiModel, geminiStatus } from "@/lib/gemini";
import { GEMINI_SECRET, secretMeta } from "@/lib/secret-store";
import { locale } from "@/lib/booking-time";
import { l } from "@/lib/i18n";
import {
  createKnowledgeAction,
  updateKnowledgeAction,
  toggleKnowledgeAction,
  deleteKnowledgeAction,
  moveKnowledgeUpAction,
} from "@/lib/actions/knowledge";
import { setGeminiKeyAction, clearGeminiKeyAction } from "@/lib/actions/secrets";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireArtistPage("/manage/knowledge");
  const [lang, entries, source, keyMeta, params] = await Promise.all([
    getLanguage(),
    getKnowledge(),
    geminiStatus(),
    secretMeta(GEMINI_SECRET),
    searchParams,
  ]);

  const live = source !== "none";
  const enabledCount = entries.filter((e) => e.enabled).length;

  const field =
    "w-full box-border rounded-2xl border-[1.5px] border-line-2 bg-white px-3.5 text-sm text-ink outline-none focus:border-maroon";

  const notice = (params.saved || params.error) && (
    <p
      role="alert"
      className={`m-0 text-[13px] leading-snug rounded-2xl px-3.5 py-3 border ${
        params.error
          ? "text-[#b23a3a] bg-[#f8e8e2] border-[#b23a3a]/25"
          : "text-[#3f6b45] bg-[#e3ece2] border-[#3f6b45]/25"
      }`}
    >
      {params.error ?? params.saved}
    </p>
  );

  const keyCard = (
    <form
      action={setGeminiKeyAction}
      className="glass-card p-[18px] flex flex-col gap-3"
    >
      <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
        {l(lang, "API key", "Kunci API")}
      </div>
      <p className="m-0 text-[12.5px] leading-relaxed text-muted">
        {keyMeta
          ? l(
              lang,
              `A key ending ····${keyMeta.hint} is saved, encrypted. Paste a new one to replace it.`,
              `Kunci berakhiran ····${keyMeta.hint} tersimpan, terenkripsi. Tempel yang baru untuk menggantinya.`
            )
          : source === "env"
            ? l(
                lang,
                "Currently using the key from the project environment. Saving one here replaces it.",
                "Saat ini memakai kunci dari environment proyek. Menyimpan di sini akan menggantikannya."
              )
            : l(
                lang,
                "Paste your Google AI Studio key. It is encrypted before it is stored and never shown again.",
                "Tempel kunci Google AI Studio-mu. Kunci dienkripsi sebelum disimpan dan tidak ditampilkan lagi."
              )}
      </p>
      <input
        name="apiKey"
        type="password"
        autoComplete="off"
        placeholder={l(lang, "Paste the API key", "Tempel kunci API")}
        className={`${field} h-[46px]`}
      />
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder={l(
          lang,
          "Your password, to confirm",
          "Kata sandimu, untuk konfirmasi"
        )}
        className={`${field} h-[46px]`}
      />
      <SubmitButton
        pendingLabel={l(lang, "Saving…", "Menyimpan…")}
        className="w-full h-[50px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
      >
        {l(lang, "Save API key", "Simpan kunci API")}
      </SubmitButton>
      <p className="m-0 text-[11.5px] leading-snug text-muted-3">
        {l(
          lang,
          "Your password is asked every time, so a logged-in tab left open is not enough to change the key.",
          "Kata sandi diminta setiap kali, jadi tab yang tertinggal terbuka tidak cukup untuk mengganti kunci."
        )}
      </p>
    </form>
  );

  const clearCard = keyMeta && (
    <form
      action={clearGeminiKeyAction}
      className="glass-card p-[18px] flex flex-col gap-2.5"
    >
      <p className="m-0 text-[12.5px] leading-snug text-muted">
        {l(
          lang,
          "Removing the key switches the assistant off. Clients keep chatting and get the scripted replies.",
          "Menghapus kunci mematikan asisten. Klien tetap bisa chat dan menerima balasan naskah."
        )}
      </p>
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder={l(lang, "Your password, to confirm", "Kata sandimu, untuk konfirmasi")}
        className={`${field} h-[46px]`}
      />
      <SubmitButton
        pendingLabel={l(lang, "Removing…", "Menghapus…")}
        className="w-full h-[46px] rounded-2xl text-[14px] font-bold cursor-pointer text-[#b23a3a] glass-light border-[#b23a3a]/30"
      >
        {l(lang, "Remove API key", "Hapus kunci API")}
      </SubmitButton>
    </form>
  );

  const body = (
    <div className="flex flex-col gap-4">
      {notice}
      <div
        className={`glass-card p-[18px] flex flex-col gap-2 ${
          live ? "" : "border-[1.5px] border-[#8a6320]/35"
        }`}
      >
        <div className="flex items-center gap-2 justify-between">
          <span className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "Assistant", "Asisten")}
          </span>
          <span
            className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
              live ? "bg-maroon text-white" : "bg-[#f7e6cf] text-[#8a6320]"
            }`}
          >
            {live ? l(lang, "Connected", "Terhubung") : l(lang, "Not connected", "Belum terhubung")}
          </span>
        </div>
        <p className="m-0 text-[12.5px] leading-relaxed text-muted">
          {live
            ? l(
                lang,
                `Answering clients with ${geminiModel()}, using the ${enabledCount} published notes below plus your live package prices. Key source: ${
                  source === "app" ? "saved in the app" : "project environment"
                }.`,
                `Menjawab klien dengan ${geminiModel()}, memakai ${enabledCount} catatan aktif di bawah plus harga paket terkini. Sumber kunci: ${
                  source === "app" ? "tersimpan di aplikasi" : "environment proyek"
                }.`
              )
            : l(
                lang,
                "Paste an API key below to switch the assistant on. Until then clients get the short scripted replies, and these notes are saved and ready.",
                "Tempel kunci API di bawah untuk mengaktifkan asisten. Sampai itu klien menerima balasan naskah singkat, dan catatan ini tersimpan siap dipakai."
              )}
        </p>
        <p className="m-0 text-[11.5px] leading-snug text-muted-3">
          {l(
            lang,
            "Package names and prices are read from Manage packages automatically — you do not need to repeat them here.",
            "Nama dan harga paket dibaca otomatis dari Kelola paket — tidak perlu ditulis ulang di sini."
          )}
        </p>
      </div>

      {keyCard}
      {clearCard}

      <form action={createKnowledgeAction} className="glass-card p-[18px] flex flex-col gap-3">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Add a note", "Tambah catatan")}
        </div>
        <input
          name="title"
          maxLength={120}
          required
          placeholder={l(lang, "Travel outside Jakarta", "Perjalanan ke luar Jakarta")}
          className={`${field} h-[46px]`}
        />
        <textarea
          name="body"
          rows={4}
          maxLength={4000}
          required
          placeholder={l(
            lang,
            "Transport is charged at cost beyond Jakarta, and Shana arrives the night before.",
            "Transport di luar Jakarta sesuai biaya, dan Shana datang malam sebelumnya."
          )}
          className={`${field} py-3 resize-y`}
        />
        <SubmitButton
          pendingLabel={l(lang, "Saving…", "Menyimpan…")}
          className="w-full h-[50px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
        >
          {l(lang, "Save note", "Simpan catatan")}
        </SubmitButton>
      </form>

      {entries.length === 0 && (
        <div className="glass-card p-6 text-center">
          <p className="m-0 text-[13.5px] text-muted leading-relaxed">
            {l(
              lang,
              "No notes yet. Add the things clients ask you over and over.",
              "Belum ada catatan. Tambahkan hal yang sering ditanyakan klien."
            )}
          </p>
        </div>
      )}

      {entries.map((entry, i) => (
        <div
          key={entry.id}
          className={`glass-card p-[18px] flex flex-col gap-3 ${
            entry.enabled ? "" : "opacity-70"
          }`}
        >
          <form action={updateKnowledgeAction} className="flex flex-col gap-2.5">
            <input type="hidden" name="id" value={entry.id} />
            <div className="flex items-center gap-2 justify-between">
              <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-tint text-maroon">
                {entry.enabled
                  ? l(lang, "Published", "Aktif")
                  : l(lang, "Draft", "Nonaktif")}
              </span>
              <span className="text-[10.5px] text-muted-3">
                {l(lang, "updated", "diperbarui")}{" "}
                {entry.updatedAt.toLocaleDateString(locale(lang), {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <input
              name="title"
              defaultValue={entry.title}
              maxLength={120}
              required
              className={`${field} h-[46px] font-bold`}
            />
            <textarea
              name="body"
              defaultValue={entry.body}
              rows={4}
              maxLength={4000}
              required
              className={`${field} py-3 resize-y`}
            />
            <SubmitButton
              pendingLabel={l(lang, "Saving…", "Menyimpan…")}
              className="w-full h-[42px] rounded-2xl text-[13.5px] font-bold cursor-pointer text-ink glass-light"
            >
              {l(lang, "Save changes", "Simpan perubahan")}
            </SubmitButton>
          </form>

          <div className="flex gap-2 border-t border-line pt-2.5">
            {i > 0 && (
              <form action={moveKnowledgeUpAction} className="flex-none">
                <input type="hidden" name="id" value={entry.id} />
                <SubmitButton
                  aria-label={l(lang, "Move up", "Naikkan")}
                  className="w-[42px] h-[38px] rounded-xl text-[13px] font-bold cursor-pointer text-ink glass-light"
                >
                  ↑
                </SubmitButton>
              </form>
            )}
            <form action={toggleKnowledgeAction} className="flex-1">
              <input type="hidden" name="id" value={entry.id} />
              <SubmitButton
                className="w-full h-[38px] rounded-xl text-[12.5px] font-bold cursor-pointer text-ink glass-light"
              >
                {entry.enabled
                  ? l(lang, "Unpublish", "Nonaktifkan")
                  : l(lang, "Publish", "Aktifkan")}
              </SubmitButton>
            </form>
            <form action={deleteKnowledgeAction} className="flex-1">
              <input type="hidden" name="id" value={entry.id} />
              <SubmitButton
                className="w-full h-[38px] rounded-xl text-[12.5px] font-bold cursor-pointer text-[#b23a3a] glass-light border-[#b23a3a]/30"
              >
                {l(lang, "Delete", "Hapus")}
              </SubmitButton>
            </form>
          </div>
        </div>
      ))}
    </div>
  );

  const heading = l(lang, "Knowledge base", "Basis pengetahuan");
  const sub = l(
    lang,
    "What the assistant is allowed to tell clients. It answers from these notes only, and says it will check with you when something is not here.",
    "Yang boleh disampaikan asisten ke klien. Ia hanya menjawab dari catatan ini, dan bilang akan menanyakanmu bila tidak ada di sini."
  );

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2 flex items-center gap-3">
            <Link
              href="/account"
              className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
            >
              ←
            </Link>
            <div className="flex-1 text-center font-bold text-[15.5px]">{heading}</div>
            <span className="w-[38px]" />
          </div>
          <div className="px-5 pt-2">
            <p className="text-xs text-muted-3 leading-snug">{sub}</p>
          </div>
          <div className="px-5 pt-4">{body}</div>
          <div className="flex-1 min-h-6" />
          <TabBar lang={lang} />
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <Link href="/account" className="text-[13px] font-semibold text-muted">
            ← {l(lang, "Back to profile", "Kembali ke profil")}
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mt-4">{heading}</h1>
          <p className="text-sm text-muted mt-3 max-w-[60ch]">{sub}</p>
          <div className="max-w-[680px] mt-8 pb-24">{body}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
