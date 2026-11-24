# Design System Master File

> **LOGIC:** When building a page, first check `design-system/gamejamcrew/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> This file is the source of truth for GameJamCrew. It refines DS-4 « Bureau de jam ».
> `SCRIPT-SUGGESTION.md` is the raw ui-ux-pro-max `--design-system` output. Treat it as
> suggestions only. Where it conflicts with this Master (Inter, indigo, flat / no shadows),
> this Master wins.

---

**Project:** GameJamCrew
**Direction:** Bureau de jam (jam desk)
**Generated:** 2026-11-24
**Category:** Community matching for indie game-jam teams (not a B2B SaaS, not a generic AI app)
**Token files:** `tokens.json` (W3C DTCG JSON), `tokens.css` (`:root` custom properties).
The running app reads `app/globals.css`; keep that file and these tokens in sync.
**Design Dials (from the generator, kept):** Variance 7/10 | Motion 3/10 (subtle) | Density 6/10

---

## UI style

A jam-desk web app: solid paper surfaces, sharp ink, one 3px neo stamp sitting
bottom-right of cards and primary controls, pastel Lagune / Violette / Affiche
accents. Signed-in pages use the app shell (hotbar / dock). Signed-out pages keep
the marketing site format.

**Do**

- Solid surfaces. High-contrast ink on paper. Distinct Lagune CTAs.
- 8px radius on controls, 16px (`rounded-2xl`) on cards.
- Neo shadow exactly `3px 3px 0 0` using `--neo-shadow`. Never clip it: keep a
  3px gutter at the right and bottom of scrolling desks (`pr-[3px] pb-[3px]`).
- Nunito for headings, body, tags, and numbers (DS-1 pair, frozen).
- Lucide icons through `AppIcon` (engine marks in `TagIcon` may use the official
  SVG path, tinted with charter engine tokens).
- Visible focus rings (`--ring` = Lagune). Respect `prefers-reduced-motion`.

**Don't**

- Generic indigo / purple meshes, glassmorphism, metallic gradients, or “AI”
  hero glows.
- Flat “no shadow” cards, or soft multi-layer drop shadows that replace the neo stamp.
- Inter, Syne, Atkinson Hyperlegible, or any face other than the frozen DS-1 Nunito pair.
- White or muted text on a Lagune / Violette / Affiche *fill* in light mode.
- Pure white (`#FFFFFF`) or cool off-white (`#F7FBFC`) as the light page or card surface.

---

## Color palette (hex)

Named Bureau de jam colors. Values are the computed sRGB of the tokens in
`app/globals.css` (DS-4), not a new palette.

### Light (default marketing + `.light`)

| Name | Role | Hex | Notes |
|------|------|-----|--------|
| Papier | Background | `#F3ECDD` | Warm cream paper (was cool `#F7FBFC`; Wisllor, 24 Nov 2026) |
| Card | Raised surface | `#FBF7EF` | Lighter cream than Papier, never pure white |
| Muted / secondary / sidebar | Recessed surface | `#EDE4D3` | Slightly deeper cream |
| Encre | Text / neo stamp | `#071418` | Body text, 15.91:1 on Papier, 17.51:1 on card |
| Muted text | Secondary copy | `#5A4A34` | Warm taupe, 7.25:1 on Papier, 7.98:1 on card |
| Border | Hairline | `#C4B49A` | Warm tan, no cold grey |
| Input chrome | Control border | `#8F7D64` | 3.38:1 on Papier, 3.72:1 on card, 3.15:1 on muted |
| Focus ring | Lagune, darkened | `#009084` | 3.35:1 on Papier (pastel Lagune fill is 2.07:1 as a ring) |
| Lagune | Primary / CTA fill | `#00BAAA` | **Not** text on cream (2.07:1). Use `#071F20` on the fill (7.02:1). Text-as-Lagune: `#096058` (6.32:1) |
| Violette fill | Lavender wash | `#C9C2EE` | Text on fill: `#3F367A` (6.16:1) |
| Violette text | Lavender-as-text | `#3F367A` | 9.73:1 on card |
| Affiche | Pink accent | `#DCA0D6` | Ink (`#071418`) on light Affiche washes, never white |
| Ombre | Alias of Encre here | `#071418` | Neo stamp in light, unchanged |

### Dark (`:root` / `.dark`)

| Name | Role | Hex | Notes |
|------|------|-----|--------|
| Encre | Background | `#10111A` | |
| Papier | Text | `#E6E7EF` | 15.25:1 on Encre, 14.13:1 on card |
| Card | Raised surface | `#181926` | |
| Lagune | Primary / CTA | `#26BDAE` | 7.44:1 on card. Ink on fill: `#10111A` (8.03:1) |
| Violette | Lavender accent / text | `#9D94D9` | 6.52:1 on card |
| Affiche | Pink accent / text | `#DCA0D6` | 8.54:1 on card |
| Muted text | Secondary copy | `#8C8E9C` | 5.36:1 on card |
| Ombre | Neo stamp | `#050509` | The 3px black offset the product keeps |

Shared: destructive fill `#E7000B`. On-destructive text must be `#FFFFFF` (4.77:1).
Do not use the previous `#FCF3F1` pair (4.37:1, fails AA).

### Semantic mapping (CSS)

`--background`, `--foreground`, `--card`, `--primary` (= Lagune), `--primary-foreground`,
`--muted-foreground`, `--destructive`, `--ring`, `--teal`, `--lavender`, `--pink`, `--neo-shadow`.

Recruitment / “open role” badges use the role tokens below. Action buttons use Lagune
(`bg-primary` / `bg-teal`) with the matching on-color, never light text on a light fill.

---

## Typography

- **Headings and body:** Nunito 400 / 500 / 600 / 700 / 800 (`--font-sans`, `--font-display`, `--font-nunito`).
  This is the DS-1 typography pair, used for titles and for body.
- Loaded with `next/font`, `display: "swap"`, `subsets: ["latin"]`. Preload Nunito
  (single family, including LCP text). Do not add a second family or preload.
- Body size ≥ 16px. Tags and small text ≥ 12px (`text-xs`). No `text-[10px]` on readable UI.
- Line-height: body 1.5, titles 1.2–1.3.

**Why Nunito is frozen:** ui-ux-pro-max suggested Inter for both roles; that pair is
rejected (generic AI / SaaS). DS-4 briefly tried Syne + Atkinson Hyperlegible.
On 24 Nov 2026 Wisllor asked to restore the pre-DS-4 DS-1 fonts and preferred
them. This Master therefore uses Nunito for headings and Nunito for body — exactly
the original pair. Do not adopt any typeface proposed by ui-ux-pro-max.

### Tabular numbers

All digits (team size, counters, XP, levels, quotas, timestamps, notification counts)
use fixed-width figures:

```css
body {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

@utility text-stat {
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
  font-weight: 700;
  letter-spacing: 0;
}
```

Apply `text-stat` on KPI values and badge counts so they stay on Nunito
(the body face). Format large values with separators or a short form
(`1,234` or `1.2K`), never a bare seven-digit string.

---

## Spacing (strict 8px grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Half-step only: icon gaps, tight chips |
| `--space-sm` | `8px` | Default inline gap, control radius |
| `--space-md` | `16px` | Card padding, card radius, section gaps |
| `--space-lg` | `24px` | Group spacing |
| `--space-xl` | `32px` | Section padding |
| `--space-2xl` | `48px` | Large section breaks |
| `--space-3xl` | `64px` | Hero / page padding (signed-out) |

Do not invent 5px / 7px / 13px gaps. The 3px neo stamp and its gutter are the
only approved off-grid exception (the stamp would collapse if rounded to 8).

---

## Buttons

- **Primary (action):** Lagune fill, on-Lagune ink, 8px radius, 12×16 padding,
  Nunito 700 for labels, including hero CTAs.
  Hover: no layout-shifting scale. Keep the 3px neo stamp.
  `cursor: pointer`. Transition 150–200ms.
- **Secondary:** card surface, 1px border, neo stamp, Encre label.
- **Ghost / tertiary:** no fill, Encre or Lagune text, visible hover background
  (`muted`), no opacity-only hover on text.
- **Destructive:** destructive fill, white label, confirm in a neo `Dialog`.
- Focus: 3px Lagune ring, never `outline: none` without a replacement.
- Disabled: muted, `cursor: not-allowed`, no stamp lift.

Create (the `+` control) opens a centered neo `Dialog` with `aria-modal`, Escape,
overlay click, focus trap, and focus return to the trigger. On 390px it stays a
centered card, not a bottom sheet.

---

## Cards

Shared recipe: `rounded-2xl border bg-card` + `shadow-[3px_3px_0_0_var(--neo-shadow)]`.
Interactive cards may use `.card-interactive` (2px translate on hover, stamp held,
no motion when `prefers-reduced-motion`).

### Dev profile

Portrait or initials, display name in Nunito 800 (`font-display`), role + engine
+ level as `TagIcon`, short bio in Nunito 16px, one Lagune CTA (“Invite” /
“View profile”). Empty
bio: a short English placeholder, not a blank box.

### Squad / team announcement

Squad name in Nunito 800 (`font-display`), engine `TagIcon`, member count as `text-stat`, open-role
badges with role colors, jam link if any, Lagune “View squad” / “Apply”.
Do not fill the whole card with Lagune (DS-QA4). Keep the CTA as a Lagune button
on a card surface.

### Jam sheet

Jam title in Nunito 800 (`font-display`), dates and team size as `text-stat`, short description,
theme tags, one action (“Open jam” / “Link squad”). Same stamp, no marketing halo.

---

## Role badge colors

Token + text on a 18% tint of itself (`tone()` in `lib/constants.ts`). All pairs
meet 4.5:1 on card (light and dark).

| Role | Token | Dark hex | Light hex |
|------|-------|----------|-----------|
| Developer | `--role-developer` | `#55CEC0` | `#005B53` |
| 2D Artist | `--role-artist-2d` | `#E79BCE` | `#82396D` |
| 3D Artist | `--role-artist-3d` | `#F1B77E` | `#824717` |
| Audio | `--role-audio` | `#B0A6ED` | `#524785` |
| Voice Actor | `--role-voice` | `#BE95EC` | `#5E3685` |
| Writer | `--role-writer` | `#F599A5` | `#8E3646` |
| Game Designer | `--role-design` | `#E8BE62` | `#784A00` |
| UI / UX | `--role-ux` | `#89D0AA` | `#145538` |
| QA / Playtester | `--role-qa` | `#78C2E6` | `#005574` |
| Other | muted | — | — |

Open vs filled: `.role-badge-open` / `.role-badge-filled`. Do not encode status
with color alone (icon + label stay visible). No hover `scale` that shifts layout.

---

## Engine badge colors

Official marks (simple-icons or owner-traced paths) stay as *glyphs*. Their
official brand hex is **not** used as text or as a fill when it fails AA
(Unity/Unreal nearly black, Defold `#F86020` is 3.14:1 on white). `TagIcon`
tints the mark with the charter token below.

| Engine | Token | Dark hex (on card) | Light hex (on card) |
|--------|-------|--------------------|---------------------|
| Godot | `--engine-godot` | `#26BDAE` | `#096058` |
| Unity | `--engine-unity` | `#8AA0C8` | `#3B4F73` |
| Unreal Engine | `--engine-unreal` | `#D4B46A` | `#6B5420` |
| GameMaker | `--engine-gamemaker` | `#DCA0D6` | `#7A3A74` |
| PICO-8 | `--engine-pico8` | `#E8A070` | `#7A3F16` |
| Defold | `--engine-defold` | `#9D94D9` | `#4A4478` |
| Construct | `--engine-construct` | `#6FCFB0` | `#1F6B56` |
| GDevelop | `--engine-gdevelop` | `#E08AA8` | `#7A2E48` |
| Custom / Other | `--engine-custom` | `#A8AAB8` | `#4A4C5A` |
| Any / No Preference | muted | — | — |

All listed pairs are ≥ 4.5:1 on `#181926` / `#FFFFFF`. Use `TagIcon kind="engine"`
everywhere an engine appears (cards, filters, profile). Do not invent a second
lavender `Cpu` chip.

---

## Motion

Subtle only (dial 3/10): 150–200ms color / shadow, 200–250ms dialog.
No GSAP scroll-reveal on first paint (protect LCP). Skip non-essential motion
when `prefers-reduced-motion: reduce`.

---

## Accessibility and performance

- Text contrast ≥ 4.5:1, UI components ≥ 3:1.
- Keyboard: focus visible, dialogs modal, `/` focuses signed-in search (including
  390px after the field is mounted).
- LCP target (signed-in Home, from DS-QA4): ~0.86s at 1280px, ~1.22s at 390px.
  Keep `next/font` + `display: swap` + latin subsets, with Nunito preloaded
  as the only family. Do not add a second family.
- Filter bars: solid or transparent, never a 30% `dark:bg-input/30` wash.

---

## Anti-patterns (do not use)

- Inter, Syne, Atkinson Hyperlegible, or any face other than the frozen DS-1 Nunito pair.
- Indigo `#6366F1`, generic purple meshes, “funnel landing” chrome on the app shell.
- Flat Design with “no shadows” — the 3px neo stamp is product identity
  (user request, 24 Nov 2026).
- Coral `#F87966` (dropped in DS-4).
- White or low-contrast text on Lagune / pastel fills in light mode.
- Pure white or cool off-white page/card surfaces in light mode (overexposed against the neo stamp). Use warm cream.
- Semi-transparent backgrounds on `/teams` and `/find-members` filter triggers.
- Emoji as icons; mixed icon libraries. Lucide goes through `AppIcon`.
- Missing `cursor: pointer` on clickable elements.
- Layout-shifting hover (`scale` that reflows neighbors).
- Instant state changes with no 150–200ms transition (unless reduced motion).
- Invisible focus, or `outline: none` with no ring.
- Official engine brand hex when it fails AA.
- Proportional digits for stats, and `text-[10px]` for tags or helper copy.
- Changing queries, routes, schema, or test data to restyle a page.
- Gradients that pretend to be metal, glass, or an “AI orb”.

---

## Pre-delivery checklist

- [ ] Palette and type match this Master (not `SCRIPT-SUGGESTION.md`)
- [ ] Neo 3px stamp visible on cards; not clipped at the desk edge
- [ ] `text-stat` / tabular-nums on counts, XP, team size, tags
- [ ] Role and engine badges use the tokens above
- [ ] Lucide via `AppIcon`; official engine marks tinted with charter colors
- [ ] Contrast AA: 4.5:1 text, 3:1 UI, both themes
- [ ] Focus visible; `prefers-reduced-motion` honored
- [ ] Primary breakpoints 390 and 1280, plus 768 and 1440
- [ ] No content hidden behind the hotbar; no horizontal scroll on 390
- [ ] LCP still in the 0.86s / 1.22s band (no extra font preload)
