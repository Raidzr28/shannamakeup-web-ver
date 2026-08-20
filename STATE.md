# Current State

A snapshot of SHANNA MAKE UP — what exists, what it runs on, and what is still
open. Written 2026-08-20 against `16d7d02`. `PRODUCT.md` says what the product
is for, `DESIGN.md` says how it looks, `README.md` says how to run it; this file
says where it stands.

## In one paragraph

The product is a working makeup artist's portfolio and booking system in one
app: browsing a look *is* the first step of booking it. Every client-facing
loop is built end to end — catalogue, four-step booking wizard, manual deposit
payment with receipt upload, artist review queue, chat with a Gemini-backed
assistant, and a social layer of posts and 24-hour stories. The artist side
(`/manage`) covers package CRUD, the reservation queue, the chat inbox and the
assistant's knowledge base. What has been moving lately is not features but
surface: a full design overhaul, then a correction that restored the owner's
real brand palette and logo, then three rounds of defect fixes falling out of
that sweep.

## Stack

| | |
|---|---|
| Framework | Next.js 16.3.1 App Router, React 19.2.8, TypeScript |
| Styling | Tailwind v4, tokens in `src/app/globals.css` |
| Data | Prisma 6 against Neon Postgres (DDL needs the unpooled URL) |
| Files | Vercel Blob (`avatars/`, `receipts/`, post and story photos) |
| Auth | JWT in an httpOnly cookie (`jose`); bcrypt or Google OAuth 2.0 + PKCE |
| Assistant | Google Generative Language REST API, plain `fetch`, model list with fallbacks |
| Hosting | Vercel (`vercel-build` runs `prisma db push && next build`) |

~12.3k lines across 108 TypeScript files in `src/`. 13 Prisma models. No test suite.

## What is built

**Client funnel** — catalogue (`/looks`, `/l/[id]`, `/book`) → four-step wizard
(date/time/venue → add-ons → details → review) → `Booking` row with a 30%
deposit rounded to Rp 50.000 → pay by transfer or QRIS at `/orders/[id]/pay`
with a browser-compressed receipt photo → artist confirms → WhatsApp contact
unlocks on the order page → post-booking review with rating and traits.

**Reservation state machine** — `requested → accepted → payment_review →
confirmed`, or `declined`. `src/lib/booking-status.ts` owns the states and
labels for both sides. Every transition is an `updateMany` guarded on the
current status, so two open tabs cannot double-apply one.

**Artist side** — `/manage` for package CRUD with a drag-and-drop photo picker
(deletion refused while bookings reference a package), `/manage/bookings` for
the queue, `/manage/chats` for the inbox with pin/archive/unread, and
`/manage/knowledge` for the facts the assistant answers from. Role is
re-checked in every page *and* every action, never trusted from rendered UI.

**Assistant** — grounded in `KnowledgeEntry` plus live package prices, so it
cannot quote a number the checkout disagrees with, and Shana corrects it
without a deploy. It falls silent once she replies in a thread. Scripted
keyword replies (`src/lib/chat.ts`) remain as the fallback when no key is
stored or every model 404s.

**Social layer** — posts tagged to a bookable package, likes, saves, stories
with a 24-hour `expiresAt` that every read filters on, `StoryView` tracking so
watched stories shift right on the next load, `@username` handles.

**Auth** — email/password or Google. `passwordHash` is nullable, so every
password path checks rather than assumes; returning Google users match on
`sub`, not email. Guests browse freely; every write redirects to sign-in with
the reason shown.

**Secrets** — artist-managed credentials encrypted at rest with AES-256-GCM
under a key derived from `AUTH_SECRET`. Only a four-character hint ever reaches
a browser.

## Design state

`DESIGN.md` is authoritative and current. The north star is "Ink on Skin" —
Javanese *paes ageng* geometry as the interface rather than as decoration, on
charcoal-to-maroon grounds where the brightest thing on any screen is a face.
Gold is a hairline edge; solid gold fill is reserved for one action per surface.

The palette is the owner's, taken verbatim from the Canva logo and recorded in
`BRAND.md`: gold `#DD9D63`, maroon `#5F0D14`, charcoal `#1A1A1A`, ivory
`#F5EDE1`. All ten text pairs measure ≥ 4.5:1. The confirmed anti-reference is
the *previous execution* — glassmorphism, Plus Jakarta Sans, generic card grid
— not the palette, which the old build already had right.

Two constructs were removed after a phone screenshot showed Android compositor
tearing (tripled wordmark, torn bands): the viewport-sized background lattice
and the animated leaf-catch sweep. Geometry was correct throughout, which is
why every automated check passed — they measure layout, not paint.

## Bilingual is a schema constraint

`Lang` is `"en" | "id" | "both"`, held in the `shana_lang` cookie, and **`both`
is the default** — most visitors see both languages at once. `p()` renders
short labels as `EN · ID`, so default-mode chrome is roughly double width;
`l()` picks one language for prose that reads badly doubled. No layout may be
measured against one language's string lengths, and any new user-facing string
ships in both languages or renders blank in one of them.

## Open items

1. **Transparent logo mark.** The supplied files are opaque JPEGs on a rose
   field, so the lockup can only be used where it has room to be a composition
   (both auth screens). Nav and favicon scale need a PNG or SVG of the monogram
   alone. This is the outstanding asset request from the owner.
2. **Shana vs Shanna.** The business is SHANNA MAKE UP (two n) per the logo,
   the repo and the Vercel project. App copy reads "Shana" in ~107 places,
   including the seed address `shana@shanamakeup.id`. The owner confirms both
   spellings are real but has not said which belongs where — **do not mass-
   rename until that is settled.**
3. **README drift.** `README.md` still describes chat as keyword-matched
   assistant replies; the Gemini path and the knowledge base landed after that
   section was written. The route table also predates `/manage/chats`,
   `/manage/knowledge`, `/manage/packages` and `/orders/[id]/review`.
4. **No payment processor, by design.** Deposits are human-verified: the client
   transfers out of band and uploads a receipt, and Shana confirms by eye.
   Nothing reconciles automatically. A gateway (Midtrans, Xendit, Stripe) would
   replace the receipt step — a product decision, not a missing stub.
5. **No tests.** There is no test suite and no CI; verification today is
   `npm run lint`, `next build`, and looking at the app.

## Environment

Required: `AUTH_SECRET`, `DATABASE_URL` / unpooled URL for DDL,
`BLOB_READ_WRITE_TOKEN`. Google sign-in: `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`. Assistant: `GEMINI_API_KEY` or
`GOOGLE_API_KEY` (or a key stored encrypted through `/manage`), optional
`GEMINI_MODEL`. Studio details: `SUPPORT_WHATSAPP`, `PAYMENT_BANK_*`,
`PAYMENT_QRIS_*`. Local demo only: `ALLOW_DEMO_ARTIST_LOGIN`.

## Repository

`master` and `claude/summarize-current-state-rf9aq0` are level; the working
tree is clean. `node_modules` is not installed in a fresh clone — `npm install`
runs `prisma generate` via `postinstall` before anything will build.
