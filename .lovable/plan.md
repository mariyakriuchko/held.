# Cards page — principal designer pass

Bring `src/routes/cards.tsx` in line with the held. voice: quiet, conversational, typographic. Less form, more letter.

## 1. Top meta row — drop the system labels

Current row carries three competing signals: `back`, `1 of 12`, and the uppercase severity label. The severity label is the loudest thing on the page and reads like a CMS tag.

- Remove `severityLabel(card.severity)` from the UI entirely (keep the data, just don't render it).
- Keep `back` (left) and `1 of 12` (right). Both stay `text-xs text-muted-foreground`.
- Result: header reads as quiet wayfinding, not categorization.

## 2. Cluster icon — remove

`<ClusterMark>` above the scenario adds a decorative beat that competes with the sentence. The scenario is the content; nothing should precede it.

- Delete the `<ClusterMark …/>` block.
- Scenario sits alone in the card body, vertically centered.

## 3. Answer choices — lines, not buttons

Currently bordered + `bg-card` + `rounded-md` boxes. Reads as a form. Switch to typographic lines with a dot marker.

- No border, no background, no card chrome.
- Each row: a small circle marker (8px) on the left, then the serif label.
- Default: hollow circle (`border border-foreground/30`), label `text-foreground/70`.
- Selected: filled green dot (`bg-[var(--accent-ink)]`), label `text-foreground`.
- Hover: marker border darkens, label goes to full foreground.
- Padding stays generous (`py-3`) so the tap target is unchanged; only the visual weight drops.
- Spacing between rows: `space-y-1` (lines, not stacked cards).

This also resolves the `rounded-md` (buttons) vs `rounded-full` (pill) collision — answers stop being shaped at all.

## 4. "weighs on me" pill — keep, but quiet it

The pill is the one place a brand accent earns its keep (a moment of self-awareness). Keep it round, but tone the inactive state.

- Inactive: drop the border to `border-foreground/15`, label `text-muted-foreground`, no bg.
- Active: keep `ink-accent` text + `bg-accent/10`, drop the border to `border-accent/40`.
- Icon size unchanged.

## 5. Completion + skip copy

`done →` is transactional. Soften to match the rest of the voice.

- Last card: `done →` becomes `that's all →`.
- Mid-deck: `next →` stays (it's already neutral).
- `skip` stays.

## 6. Card 1 footnote — move out

The "tap weighs on me… you can go back" line is onboarding instruction sitting on a content card. It's the right info, wrong place.

- Remove from `cards.tsx` and do not put it into homepage.

## 7. Transition rhythm — stagger

Today scenario and answers fade together (220ms). Stagger so the card "speaks first."

- Scenario block: fade in at 0ms, duration 240ms.
- Answers + footer block: fade in at ~120ms delay, duration 240ms.
- Implement with a second state or a `delay-[120ms]` utility on the lower block.
- Out-fade stays synchronous (220ms) so navigation feels crisp.

## Priority

1. **High** (biggest voice shift): #3 answer lines, #2 remove cluster icon, #1 remove severity label.
2. **Medium**: #4 pill quieting, #5 copy softening, #6 move footnote.
3. **Polish**: #7 staggered fade.

## Files touched

- `src/routes/cards.tsx` — all visual changes above.
- `src/routes/begin.tsx` — optionally absorb the moved footnote (one line under the existing intro).

No token changes, no new components, no new dependencies.