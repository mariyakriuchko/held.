# Logo color fix + type & spacing tightening

## 1. Header logo — ink wordmark, green dot

`src/components/held/Shell.tsx`: swap the header so "held" renders in ink (default `text-foreground`) and the dot in green (`ink-accent`). Matches the brand assets, favicon, and OG image — single accent spent intentionally on the dot.

```
<span>held</span>
<span aria-hidden className="ml-0.5 ink-accent">.</span>
```

## 2. Type system — collapse to 5 roles

Define a clear 5-role scale and apply it consistently. No new font files; uses Fraunces + Inter already loaded.

| Role | Family | Size | Color | Used for |
|---|---|---|---|---|
| Display | serif | text-5xl / sm:text-6xl | foreground | H1 only |
| Sub | serif | text-2xl, leading-snug | foreground/80 | Paragraph under H1 |
| Body | sans | text-base, leading-relaxed | foreground/80 | Example block, prose |
| Label | sans | text-[11px] uppercase tracking-[0.18em] | muted | Eyebrow only |
| Meta | sans | text-xs | muted | Header nav link, footer |

Concrete edits:

- **Header "about us" / "begin" link** (`Shell.tsx`): change from `font-serif text-sm` → `text-xs` (sans). Frees serif for content voice.
- **Sub paragraph** (`index.tsx`): change from `text-lg` (sans) → `font-serif text-2xl leading-snug`. Promotes it into the H1's voice family, removes one sans size.
- **Button** (`index.tsx`): change from `font-serif text-xl` → `font-serif text-lg`. Keeps serif (intentional brand moment) but shares the sub's serif size band instead of inventing a 4th serif size.
- **Bottom footnote** (`index.tsx`): remove. Its content ("anonymous", "built by parents") already lives in the footer; "skip anything" is implicit and was getting redundant.
- **Eyebrow + example body**: unchanged — already on-scale.

## 3. Spacing — two values only

Replace the four near-identical gaps (`mt-10`, three × `mt-12`, `mt-16`) with two:

- `mt-10` for tight relationship (H1 → sub, sub → promise area)
- `mt-16` for major section break (promise → "what this is" block, block → button)

Concrete in `index.tsx`:
- H1 → sub: `mt-10` (was `mt-10` ✓)
- Promise line: collapse into the same paragraph as sub (no gap), OR keep as separate paragraph with `mt-6` — pick one. Plan: keep as a separate paragraph with `mt-6` so the triple-negative still lands as its own beat, but visually grouped with the sub.
- Sub block → "what this is" block: `mt-16` (was `mt-12`)
- "what this is" block → button: `mt-16` (was `mt-12`)
- Remove bottom footnote and its `mt-12` entirely.

## 4. Footer — single line with copyright

`Shell.tsx`: collapse the two-row footer (added last turn) back to one line, since the bottom footnote in the hero is being removed and the footer is now the only meta surface. New shape:

```
held · anonymous · about us · privacy · © 2026
```

One row, `text-xs text-muted-foreground`, separators with `·`.

## Files touched

- `src/components/held/Shell.tsx` — logo color swap, header link → sans/xs, footer single line with copyright
- `src/routes/index.tsx` — sub → serif 2xl, button → serif lg, remove bottom footnote, normalize spacing

No CSS token changes, no new dependencies, no hero copy changes.
