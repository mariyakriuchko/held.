## Changes

### 1. Card signature — match the logo

The site logo is just lowercase serif `held.` with a trailing dot — there's no graphic. The card currently shows `— HELD` in caps, which clashes.

Fix: replace the all-caps signature with the same lowercase serif treatment as the header logo.

```text
                                                — held.
```

- lowercase, serif (Fraunces), muted-foreground color
- trailing `.` in foreground color (matches header)
- no tracking/uppercase
- right-aligned, small (`text-sm`)

(A graphic logo or grey-scale variant would compete with the headline; matching the typographic logo as a quiet signature keeps the card clean and shareable.)

### 2. Re-add the share link below the card

User insight: people are sharing the **card itself**, so the share affordance belongs adjacent to the card — not buried after the email form.

Layout becomes:

```text
┌────── headline card ──────┐
│   "you're the one who…"   │
│                   — held. │
└───────────────────────────┘

       send this to someone who'd get it →

──────── (small spacer) ────────

we're building a quiet support system for parents
carrying the invisible load. it's early, and we
care deeply about what it becomes — leave your
email and we'll keep you in the loop.

[ your email ]              [ keep me posted ]
```

So:

- **Right under the card:** small centered share link `"send this to someone who'd get it →"` (becomes `"link copied"` on click).
- **Then a short spacer.**
- **Then the mission statement** (see #3) immediately followed by the email field + button.

The bottom "or send this to someone…" link is removed (it's now above, near the card).

### 3. Mission statement above the email

Add a short paragraph between the share link and the email form. Copy:

> we're building a support system for parents carrying the invisible load. these things take time to build well — and we care deeply about what this becomes. leave your email and we'll keep you in the loop.

Style: small, calm, muted-foreground, serif, max ~2 lines wide so it doesn't feel like marketing copy.

## Files


| File                           | Change                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/result.$token.tsx` | Card signature → lowercase serif `— held.`; move share link to directly under the card; add mission-statement paragraph above the email form; remove the duplicate bottom share link. |


No prompt or DB changes this round.