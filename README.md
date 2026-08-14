# Shana — makeup portfolio & booking

A real web app built from the Claude Design prototype in `../project/Shana Makeup.dc.html`.

Next.js 16 (App Router) · React 19 · Tailwind 4 · Prisma + SQLite · bilingual EN / Bahasa Indonesia.

## Two completely different UIs

The app serves a **mobile app experience** and a **desktop marketing site** from one codebase — not a
responsive reflow, but two separate component trees:

| | Mobile | Desktop |
|---|---|---|
| Shell | App header + 5-tab bottom bar | Sticky glass top nav + floating chat widget |
| Home | Greeting, promo slot card, category chips, 2-col look grid | Hero + stats, 4-col portfolio grid, how-it-works, sticky booking rail, CTA poster |
| Look | Full-bleed hero, sheet overlay, sticky book bar | Two-column with sticky detail card |
| Chat | Full-screen thread at `/chat` | Centred panel, plus the floating widget |

The switch is driven by **viewport width at the `lg` (1024px) breakpoint**, via the `MobileOnly` /
`DesktopOnly` wrappers in `src/components/shell/Viewports.tsx`. Both trees are rendered and one is
hidden with CSS, so the correct UI always matches the actual window — resize the browser and it swaps
live. Below `lg` the phone app is capped at 560px and centred rather than stretched.

An earlier version picked the layout server-side from the user agent plus a cookie override. That was
wrong: the choice ignored the real window size, so a narrow desktop window got the desktop layout and
overflowed, and a stale cookie could strand the phone UI on a wide screen. The CSS approach cannot get
stuck. The tradeoff is that both trees sit in the DOM, so page markup is larger and interactive
components (e.g. the booking wizard) exist twice — the hidden copy is `display:none`, so it is inert
and unfocusable.

## Getting started

```bash
npm install
```

```bash
npx prisma db push
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Then open http://localhost:3000.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Client | `aruna@studio.co` | `aruna2026` |
| Artist | `shana@shanamakeup.id` | `shana2026` |

## What's real

- **Auth** — email/password with bcrypt hashing, JWT session in an httpOnly cookie (`src/lib/auth.ts`).
  Guests can browse the portfolio, feed, dates and prices; liking, saving, posting, booking, chat and
  reviews redirect to sign-in with the reason shown.
- **Booking** — a four-step wizard (date/time/venue → add-ons → your details → confirm & pay) that
  writes a `Booking` row, computes a 30% deposit rounded to the nearest Rp 50.000, and lands on a
  confirmation page with a status timeline.
- **Feed** — posts, likes and saves persist per user. Composing a post uploads a real image to
  `public/uploads` and tags a bookable package, so any viewer can book the same look from the post.
- **Chat** — keyword-matched assistant replies (price / travel / trial / hold), persisted per user,
  mirroring the prototype's `botReply` logic.
- **Language** — every string ships EN + ID; the switcher offers English, Bahasa Indonesia, or the
  prototype's combined "EN·ID" mode.

## Payments

Payment method selection is recorded and the deposit is marked received, but **no payment processor is
integrated** — no real money moves. Wiring a gateway (Midtrans, Xendit, Stripe) is the remaining step
before this could take live bookings.

## Layout

```
prisma/schema.prisma     User, Look, Booking, Post, Like, Save, Review, Message
prisma/seed.ts           six packages, two demo users, sample posts and a booking
src/components/shell/Viewports.tsx   the mobile/desktop breakpoint switch
src/lib/                 auth, language, looks, feed, booking maths, uploads
src/lib/actions/         server actions (auth, booking, posts, review, chat)
src/components/          shell/ home/ looks/ booking/ chat/ ui/
src/app/                 routes
```
