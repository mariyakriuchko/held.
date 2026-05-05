## Goal

Turn the result page into one continuous "moment": a single shareable card with a short, validating sentence — not a split report. Details collapse behind a quiet toggle so nothing competes with the headline.

## 1. Headline rewrite (recognition baked in)

Update `generateHeadline` in `src/server/held.functions.ts`:

- Hard cap: **one sentence, max 22 words**.
- Must open with recognition of the user being the one tracking everything no one else sees (rotate phrasing so it doesn't feel templated).
- Weave in **one** specific scenario (not 2–3). The specifics live in the expandable section below.
- No judgment, no accusation, no "you carry too much" framing — pure validation.
- Lowercase, calm, no therapy-speak, no greetings, no quotes.

New system prompt direction:
> "one sentence, max 22 words. open by naming that they're the one keeping track of what no one else sees / a step ahead on the invisible stuff. then anchor it with ONE specific scenario from their list, paraphrased. lowercase, calm. no judgment, no 'too much', no 'you're not alone'. they should read it and think 'yes, that's me'."

Also wipe the cached `headline` column so existing sessions regenerate with the new shape (migration: `update sessions set headline = null;`).

## 2. Style it as a shareable card (B + touch of C)

In `src/routes/result.$token.tsx`:

- Wrap the headline in a card: soft border, generous padding (≈48px), rounded-2xl, subtle background (`bg-card`), a small mark/glyph at top, and tiny "— held" footer label at the bottom right. This makes it screenshot-worthy.
- Large italic serif treatment with hanging opening quote.
- Touch of C (ceremony): on first mount, fade + slight rise-in animation (≈600ms) so the sentence "lands" rather than appears.
- Card width constrained (max-w-prose) and centered; everything else on the page sits visually below it as secondary.

```text
┌──────────────────────────────────┐
│  ·                                │
│                                   │
│     "you're the one keeping       │
│      the school messages in       │
│      your head, a step ahead      │
│      no one else sees."           │
│                                   │
│                         — held    │
└──────────────────────────────────┘
```

## 3. One unified CTA block (fix the split)

Right under the card, a single block in this order — no section break between them:

1. **Share** button (primary, full width): "send this to someone who'd get it"
2. Inline, smaller below it: "and tell us where to send what comes next →" + email field + button

No divider, no heading — they read as one continuous CTA. The email line sits visually subordinate to the share button (smaller font, muted) so it stops feeling like a second section.

## 4. Details collapse by default

Currently "what it looks like for you", "and underneath that", and "others carrying the same thing" sit open and dilute the headline.

Replace with a single quiet expandable region under the CTA block:

- Collapsed default: a single muted line — `the detail ↓` (or similar — copy: "see what made up this picture").
- Expanded: shows all three current sections (severity bars, secondary categories, comparison stat) inside one panel, separated by light spacing instead of full top borders.
- Use the existing `src/components/ui/collapsible.tsx` (Radix), animated expand.
- "others carrying the same thing" stays inside the expansion — it's supporting evidence, not the headline.

The "X parents this week" line and "start again" stay at the bottom as today, outside the collapsible.

## 5. Section renames inside the expansion

- `what it looks like for you` → keep
- `and underneath that` → keep
- `others carrying the same thing` → keep
(Naming is fine once they're tucked inside the expansion — they no longer compete with the headline.)

## Technical summary

| File | Change |
|---|---|
| `src/server/held.functions.ts` | Tighten `generateHeadline` prompt: 1 sentence ≤22 words, recognition-first, 1 specific. |
| `supabase/migrations/<ts>_reset_headlines.sql` | `update public.sessions set headline = null;` so cached long ones regenerate. |
| `src/routes/result.$token.tsx` | Card wrapper around headline, fade-in animation, unified Share+Email CTA block (no divider), wrap all detail sections in one `Collapsible` collapsed by default, remove top borders between detail subsections. |
| `src/styles.css` (if needed) | One small keyframe for the fade/rise-in on the headline card. |

No DB schema changes beyond the data reset. No new dependencies — Radix Collapsible is already installed.

## Out of scope (logged for later if you want)

- Tap-to-reveal word-by-word ceremony (full option C) — heavier interaction; revisit if the fade-in card doesn't feel ceremonial enough.
- A dedicated OG share image generated server-side from the headline card — would make link previews match the on-page card exactly.
