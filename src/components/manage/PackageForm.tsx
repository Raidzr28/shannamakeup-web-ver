import Link from "next/link";
import { ImagePicker } from "./ImagePicker";
import { Input, Textarea, Label } from "@/components/ui/Field";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import type { LookDTO } from "@/lib/looks";
import { SubmitButton } from "@/components/ui/SubmitButton";

/** Shared create/edit form. `look` absent means create. */
export function PackageForm({
  lang,
  look,
  action,
  error,
}: {
  lang: Lang;
  look?: LookDTO;
  action: (formData: FormData) => void;
  error?: string;
}) {
  const editing = !!look;

  return (
    <form action={action} className="flex flex-col gap-4 pb-10">
      {editing && <input type="hidden" name="id" value={look.id} />}

      {error && (
        <p
          role="alert"
          className="text-[13px] leading-snug text-[var(--paes-alarm)] bg-[var(--paes-ground-2)] border border-[var(--paes-alarm)]/25 rounded-2xl px-3.5 py-3"
        >
          {error}
        </p>
      )}

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Name and category", "Nama dan kategori")}
        </div>
        <Label label={l(lang, "Title (English)", "Judul (Inggris)")}>
          <Input name="title" defaultValue={look?.title} placeholder="Akad Pagi" required />
        </Label>
        <Label label={l(lang, "Title (Bahasa Indonesia)", "Judul (Bahasa Indonesia)")}>
          <Input
            name="titleId"
            defaultValue={look?.titleId}
            placeholder={l(lang, "Leave blank to reuse the English title", "Kosongkan untuk memakai judul Inggris")}
          />
        </Label>
        <Label label={l(lang, "Category (English)", "Kategori (Inggris)")}>
          <Input
            name="category"
            defaultValue={look?.category}
            placeholder="Bridal"
            list="category-options"
            required
          />
        </Label>
        <datalist id="category-options">
          <option value="Bridal" />
          <option value="Editorial" />
          <option value="Traditional" />
          <option value="Everyday" />
        </datalist>
        <Label label={l(lang, "Category (Bahasa Indonesia)", "Kategori (Bahasa Indonesia)")}>
          <Input name="categoryId" defaultValue={look?.categoryId} placeholder="Pengantin" />
        </Label>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Price and length", "Harga dan durasi")}
        </div>
        <Label label={l(lang, "Price in rupiah", "Harga dalam rupiah")}>
          {/* step must stay "any": a numeric step is validated as
              min + (step x n), so `min={1} step={50000}` rejects every real
              rupiah price, 8500000 included. The action rounds server-side. */}
          <Input
            name="priceIdr"
            type="number"
            min={0}
            step="any"
            inputMode="numeric"
            defaultValue={look?.priceIdr}
            placeholder="8500000"
            required
          />
        </Label>
        <Label label={l(lang, "Session length", "Durasi sesi")}>
          <Input
            name="durationLabel"
            defaultValue={look?.durationLabel}
            placeholder="3 hr 30"
            required
          />
        </Label>
        <Label label={l(lang, "Sort order", "Urutan tampil")}>
          <Input name="order" type="number" defaultValue={look?.order ?? 0} />
        </Label>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Description", "Deskripsi")}
        </div>
        <Label label={l(lang, "Blurb (English)", "Deskripsi (Inggris)")}>
          <Textarea name="blurb" defaultValue={look?.blurb} />
        </Label>
        <Label label={l(lang, "Blurb (Bahasa Indonesia)", "Deskripsi (Bahasa Indonesia)")}>
          <Textarea name="blurbId" defaultValue={look?.blurbId} />
        </Label>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "What's included", "Yang termasuk")}
        </div>
        <p className="text-xs leading-snug text-muted-3">
          {l(lang, "One item per line.", "Satu item per baris.")}
        </p>
        <Label label={l(lang, "Included (English)", "Termasuk (Inggris)")}>
          <Textarea
            name="includes"
            defaultValue={look?.includes.join("\n")}
            placeholder={"Full skin prep\nHijab or hair styling"}
          />
        </Label>
        <Label label={l(lang, "Included (Bahasa Indonesia)", "Termasuk (Bahasa Indonesia)")}>
          <Textarea name="includesId" defaultValue={look?.includesId.join("\n")} />
        </Label>
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Photo", "Foto")}
        </div>
        <p className="text-xs leading-snug text-muted-3">
          {l(
            lang,
            "Drag a photo in or choose a file. Leave empty for a placeholder tile.",
            "Taruh foto atau pilih file. Kosongkan untuk memakai placeholder."
          )}
        </p>
        <ImagePicker name="heroImage" lang={lang} defaultUrl={look?.heroImage} />
      </div>

      <div className="flex gap-3">
        <SubmitButton
          className="flex-1 h-[52px] rounded-2xl text-[15px] font-bold cursor-pointer prada-leaf"
        >
          {editing
            ? l(lang, "Save changes", "Simpan perubahan")
            : l(lang, "Create package", "Buat paket")}
        </SubmitButton>
        <Link
          href="/manage/packages"
          className="h-[52px] px-6 rounded-2xl text-ink text-[14.5px] font-bold flex items-center justify-center glass-light"
        >
          {l(lang, "Cancel", "Batal")}
        </Link>
      </div>
    </form>
  );
}
