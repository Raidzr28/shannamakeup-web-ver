# Shana — makeup portfolio & booking

A real web app built from the Claude Design prototype in `../project/Shana Makeup.dc.html`.

Next.js 16 (App Router) · React 19 · Tailwind 4 · Prisma + Postgres (Neon) · Vercel Blob · bilingual
EN / Bahasa Indonesia.

## Design

The palette moved away from the prototype's cool green and grey to a warm one, defined as tokens at
the top of `src/app/globals.css`:

| Role | Token | Value |
|---|---|---|
| Ground | `--color-bg` / `--color-amb` | `#f5ede1` / `#f8f1e5` warm cream |
| Cards | `--color-card` | `#fffcf7` |
| Primary action | `--color-maroon` / `-deep` | `#5f0d14` / `#430a0f` |
| Secondary accent | `--color-gold` / `-deep` | `#dd9d63` / `#c17f45` |
| Text | `--color-ink`, `--color-muted*` | `#1a1a1a`, warm browns |

One accent carries every primary action, exactly as the prototype intended — only the hue changed.
Use the tokens (`text-maroon`, `bg-tint`) rather than raw hex so a future retheme stays a one-file
edit. The frosted-glass treatment (`.glass-card`, `.glass-light`, `.glass-fill`) is unchanged.

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

The datasource is Postgres, so local dev needs a real connection string — there is no SQLite fallback.
Pull the deployed values (see [Deploying to Vercel](#deploying-to-vercel) if the project is not linked
yet):

```bash
npm install
```

```bash
vercel env pull .env.local
```

```bash
npm run db:push
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Then open http://localhost:3000. `db:push` and `db:seed` go through `dotenv -e .env.local`, because
the Prisma CLI reads `.env` and would otherwise talk to the placeholder in it.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Client | `aruna@studio.co` | `aruna2026` |
| Artist | `shana@shanamakeup.id` | `shana2026` |

### Studio contact and payment details

Optional — each falls back to a demo value, so the app runs without them. Set them for real use:
`SUPPORT_WHATSAPP` is what the call-centre button dials once a booking is confirmed, and the payment
values are what clients are told to pay into.

| Variable | Purpose | Falls back to |
|---|---|---|
| `SUPPORT_WHATSAPP` | Studio WhatsApp, digits + country code, no `+` | `6281200000000` |
| `PAYMENT_BANK_NAME` | Bank shown on the transfer screen | `BCA` |
| `PAYMENT_BANK_ACCOUNT` | Account number | `123 456 7890` |
| `PAYMENT_BANK_HOLDER` | Account holder | `Shana Prameswari` |
| `PAYMENT_QRIS_URL` | Hosted QRIS image | unset — the QRIS tab shows a "not set up" note |
| `PAYMENT_QRIS_MERCHANT` | Merchant name under the QR | `Shana Makeup` |

These are read in `src/lib/support.ts`, which is `server-only` on purpose: plain (non-`NEXT_PUBLIC`)
env vars become `undefined` in a client bundle, so reading them in a client component would silently
serve the demo bank details in production.

## What's real

- **Auth** — email/password with bcrypt hashing, JWT session in an httpOnly cookie (`src/lib/auth.ts`).
  Guests can browse the portfolio, feed, dates and prices; liking, saving, posting, booking, chat and
  reviews redirect to sign-in with the reason shown.
- **Booking** — a four-step wizard (date/time/venue → add-ons → your details → review & request) that
  writes a `Booking` row and computes a 30% deposit rounded to the nearest Rp 50.000. Nothing is
  charged at this point; the wizard sends a *request*.
- **Reservations** — bookings move `requested → accepted → payment_review → confirmed`, or
  `declined`. The artist works the queue at `/manage/bookings`: accept or decline a date, then check
  the deposit receipt and either confirm it or send it back with a reason (which returns the booking
  to `accepted` without losing the slot). Every transition is a `updateMany` guarded on the current
  status, so two open tabs cannot double-apply one.
  `src/lib/booking-status.ts` owns the states and their labels for both sides of the app.
- **Deposit payment** — once accepted, the client pays at `/orders/[id]/pay` by bank transfer or
  QRIS, then uploads a receipt photo (compressed in the browser, stored in Blob under `receipts/`).
  Ownership, the status gate and the payment method are all decided server-side.
- **Call centre** — confirming the payment reveals the studio's WhatsApp contact on the client's
  order page, as a `wa.me` deep link prefilled with their order code. It appears in that one state
  and no earlier.
- **Feed** — posts, likes and saves persist per user. Composing a post uploads a real photo to Vercel
  Blob and tags a bookable package, so any viewer can book the same look from the post.
- **Stories** — signed-in users post a photo + caption to the story rail. Each story carries an
  `expiresAt` 24 hours out and every read filters on it, so a story vanishes on its own even if no
  row is ever deleted. The owner can edit the caption or delete the story at any point inside that
  window; both are scoped by owner id server-side, so nobody can touch someone else's.
  Opening a story records a `StoryView`, and watched stories shift to the right of the rail on the
  next load so it always opens on something new. The rail deliberately does not re-sort while the
  viewer is open — that would slide stories out from under the reader mid-watch.
- **Package management** — the artist gets `/manage`, a CRUD area for the bookable catalogue with a
  drag-and-drop photo picker. Deleting is refused while bookings reference a package. Clients and
  guests are redirected away; the role is re-checked in every page *and* every action rather than
  trusted from the rendered UI.
- **Profile** — `/account/edit` covers the photo (uploaded to Blob under `avatars/`), a unique
  `@username`, display name, bio, phone, address and city. Password changes require the current
  password. The handle is assigned automatically at registration and is what the feed and story
  bylines render, replacing the hard-coded `shana.mua`. The saved phone and city become the defaults
  in the booking wizard, so an address is typed once rather than per booking.
- **Chat** — keyword-matched assistant replies (price / travel / trial / hold), persisted per user,
  mirroring the prototype's `botReply` logic.
- **Language** — every string ships EN + ID; the switcher offers English, Bahasa Indonesia, or the
  prototype's combined "EN·ID" mode.

## Payments

Deposits are **manual and human-verified**: the client transfers or scans QRIS out of band, uploads a
receipt photo, and the artist confirms it by eye. That is a deliberate fit for how the studio already
works, not a stub — but it means **no payment processor is integrated** and nothing reconciles
automatically. Wiring a gateway (Midtrans, Xendit, Stripe) would replace the receipt-upload step and
let `confirmed` be reached without the artist checking each one.

## Layout

```
prisma/schema.prisma     User, Look, Booking, Post, Story, StoryView, Like, Save, Review, Message
prisma/seed.ts           six packages, two demo users, sample posts and a booking
prisma/backfill-usernames.ts  one-off: gives pre-username accounts a handle (safe to re-run)
src/app/globals.css      colour tokens and the frosted-glass utilities
src/app/api/upload/      Route Handler that stores a compressed photo in Blob
src/app/manage/          artist-only: package CRUD and the reservation queue
src/lib/booking-status.ts     the reservation state machine, shared by both sides
src/lib/support.ts       server-only studio WhatsApp and payment destinations
src/components/shell/Viewports.tsx   the mobile/desktop breakpoint switch
src/lib/                 auth, language, looks, feed, booking maths, image compression
src/lib/actions/         server actions (auth, profile, booking, posts, stories, packages, review, chat)
src/components/          shell/ home/ looks/ booking/ manage/ chat/ ui/
src/app/                 routes
```

## Routes

| Path | Who |
|---|---|
| `/`, `/looks`, `/l/[id]`, `/studio` | anyone |
| `/book`, `/book/[id]` | anyone browses; sign-in required to confirm |
| `/looks/compose`, `/looks/story`, `/account/edit`, `/orders`, `/orders/[id]/pay`, `/chat` | signed in |
| `/manage`, `/manage/new`, `/manage/[id]`, `/manage/bookings`, `/manage/bookings/[id]` | artist only |

## Deploying to Vercel

The app targets **Neon Postgres** and **Vercel Blob** in production. Local SQLite and
`public/uploads` were removed because Vercel's serverless filesystem is ephemeral and read-only —
writes there are lost on every deploy and are not shared between instances.

Note that first-party Vercel Postgres no longer exists — it was sunset in favour of Marketplace
providers. Neon is its successor and is what the dashboard offers under *Marketplace Database
Providers*.

```bash
vercel login
vercel link          # run from web/, which is the git root
```

Provision both stores from the Vercel dashboard (Storage tab), attaching each to this project. They
are created one at a time:

- **Blob** (first-party) — sets `BLOB_READ_WRITE_TOKEN`
- **Neon** (under *Marketplace Database Providers*) — sets `DATABASE_URL` (pooled) and
  `DATABASE_URL_UNPOOLED` (direct)

`schema.prisma` uses the pooled URL for queries and the unpooled one as `directUrl`, because
`prisma db push` issues DDL that can hang behind Neon's connection pooler. If your Neon integration
names the direct variable something else (e.g. `POSTGRES_URL_NON_POOLING`), update `directUrl` to
match — check with `vercel env ls` after provisioning.

Then add the one secret Vercel cannot generate:

```bash
vercel env add AUTH_SECRET production
```

Use a long random string (`openssl rand -base64 32`). Do not reuse the dev placeholder — it is
committed to this README's sibling `.env` and signs every session cookie.

Pull the real values down so local dev talks to the same stores:

```bash
vercel env pull .env.local
```

Deploy. `vercel-build` runs `prisma db push` first, so the schema is created on the first deploy:

```bash
vercel deploy --prod
```

Finally seed the six packages and demo accounts once, against the production database:

```bash
npm run db:seed
```

(`.env.local` supplies `DATABASE_URL`, so this runs locally but writes to the Neon database.)

### Notes

- `vercel.json` pins `"framework": "nextjs"`. Without it, a project created with the **Other** preset
  builds successfully but then serves `public/` as a static site — every route 404s while the build
  log looks perfectly healthy. Pinning it in the repo keeps that out of dashboard state.
- `prisma db push` is used rather than `migrate deploy` — fine for this project, but it applies schema
  changes without a migration history. Switch to migrations before there is production data worth
  keeping. The build script deliberately omits `--accept-data-loss`, so a destructive schema change
  fails the build instead of silently dropping columns.
- `postinstall` runs `prisma generate` so the client matches the schema on every Vercel build.
- Prisma's CLI reads `.env`, not `.env.local`. `db:push` and `db:seed` therefore go through
  `dotenv -e .env.local` so they hit the real Neon database rather than the placeholder.
- Photos are **downscaled in the browser** (1600px longest edge, re-encoded JPEG — see
  `src/lib/compress-image.ts`) and then POSTed to `/api/upload`, which stores them with the
  server-side token. Two limits force this shape: Server Actions cap request bodies at 1 MB, and
  Vercel caps serverless request bodies around 4.5 MB, while a phone photo is routinely 3–12 MB. The
  action itself only ever receives the resulting URL string.
- Uploading straight from the browser with `@vercel/blob/client` was tried first and **does not
  work**: v2.8.0 resolves its API host to `https://vercel.com/api/blob`, which returns no
  `Access-Control-Allow-Origin`, so the browser blocks it and the SDK retries silently forever. The
  override is read from `VERCEL_BLOB_API_URL`, which is not `NEXT_PUBLIC_`-prefixed and so never
  reaches the browser bundle. Don't reach for that approach again without checking it upstream first.
- The Blob store must be created with **public** access. Access is fixed at creation and there is no
  `update-store` command, so a private store means `put({ access: "public" })` fails with *"Cannot use
  public access on a private store"* and the only fix is a new store.
- Attach the Blob store to **Development** as well as Production and Preview, or uploads fail locally.
  Once attached, `vercel env pull` brings the real `BLOB_READ_WRITE_TOKEN` down (it starts
  `vercel_blob_rw_`); a short placeholder value means the store is not connected to that environment.
