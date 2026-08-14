"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Input, Textarea, Label } from "@/components/ui/Field";
import { Radio, Check } from "@/components/ui/Option";
import { createBookingAction } from "@/lib/actions/booking";
import type { Lang } from "@/lib/i18n";
import { l, idr } from "@/lib/i18n";
import type { LookDTO } from "@/lib/looks";
import { EXTRAS, VENUES, PAY_METHODS, TIME_SLOTS, DEPOSIT_RATE } from "@/lib/static-data";
import { bookingTotal, depositFor } from "@/lib/booking-calc";

const STEPS = ["when", "extras", "details", "pay"] as const;
type Step = (typeof STEPS)[number];

function upcomingDates() {
  const out: Date[] = [];
  const start = new Date();
  start.setDate(start.getDate() + 4);
  for (let i = 0; i < 9; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(d);
  }
  return out;
}

const DOW_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DOW_ID = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
const MONTH_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function BookingWizard({
  lang,
  look,
  signedIn,
  defaults,
}: {
  lang: Lang;
  look: LookDTO;
  signedIn: boolean;
  defaults: {
    name: string;
    email: string;
    date?: string;
    time?: string;
    venue?: string;
    method?: string;
    extras?: string[];
    phone?: string;
    city?: string;
    notes?: string;
    step?: string;
  };
}) {
  const dates = upcomingDates();
  const [step, setStep] = useState<Step>(
    STEPS.includes(defaults.step as Step) ? (defaults.step as Step) : "when"
  );
  const [date, setDate] = useState<string>(
    defaults.date || dates[4].toISOString().slice(0, 10)
  );
  const [time, setTime] = useState(defaults.time || "05:00");
  const [venue, setVenue] = useState(defaults.venue || "venue");
  const [extras, setExtras] = useState<string[]>(defaults.extras ?? ["lashes"]);
  const [method, setMethod] = useState(defaults.method || "transfer");
  // Held in state, not in the DOM: the details panel unmounts when the wizard
  // advances to `pay`, which would otherwise drop these from the submission.
  const [details, setDetails] = useState({
    name: defaults.name,
    phone: defaults.phone ?? "",
    email: defaults.email,
    city: defaults.city ?? "",
    notes: defaults.notes ?? "",
  });
  const setDetail = (key: keyof typeof details) => (value: string) =>
    setDetails((cur) => ({ ...cur, [key]: value }));

  const idx = STEPS.indexOf(step);
  const total = bookingTotal(look, extras);
  const deposit = depositFor(total, DEPOSIT_RATE);
  const chosenExtras = EXTRAS.filter((e) => extras.includes(e.id));
  const selectedDate = new Date(date + "T00:00:00");
  const monthLabel = `${lang === "id" ? MONTH_ID[selectedDate.getMonth()] : MONTH_EN[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  const whenLine = `${selectedDate.getDate()} ${(lang === "id" ? MONTH_ID : MONTH_EN)[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getFullYear()} · ${time}`;

  const stepMeta: Record<Step, { title: string; sub: string }> = {
    when: {
      title: l(lang, "When and where", "Kapan dan di mana"),
      sub: l(
        lang,
        "Shana takes one booking a day. Pick the slot and the venue.",
        "Shana menerima satu pesanan per hari. Pilih slot dan lokasinya."
      ),
    },
    extras: {
      title: l(lang, "Add-ons", "Tambahan"),
      sub: l(
        lang,
        "Everything here is optional and priced per event.",
        "Semua di sini opsional dan dihitung per acara."
      ),
    },
    details: {
      title: l(lang, "Your details", "Data kamu"),
      sub: l(
        lang,
        "So the studio can reach you the week before.",
        "Agar studio bisa menghubungimu seminggu sebelumnya."
      ),
    },
    pay: {
      title: l(lang, "Confirm and pay", "Konfirmasi dan bayar"),
      sub: l(
        lang,
        "The date is held the moment the deposit clears.",
        "Tanggal terkunci begitu deposit masuk."
      ),
    },
  };

  const summaryRows = [
    { k: l(lang, look.title, look.titleId), v: idr(look.priceIdr) },
    { k: l(lang, "Date & time", "Tanggal & jam"), v: whenLine },
    {
      k: l(lang, "Venue", "Lokasi"),
      v: (() => {
        const v = VENUES.find((x) => x.id === venue) ?? VENUES[0];
        return l(lang, v.name, v.nameId);
      })(),
    },
    ...chosenExtras.map((e) => ({ k: l(lang, e.name, e.nameId), v: idr(e.price) })),
  ];

  const nextLabel =
    step === "pay"
      ? `${l(lang, "Pay", "Bayar")} ${idr(deposit)}`
      : step === "details"
        ? l(lang, "Review order", "Tinjau pesanan")
        : l(lang, "Continue", "Lanjut");

  return (
    <form action={createBookingAction} className="flex flex-col">
      <input type="hidden" name="lookId" value={look.id} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      <input type="hidden" name="venue" value={venue} />
      <input type="hidden" name="method" value={method} />
      {extras.map((e) => (
        <input key={e} type="hidden" name="extras" value={e} />
      ))}
      <input type="hidden" name="name" value={details.name} />
      <input type="hidden" name="phone" value={details.phone} />
      <input type="hidden" name="email" value={details.email} />
      <input type="hidden" name="city" value={details.city} />
      <input type="hidden" name="notes" value={details.notes} />

      <div className="px-5 lg:px-0">
        <div className="flex gap-1.5 mb-3.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={clsx(
                "h-1 flex-1 rounded-full",
                i <= idx ? "bg-maroon" : "bg-[#e3d5be]"
              )}
            />
          ))}
        </div>
        <p className="text-[13px] leading-snug text-muted-2 mb-4">{stepMeta[step].sub}</p>
      </div>

      <div className="flex flex-col gap-4 px-5 lg:px-0">
        {step === "when" && (
          <>
            <div className="glass-card p-[18px]">
              <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
                {monthLabel}
              </div>
              <div className="no-scrollbar flex gap-2 overflow-auto mt-3 pb-0.5">
                {dates.map((d) => {
                  const iso = d.toISOString().slice(0, 10);
                  const on = iso === date;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setDate(iso)}
                      className={clsx(
                        "flex flex-col items-center gap-1 px-3 py-3 rounded-2xl cursor-pointer flex-none",
                        on ? "glass-fill text-white" : "glass-light text-ink"
                      )}
                    >
                      <span className="text-[10.5px] opacity-70 font-semibold">
                        {(lang === "id" ? DOW_ID : DOW_EN)[d.getDay()]}
                      </span>
                      <span className="font-extrabold text-base">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-[18px]">
              <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
                {l(lang, "Start time", "Jam mulai")}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={clsx(
                      "py-3 rounded-2xl cursor-pointer text-sm font-bold",
                      time === slot ? "glass-fill text-white" : "glass-light text-ink"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] leading-snug text-faint">
                {l(
                  lang,
                  "Bridal calls start before dawn — 03:00 and 04:00 include the artist’s travel window.",
                  "Panggilan pengantin mulai sebelum subuh — 03:00 dan 04:00 sudah termasuk waktu perjalanan artist."
                )}
              </p>
            </div>

            <div className="glass-card p-[18px]">
              <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
                {l(lang, "Where", "Lokasi")}
              </div>
              <div className="flex flex-col gap-2 mt-3">
                {VENUES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVenue(v.id)}
                    className={clsx(
                      "flex gap-3 items-center w-full p-3.5 rounded-2xl cursor-pointer text-left border-[1.5px]",
                      venue === v.id ? "bg-[#f5e6dc] border-maroon" : "bg-white border-line"
                    )}
                  >
                    <Radio active={venue === v.id} />
                    <span className="flex-1">
                      <span className="block font-bold text-sm">{l(lang, v.name, v.nameId)}</span>
                      <span className="block text-[11.5px] text-muted-2 mt-0.5">
                        {l(lang, v.note, v.noteId)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === "extras" && (
          <div className="flex flex-col gap-2.5">
            {EXTRAS.map((e) => {
              const on = extras.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() =>
                    setExtras((cur) =>
                      cur.includes(e.id) ? cur.filter((x) => x !== e.id) : [...cur, e.id]
                    )
                  }
                  className={clsx(
                    "flex gap-3 items-center w-full p-3.5 rounded-2xl cursor-pointer text-left border-[1.5px]",
                    on ? "bg-[#f5e6dc] border-maroon" : "bg-white border-line"
                  )}
                >
                  <Check active={on} />
                  <span className="flex-1">
                    <span className="block font-bold text-[14.5px]">{l(lang, e.name, e.nameId)}</span>
                    <span className="block text-[11.5px] text-muted-2 mt-0.5">
                      {l(lang, e.note, e.noteId)}
                    </span>
                  </span>
                  <span className="font-extrabold text-[13.5px] text-maroon">{idr(e.price)}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === "details" && (
          <div className="glass-card p-[18px] flex flex-col gap-3.5">
            <Label label={l(lang, "Full name", "Nama lengkap")}>
              <Input
                value={details.name}
                onChange={(e) => setDetail("name")(e.target.value)}
                placeholder="Aruna Prameswari"
              />
            </Label>
            <Label label="WhatsApp">
              <Input
                value={details.phone}
                onChange={(e) => setDetail("phone")(e.target.value)}
                placeholder="+62 812 0000 0000"
              />
            </Label>
            <Label label="Email">
              <Input
                type="email"
                value={details.email}
                onChange={(e) => setDetail("email")(e.target.value)}
                placeholder="aruna@studio.co"
              />
            </Label>
            <Label label={l(lang, "Venue city", "Kota acara")}>
              <Input
                value={details.city}
                onChange={(e) => setDetail("city")(e.target.value)}
                placeholder="Jakarta Selatan"
              />
            </Label>
            <Label label={l(lang, "Notes for Shana", "Catatan untuk Shana")}>
              <Textarea
                value={details.notes}
                onChange={(e) => setDetail("notes")(e.target.value)}
                placeholder={l(
                  lang,
                  "Skin concerns, references, ceremony timing…",
                  "Kondisi kulit, referensi, rundown acara…"
                )}
              />
            </Label>
          </div>
        )}

        {step === "pay" && (
          <>
            <div className="glass-card p-[18px]">
              <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
                {l(lang, "Your order", "Pesananmu")}
              </div>
              <div className="flex flex-col gap-2.5 mt-3">
                {summaryRows.map((row) => (
                  <div key={row.k} className="flex justify-between gap-3 text-[13.5px]">
                    <span className="text-muted">{row.k}</span>
                    <span className="font-semibold whitespace-nowrap">{row.v}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-line my-3.5" />
              <div className="flex justify-between font-extrabold text-[15.5px]">
                <span>{l(lang, "Total", "Total")}</span>
                <span>{idr(total)}</span>
              </div>
            </div>

            <div className="glass-fill text-white rounded-[20px] p-[18px]">
              <div className="text-[11.5px] font-semibold tracking-[0.06em] uppercase opacity-80">
                {l(
                  lang,
                  `Due now — ${DEPOSIT_RATE}% deposit`,
                  `Bayar sekarang — deposit ${DEPOSIT_RATE}%`
                )}
              </div>
              <div className="font-extrabold text-[28px] mt-2 tracking-tight">{idr(deposit)}</div>
              <div className="text-xs leading-snug opacity-85 mt-1.5">
                {l(
                  lang,
                  `Balance ${idr(total - deposit)} settles on the event day. Free reschedule up to 14 days before.`,
                  `Sisa ${idr(total - deposit)} dibayar hari-H. Reschedule gratis hingga 14 hari sebelumnya.`
                )}
              </div>
            </div>

            <div className="glass-card p-[18px]">
              <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
                {l(lang, "Pay with", "Bayar dengan")}
              </div>
              <div className="flex flex-col gap-2 mt-3">
                {PAY_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={clsx(
                      "flex gap-3 items-center w-full p-3.5 rounded-2xl cursor-pointer text-left border-[1.5px]",
                      method === m.id ? "bg-[#f5e6dc] border-maroon" : "bg-white border-line"
                    )}
                  >
                    <Radio active={method === m.id} />
                    <span className="flex-1 font-bold text-sm">{l(lang, m.name, m.nameId)}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] leading-snug text-faint">
                {l(
                  lang,
                  "This demo records the booking and marks the deposit as received — no real payment is taken.",
                  "Demo ini mencatat pesanan dan menandai deposit diterima — tidak ada pembayaran sungguhan."
                )}
              </p>
            </div>

            {!signedIn && (
              <p className="text-[12px] leading-snug text-muted-2">
                {l(
                  lang,
                  "You’ll be asked to sign in before the booking is confirmed.",
                  "Kamu akan diminta masuk sebelum pesanan dikonfirmasi."
                )}
              </p>
            )}
          </>
        )}
      </div>

      <div
        className={clsx(
          "sticky bottom-0 mt-5 pt-3.5 pb-5 bg-gradient-to-b from-white/72 to-white/90 backdrop-blur-2xl border-t border-white/80",
          "px-5 lg:px-0 lg:bg-none lg:border-0 lg:backdrop-blur-none"
        )}
      >
        <div className="flex justify-between items-baseline mb-2.5">
          <span className="text-xs text-muted-2">
            {step === "pay"
              ? l(lang, "Due now", "Bayar sekarang")
              : l(lang, "Running total", "Total sementara")}
          </span>
          <span className="font-extrabold text-base">
            {idr(step === "pay" ? deposit : total)}
          </span>
        </div>
        <div className="flex gap-2.5">
          {idx > 0 ? (
            <button
              type="button"
              onClick={() => setStep(STEPS[idx - 1])}
              className="h-[52px] px-5 rounded-2xl text-ink text-[14.5px] font-bold cursor-pointer glass-light"
            >
              ←
            </button>
          ) : (
            <Link
              href={`/l/${look.id}`}
              className="h-[52px] px-5 rounded-2xl text-ink text-[14.5px] font-bold flex items-center glass-light"
            >
              ←
            </Link>
          )}
          {step === "pay" ? (
            <button
              type="submit"
              className="flex-1 h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
            >
              {nextLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(STEPS[idx + 1])}
              className="flex-1 h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
            >
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
