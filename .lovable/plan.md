## Goal

The result page today shows a beautiful headline card and a thin "what made up this picture" drawer (severity bars + secondary categories + one comparison line). The headline is doing all the work; the rest reads like footnotes.

This change keeps the headline card sacred and rebuilds the drawer into a real multi-dimensional reflection — four distinct "lenses" on what they just flagged, each one anchored in their own data, not generic.

The drawer stays collapsed by default (the moment is the headline). When opened, it now reveals something worth opening.

## The four lenses (inside the drawer)

```text
┌────── headline card ──────┐
│   "you're the one who…"   │
└───────────────────────────┘
        send this to someone →

(mission + email)

────── see what made up this picture ▾ ──────

  1. WHERE THE LOAD LIVES
     school messages           ████████░░  62%
     daily logistics           ████░░░░░░  25%
     appointments              ██░░░░░░░░  13%

  2. WHAT KIND OF WEIGHT
     "mostly the small accumulating stuff —
      the kind that doesn't show up until it slips."

  3. WHAT YOU SAID WEIGHS MOST
     – the holiday care registration that opens monday
     – the form for the dentist
     – the birthday present you still need to wrap

  4. NOT JUST YOU
     7 of the last 23 parents also flagged
     "the holiday care registration that opens monday."
```

### 1. Where the load lives — categories with %

Replace the current "and underneath that" list of category names with a small horizontal bar chart showing the top 3 categories by share of weighed reactions. Percentages computed from `top_categories_detailed` (already returned by the server, currently unused by the UI).

- Label: lowercase category short-name (`categoryShort()` already exists)
- Bar: `bg-foreground/80` on `bg-muted` track, same visual language as `SeverityBars`
- `%` right-aligned in serif

### 2. What kind of weight — severity profile sentence

Replace the raw `SeverityBars` with one calm, serif sentence derived from `dominant_severity` + the proportions in `severity_counts`. Examples:

- critical-dominant: *"mostly the heavy stuff — the kind with consequences if it slips."*
- medium-dominant: *"mostly steady weight — the constant low-grade tracking."*
- light-dominant: *"mostly the small accumulating stuff — the kind that doesn't show up until it does."*
- mixed (no tier > 55%): *"a mix — some heavy, some small, all of it on you."*

Bars feel like analytics; a sentence feels like recognition. We already say it visually in the headline; this names the *texture*.

### 3. What you said weighs most — the user's own words

Today the `weighs` flag only feeds the comparison stat. Surface it directly: list 2–4 of the scenarios the user actually checked as "this one weighs," verbatim, in serif italic. This is the most personal possible content on the page — it's literally what they pointed at.

Server change: `getResult` already builds `weighedScenarios` internally. Add `your_weighed: string[]` (top 4 by weight, scenario text) to the returned shape.

If there are 0 weighed cards, omit this lens entirely.

### 4. Not just you — the comparison

Keep the existing `top_card_comparison` block, but only show it when `also_flagged ≥ 2` and `sample_size ≥ 10` (right now the threshold is `also_flagged ≥ 1`, which can read as "1 out of 5 — basically nobody"). Tighten the copy:

> 7 of the last 23 parents also flagged
> *"the holiday care registration that opens monday."*

If the threshold isn't met, omit silently. A weak comparison is worse than none.

## Order and layout

Inside the drawer, stack the four lenses with generous vertical spacing (`space-y-10`) and a small uppercase eyebrow above each ("where the load lives", "what kind of weight", etc.) — same eyebrow style as today.

Each lens is independently optional: if there's no data for it, it's omitted, no empty state. The drawer only renders if at least one lens has content (already roughly the case via `hasDetails`).

## What we are NOT changing this round

- The headline card, share link, mission paragraph, and email form stay exactly as they are.
- No prompt changes.
- No new tables. The `weighs` boolean already exists on `reactions`.
- The "X parents recognized themselves this week" line at the bottom stays.

## Files

| File | Change |
| --- | --- |
| `src/server/held.functions.ts` | Add `your_weighed: string[]` to `getResult` return. Keep `top_categories_detailed` (already there). No DB or prompt changes. |
| `src/routes/result.$token.tsx` | Rebuild the drawer contents into the four lenses above. Replace `SeverityBars` with a derived sentence. Add a new `CategoryBars` component using `top_categories_detailed`. Render `your_weighed` as an italic serif list. Tighten the comparison threshold and copy. |

No DB migration. No backlog impact.
