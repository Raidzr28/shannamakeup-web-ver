---
name: Shana Makeup
description: Javanese bridal ornament as interface — ink ground, gold prada edges, one leaf-filled action.
colors:
  ink: "#120e0c"
  ground: "#1b1512"
  ground-2: "#241c17"
  ground-3: "#2f2519"
  prada: "#c4922f"
  prada-lit: "#e8c46a"
  prada-deep: "#8a6320"
  melati: "#f5f0e6"
  melati-2: "#c9bfae"
  melati-3: "#9a8e7c"
  skin: "#c08b5e"
  sirih: "#6f9d63"
  alarm: "#d4694e"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(3.5rem, 19vw, 5.5rem)"
    lineHeight: 0.84
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "38px"
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "21px"
    lineHeight: 1.05
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13.5px"
    lineHeight: 1.7
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "10px"
    letterSpacing: "0.1em"
    fontFeature: "tabular-nums"
rounded:
  arc-sm: "12px 12px 4px 4px"
  arc-md: "18px 18px 6px 6px"
  arc-lg: "26px 26px 8px 8px"
spacing:
  gutter-mobile: "20px"
  gutter-desktop: "44px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.prada}"
    textColor: "{colors.ink}"
    rounded: "{rounded.arc-md}"
    padding: "0 28px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.prada-lit}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.melati-2}"
    rounded: "{rounded.arc-sm}"
    height: "52px"
    padding: "0 28px"
  chip:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.melati-2}"
    rounded: "999px"
    padding: "10px 15px"
  chip-selected:
    backgroundColor: "{colors.prada}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.ground-2}"
    textColor: "{colors.melati}"
    rounded: "{rounded.arc-lg}"
---

# Design System: Shana Makeup

## Overview

**Creative North Star: "Ink on Skin"**

Paes ageng is the ornament a Javanese bride wears across her brow on the morning of the akad: matte black shapes set out to prescribed proportion on her own skin, each one closed with a hairline of gold prada leaf. This interface is built from that ornament rather than decorated with it. The five leaves are the brand mark, the tab-bar position marker, the section rule, and the ground of every image slot still waiting on a photograph.

The consequence is a surface drenched in warm ink, where the brightest thing on any screen is a face. That is not an aesthetic preference: the product is colour on skin, so the ground exists to make photographed skin luminous and to be legible to a woman scrolling in bed at eleven at night, months out from her wedding. Gold never glows and never gradients — it is leaf, and leaf has an edge.

The world this replaced was a cream ground with glassmorphism and Plus Jakarta Sans. That is the confirmed anti-reference: it is the look every generated app arrives at, and escaping it was the brief.

**Key Characteristics:**
- Warm near-black ground, never neutral grey, never cream
- Gold as hairline edge; solid fill reserved for exactly one action per surface
- Display type at architectural scale against small exact labels, with nothing in between
- Every ornament drawn as authored SVG, never a glyph or an approximating border-radius
- Bilingual by construction: `both` is the default language mode, so every label is roughly double width

## Colors

A drenched ink field carrying one metal and one flower, with a leaf green and a warm alarm held in reserve for state.

### Primary
- **Prada** (`#c4922f`): gold leaf. Hairline borders, active states, prices, links inside prose, and the single filled primary action per surface. It is the only saturated colour on most screens.
- **Prada Lit** (`#e8c46a`): the lit face of the leaf. Hover on filled actions, and focus rings.
- **Prada Deep** (`#8a6320`): scrollbar thumb and pressed edges, where gold must recede without going grey.

### Secondary
- **Sirih** (`#6f9d63`): betel leaf. Confirmed and available states only — the assistant's live dot, a settled booking.
- **Alarm** (`#d4694e`): kept warm so it belongs to the ground. Waiting counts, declined states, destructive confirmation.

### Neutral
- **Ink** (`#120e0c`): the page ground and the fill of every drawn ornament shape. Warm, not black.
- **Ground / Ground-2 / Ground-3** (`#1b1512` / `#241c17` / `#2f2519`): the three raised surfaces. Depth is tonal, not shadowed.
- **Melati** (`#f5f0e6`): jasmine white. Primary text and headings.
- **Melati-2** (`#c9bfae`): body copy and secondary labels.
- **Melati-3** (`#9a8e7c`): metadata, placeholders, inactive navigation.
- **Skin** (`#c08b5e`): the drawn figure's tone in `PersonPlaceholder`. Not a UI surface colour.

### Named Rules

**The Leaf Rule.** Prada is an edge. It may outline, rule, or letter — it may not glow, gradient, or blur. The one exception is the single primary action on a surface, where the leaf is laid solid with `ink` drawn on top (7.4:1).

**The One Action Rule.** Exactly one leaf-filled control per surface. A second one means the first was not the primary action.

**The Warm Ground Rule.** Every neutral carries red. If a grey samples cooler than its neighbours, it is wrong — blue-black slate is the drift this system exists to avoid.

## Typography

**Display Font:** Bodoni Moda (Georgia, serif)
**Body Font:** Archivo (system-ui, sans-serif)

**Character:** Bodoni's thick-to-hairline contrast makes the same move the ornament does — a solid black shape closed by a gold hairline. Archivo carries the dense bilingual labels without complaint and owns every figure.

### Hierarchy
- **Display** (Bodoni, `clamp(3.5rem, 19vw, 5.5rem)`, 0.84): the wordmark, once per surface.
- **Headline** (Bodoni, 38px, 1): section headings.
- **Title** (Bodoni, 21px, 1.05): card names, list-item names, step names.
- **Body** (Archivo, 13.5px, 1.7): prose, capped near 56ch.
- **Label** (Archivo, 10px, `0.1em`, uppercase): field labels, metadata, category and duration lines.

### Named Rules

**The Nothing-In-Between Rule.** Type is either display-scale or small and exact. A 17px semi-bold heading is the previous world; if a size feels like a compromise, it is one.

**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set on `body`. This product is made of prices, dates and durations, and proportional figures make a price column wobble.

## Layout

Single-column on mobile at a 20px gutter; 44px gutters on desktop with a `1.05fr 1fr` hero split and a four-up portfolio grid. Sections are separated by 80px. The mobile home opens with a full-bleed portrait that resolves into the ground — content starts at the top edge, not below a band of padding. Chip rows scroll horizontally inside `overflow-auto`; nothing else in the system may exceed the viewport width.

## Elevation & Depth

Tonal, not shadowed. Depth comes from three stepped ground values and a prada hairline, not from lift. Where a shadow appears it carries both an offset and a real blur — a zero-offset coloured halo is decoration and is not part of this system. Nothing in this world uses `backdrop-filter`, with one deliberate exception: overlay controls sitting directly on top of photography in the story viewer, where blur is a specific effect rather than a surface style.

### Shadow Vocabulary
- **Plate** (`0 12px 28px -12px rgba(0,0,0,0.75)`, plus a 10%-prada inset top edge): the standard raised surface.
- **Quiet** (`0 8px 20px -14px rgba(0,0,0,0.7)`): secondary surfaces and inputs.

## Shapes

**The Arc.** Every radius in the system is the penunggul — the ornament's tall centre leaf — resolved into a corner: pronounced at the top, nearly square where it rests. `arc-sm` (12/12/4/4), `arc-md` (18/18/6/6), `arc-lg` (26/26/8/8). A plate sits on a line; it does not float, and it is never uniformly rounded.

Icons are drawn on a 24px grid at 1.75 stroke weight with round caps, inheriting `currentColor`. One stroke weight runs through every atom — rules, lattice, icons and input borders.

## Components

### Buttons
- **Shape:** the medium arc (18px top, 6px bottom).
- **Primary:** solid `prada` with `ink` text, 52px tall. One per surface.
- **Hover / Focus:** fill lifts to `prada-lit`; focus-visible draws a 1px `prada-lit` outline at 3px offset. Motion is a 1px translate, nothing more.
- **Ghost:** transparent with a `prada/35` hairline and `melati-2` text; the border strengthens on hover rather than the fill appearing.

### Chips
- **Style:** fully rounded, `ground` fill, `melati-2` text, `prada/30` hairline.
- **State:** selected chips take solid `prada` with `ink` text.

### Cards / Containers
- **Corner Style:** the large arc (26px top, 8px bottom).
- **Background:** `ground-2`, with the image running edge to edge and the facts below it on a band closed by a `prada/30` top rule.
- **Border:** 1px `prada/30`. No card ever nests inside another card.

### Inputs / Fields
- **Style:** `ground` fill, `prada/30` hairline, medium arc, `melati` text with `melati-3` placeholders.
- **Focus:** border strengthens to `prada`; caret and selection are prada-tinted.

### Navigation
- Desktop: a solid ink bar with a `prada/30` bottom hairline; the active link carries a prada underline and prada text.
- Mobile: a five-slot tab bar. The active tab is marked by a 7px penunggul beneath the label, and the row always reserves that height so switching tabs moves the leaf rather than shifting the bar. Colour never carries the active state alone.

### The Ornament (signature)
`PaesCrown`, `PaesMark` and `PaesGround` in `components/ui/Paes.tsx`. Five ogee leaves on a hairline with a godheg hooking down at each temple. `tone="ink"` fills the shapes and edges them in prada; `tone="edge"` is hairline only, for where the ornament reads as structure. Empty image slots render `PaesGround` — a lattice on `ground` — with the crown at 80% opacity, so a missing photograph reads as prepared ground rather than a hole.

## Do's and Don'ts

### Do:
- **Do** write element selectors inside `@layer base` and material classes inside `@layer components`. Tailwind emits utilities in cascade layers, and an unlayered rule silently outranks every one of them.
- **Do** use `text-onprada` for any text sitting on a gold fill. `ink` now names the light foreground of a dark world and is exactly wrong there.
- **Do** give every new label both languages. `both` is the default mode and renders short labels as `EN · ID`, so budget roughly double width.
- **Do** draw new icons into `components/ui/Icons.tsx` on the 24px / 1.75 grid.
- **Do** let block-level links inherit their colour; only prose links inside `<p>` or `<label>` take prada.

### Don't:
- **Don't** put a label above a heading. The heading carries its own weight.
- **Don't** render gold as a glow, a gradient, or a soft shadow.
- **Don't** reach for a Unicode glyph as an icon. The system has drawn replacements for all of them.
- **Don't** introduce a cream, parchment or ivory ground, or Plus Jakarta Sans. That is the world this system replaced.
- **Don't** stack a category, duration and price on one row at grid width — they truncate. Each gets its own line.
