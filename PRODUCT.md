# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — clients booking Shana.** Predominantly Indonesian women arranging makeup for a wedding or event, almost always on a phone, usually planning weeks or months ahead around a ceremony schedule they do not control. Their job: find a look that fits the occasion, confirm Shana will travel to them, and lock the date in with a deposit.

**Secondary — Shana herself** (`ARTIST` role), running the business from the same app: triaging requests, answering clients, reviewing payment receipts, keeping packages and prices current. She is a single operator, not a team.

Confirmed priority: client-facing surfaces receive the design investment. `/manage` stays clean and efficient but unshowy.

## Product Purpose

A working makeup artist's portfolio and booking system in one product. It replaces what this business normally runs on — DM threads, screenshots of price lists, manually confirmed transfers. Success is a client going from discovering a look to a confirmed, deposit-paid booking without leaving the app, and Shana running her whole day from the same place.

## Positioning

**The portfolio and the booking engine are the same object.** A `Look` is simultaneously what a client browses, what a `Post` credits, and the priced, duration-bearing line item a `Booking` is placed against. A neighboring product would ship a gallery plus a separate booking form; here, browsing is already the first step of booking.

**The assistant cannot contradict the checkout.** It answers from studio facts Shana edits herself (`KnowledgeEntry`) combined with her live package prices, so its answers and the booking flow quote the same numbers, and she corrects it without a deploy.

## Operating Context

- **Indonesia.** Prices in IDR, formatted with dot separators (`idr()` uses `de-DE`). Payment is bank transfer or QRIS with the client uploading a receipt image — not a card processor. Confirmation is a human review step, not a gateway callback.
- **Mobile-first in practice.** The client journey is a phone journey.
- **Shana travels to the client.** `User` stores phone, address, and city once; the booking wizard offers them as defaults instead of asking every time.
- **Bookings move `requested → accepted → payment_review → confirmed`, or `declined`.** `src/lib/booking-status.ts` owns those transitions and their labels — that is where the truth lives, not in any screen.
- **Weddings set the clock, not the studio.** An `akad` is at dawn; the booking carries `timeLabel` and `venue` because the ceremony's schedule dictates the appointment.
- **A social layer runs alongside the funnel** — posts, 24-hour stories, likes, saves, `@username` handles. It is how the portfolio stays alive between bookings.

## Capabilities and Constraints

Built and confirmed:

- Look catalogue with category, IDR price, duration, blurb, and includes — each in English and Indonesian.
- Booking wizard through payment (transfer / QRIS), receipt upload, artist review, and a post-booking review carrying rating and traits.
- Client↔artist chat, plus an artist inbox with pin, archive, and unread state (`ChatThread`).
- Gemini-backed assistant grounded in `KnowledgeEntry` plus live package prices.
- Posts, stories with 24-hour expiry, story views, likes, saves.
- Auth by email/password or Google. `passwordHash` is nullable — Google-only accounts never chose one, so every password path must check rather than assume. Returning Google users match on `sub`, not email, because an address can change and `sub` cannot.
- Artist-managed secrets encrypted at rest (AES-256-GCM); only a four-character hint ever reaches a browser.

Technical constraints future work must respect:

- Next.js 16 App Router, React 19, Tailwind v4, TypeScript. Prisma against Neon Postgres — DDL needs the unpooled URL. Uploads go to Vercel Blob. Deployed on Vercel.
- **Bilingual is a schema constraint, not a feature.** `Lang` is `"en" | "id" | "both"`, held in the `shana_lang` cookie, and **`both` is the default** — the language most visitors see is *both at once*. `p()` renders short labels as `EN · ID`, so default-mode chrome is roughly double width; `l()` picks a single language for prose that reads badly doubled. Consequences for every surface: no layout may be measured against one language's string lengths, and any new user-facing content ships in both languages or renders blank in one of them.

## Brand Commitments

- Name: **Shana Makeup**. Identity on posts and stories is handle-based (`@username`).
- **No logo or brand asset exists yet** — `public/` still carries only the Next.js default SVGs. Future work must not present an invented mark as hers.
- Voice, evidenced in the shipped `Look` copy: clipped, technical, unsentimental. *"Dawn ceremony face built to survive tears, prayer and photographers. Skin first, structure second, colour last."* Craft is described as engineering, not romance. The Indonesian copy holds the same register rather than translating literally.

## Evidence on Hand

- **Real, operating business.** The seeded catalogue carries genuine packages and prices — e.g. `Akad Pagi`, Bridal / Pengantin, Rp 8.500.000, 3h30.
- Photography and reviews come from real work and real clients, entered through the app (`Review`, `Post`, Vercel Blob uploads).
- **Absent — do not fabricate:** no logo, no press, no case studies, no testimonial copy outside the `Review` table, no partner or venue relationships. Because this is a real person's real business, invented proof is a lie about someone, not placeholder text.

## Product Principles

1. **Browsing is the first step of booking.** Never let the portfolio and the funnel drift into two products.
2. **Both languages are first-class, and `both` is the default view.** English-first design translated afterward is a defect, not a phase.
3. **Confirmation is human.** The payment flow's job is to make Shana's review fast and unambiguous, not to imitate a gateway's instant certainty.
4. **Client surfaces earn craft; `/manage` earns speed.** Shana is one person clearing a queue — density and clarity beat expression there.
5. **Say only what is true of this business.** It is real and operating; every claim must trace to something in the data or to Shana.
