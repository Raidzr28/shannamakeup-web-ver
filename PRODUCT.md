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

**These are supplied by the owner and take priority over any design direction, including one arrived at through a concept round. They are not a starting point to be improved on.**

- **Palette is fixed.** Taken from the Canva logo by the owner and recorded verbatim in `BRAND.md`: gold `#DD9D63` (logo text, title accents, icons), maroon `#5F0D14` (background, rose elements), charcoal `#1A1A1A` (supporting text, dark grounds), ivory `#F5EDE1` (light grounds, breathing space). Any future direction renders inside these four.
- **A logo exists and is authoritative.** A gold monogram enclosing a woman's profile, above letterspaced SHANNA / MAKE UP, on a deep red rose field. Files in `public/brand/` (`shanna-logo-lockup.jpg`, `shanna-logo-ornate.jpg`, `roses.jpg`). *An earlier version of this record stated no logo existed. That was wrong.*
- **A transparent mark is still missing.** The supplied files are opaque JPEGs on a rose field, so they cannot be used inline at nav or favicon scale. A PNG or SVG of the monogram alone is the outstanding asset request.
- Name: the business is **SHANNA MAKE UP** (two n) per the logo, the GitHub repo (`shannamakeup-web-ver`) and the Vercel project (`shannamakeup`). App copy currently reads "Shana" (one n) in 107 places, including as the artist's name in prose and the seed address `shana@shanamakeup.id`. The owner has confirmed both spellings are real but has not yet said which belongs where — do not mass-rename until that is settled.
- Identity on posts and stories is handle-based (`@username`).
- Voice, evidenced in the shipped `Look` copy: clipped, technical, unsentimental. *"Dawn ceremony face built to survive tears, prayer and photographers. Skin first, structure second, colour last."* Craft is described as engineering, not romance. The Indonesian copy holds the same register rather than translating literally.

## Evidence on Hand

- **Real, operating business.** The seeded catalogue carries genuine packages and prices — e.g. `Akad Pagi`, Bridal / Pengantin, Rp 8.500.000, 3h30.
- Photography and reviews come from real work and real clients, entered through the app (`Review`, `Post`, Vercel Blob uploads).
- **Absent — do not fabricate:** no press, no case studies, no testimonial copy outside the `Review` table, no partner or venue relationships. (A logo *does* exist — see Brand Commitments.) Because this is a real person's real business, invented proof is a lie about someone, not placeholder text.

## Product Principles

1. **Browsing is the first step of booking.** Never let the portfolio and the funnel drift into two products.
2. **Both languages are first-class, and `both` is the default view.** English-first design translated afterward is a defect, not a phase.
3. **Confirmation is human.** The payment flow's job is to make Shana's review fast and unambiguous, not to imitate a gateway's instant certainty.
4. **Client surfaces earn craft; `/manage` earns speed.** Shana is one person clearing a queue — density and clarity beat expression there.
5. **Say only what is true of this business.** It is real and operating; every claim must trace to something in the data or to Shana.
