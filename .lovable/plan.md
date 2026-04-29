## Realignment

The current prototype is pointed at emotional recognition. The doc points at something different: a **diagnostic** that surfaces *which concrete operational moments* (school comms, deadlines, kid prep, appointments, social obligations) cause the most missed-ness, guilt, and load — across a spectrum from critical to small-but-nagging. That spectrum is the point: it shows what kind of load actually weighs, not just that load exists.

Tone stays warm and non-judging. Content gets concrete and situational. The word "quiet" is removed.

---

## 1. Card content — full rewrite

**25 cards across 5 clusters, mixed severity.** Each card a specific recurring moment. Phrasing rule: situation-first when it works, statement-form ("you're tracking…") when it reads more naturally — **never "only you"**. Carry pronouns sparingly; default to describing the moment.

Categories (internal):

- `school_comm` — interpreting messages, knowing what needs action
- `deadlines_prep` — registration, payments, costume day, materials
- `appointments` — long-range medical, referrals, vaccinations
- `social_obligations` — gifts, snacks, events, group expectations
- `daily_logistics` — small recurring stuff (shoes outgrown, library books due)

**New severity tag** on each card: `critical` / `medium` / `light`. Used internally to balance the deck (e.g. 16 cards = 5 critical + 7 medium + 4 light) and analyze which severity creates strongest "weighs on me" signal.

Sample rewrites (illustrative — full set drafted in build, reviewed before launch):

- *School email lands at 9pm. Permission slip needed by tomorrow morning. Printer's out of ink.* (school_comm, medium)
- *The dentist said "see you in six months" — that was eight months ago.* (appointments, medium)
- *Costume day is Friday. The email said this two weeks ago.* (deadlines_prep, medium)
- *Someone in the class chat is collecting for the teacher's gift. €15 by Thursday.* (social_obligations, light)
- *The indoor shoes are getting tight. No one's said anything yet.* (daily_logistics, light)
- *Holiday care registration opens Monday. Spots fill in two days.* (deadlines_prep, critical)
- *The vaccination reminder card has been on the fridge since March.* (appointments, critical)
- *A WhatsApp poll about next week's outing. Already 14 replies. Yours isn't one of them.* (school_comm, light)

The full 25 will be drafted in the same edit batch, you review before merge.

---

## 2. Card UX fixes

**Three reactions, plain language, no "only" framing:**

- *happens in our house*
- *rarely*
- *not the case*

**Plus a "skip" link** below the choices on every card (and every onboarding question). Skips count as no-answer in the data, not as a third option.

**"This one weighs" — moved up and made obvious:**

- A small icon button (Lucide `Bookmark` or a hand-drawn dot mark) sits **inline with the reaction buttons**, top-right of the card area, with a one-word label *"weighs"* underneath
- Tap toggles a filled state with a soft color shift
- Tooltip on hover / first-time helper text underneath: *"tap if this one sticks with you"*
- Tappable before, during, or after picking a reaction — independent signal
- Renamed in code from `stings` → `weighs` (less dramatic, matches the doc's language about cognitive load)

---

## 3. Onboarding fixes

- Add **"skip"** option / link to every question
- Keep parent role question (mother / father / co-parent / prefer not to say)
- Drop the line "so the cards can find you" (too cute, slightly creepy)
- New header: *"three quick questions before we start"* — neutral, no "quiet"

---

## 4. Copy sweep — remove "quiet"

Pass through every screen and replace:

- Hero sub: *"A quiet two minutes about the invisible part of parenting"* → *"Two minutes on the invisible part of parenting. No advice, no score, no fixing."*
- `/begin` heading: *"first, three quiet questions"* → *"three quick questions before we start"*
- Loading state: *"a moment…"* → *"loading…"*
- Footer: *"held · anonymous"* → *"anonymous · we're parents trying to understand parents"*
- Any other instance of "quiet/quietly" — gone

---

## 5. Visual direction — color + texture + hand-drawn marks

**Palette additions (still warm, paper-based):**

- Keep paper off-white background but add a subtle SVG paper-grain texture at ~4% opacity, fixed to body
- Keep dusty-terracotta as primary accent
- **Add second accent:** muted sage green (`oklch(0.62 0.06 145)`) — used sparingly for the "weighs" filled state and category dots
- **Add tertiary warm:** soft mustard (`oklch(0.78 0.09 85)`) — used only for emphasized words in headings (one or two per screen, max)

**Typography gets bolder:**

- Hero heading scales up (5xl → 6xl on desktop) with selective color emphasis on one phrase
- Card text stays Fraunces serif but at 28–32px with tighter leading; bigger on desktop than today
- Add a small sans-serif eyebrow label above each card showing its severity in plain language: *"happens often"* / *"the small stuff"* / *"the big slips"* — gives texture without revealing the analytical category

**Hand-drawn marks (SVG, inline, hand-sketched look):**

- A small hand-drawn mark per cluster, shown as a tiny watermark in the card corner: a shoe, a calendar X, a stethoscope, a gift box, a coffee cup
- One hand-drawn underline mark on the hero's emphasized word
- A hand-drawn dot/asterisk used as the toggle icon for "weighs"
- Source: generate as inline SVG paths (no external deps), kept in `src/components/held/marks/`

**Motion:** unchanged — soft fades, no bounces.

---

## 6. Data model changes

Migration to add:

- `cards.severity` text column (`critical` / `medium` / `light`), default `medium`
- Rename `reactions.stings` → `reactions.weighs` (boolean, default false)
- Allow `reactions.reaction` to accept value `'skip'` (no schema change, just a new allowed string)
- Allow onboarding fields to be null (already nullable in schema — confirm and handle in client)

Re-seed the `cards` table with the rewritten 25-card set (truncate + insert).

---

## 7. File-level technical changes

- `**supabase/migrations/<new>.sql**` — add `severity` column, rename `stings` → `weighs`, truncate + reseed cards with new content + severity + cluster tags
- `**src/integrations/supabase/types.ts**` — auto-regenerated, no manual edit
- `**src/lib/session.ts**` — rename `stings` → `weighs` on the reaction shape; add `'skip'` to `Reaction` union; allow nullable onboarding values
- `**src/server/held.functions.ts**` — `getDeck()` updated to balance by severity (5 critical + 7 medium + 4 light), still weighted by parent role / age bands; saving reactions writes `weighs` instead of `stings`; result aggregation tallies top **clusters × severity** so the result line can say e.g. *"the small daily stuff is what's adding up for you"* vs *"it's the big slips that weigh"*
- `**src/styles.css**` — add sage + mustard tokens, add paper-grain background, scale up serif sizes
- `**src/components/held/Shell.tsx**` — add fixed paper-grain layer, update footer copy
- `**src/components/held/marks/**` (new) — 6 inline-SVG hand-drawn mark components (Shoe, Calendar, Stethoscope, Gift, Cup, Underline, Dot)
- `**src/routes/index.tsx**` — bigger hero, color emphasis on one phrase, hand-drawn underline, copy update
- `**src/routes/begin.tsx**` — add skip link per question, remove "quiet", new header
- `**src/routes/cards.tsx**` — new layout: severity eyebrow + cluster mark + card text + 3 reactions + skip link; "weighs" button moved inline near choices with clear label and helper text on first card; rename `stings` references; drop "quiet" loading copy
- `**src/routes/reflect.tsx**` — copy sweep, add explicit skip button (not just empty submit)
- `**src/routes/result.$token.tsx**` — result sentence now reflects severity pattern, not just category; copy sweep
- `**src/routes/r.$token.tsx**` — copy sweep on OG meta

---

## 8. Out of scope (still)

- Auth / accounts
- Email capture
- Reflections wall
- Localization
- Image-based share cards
- Working name change ("Held" stays for now)

---

## What I'll bring back to you for sign-off after build

1. The full 25-card list with cluster + severity tags, before the migration runs
2. A screenshot of the new card screen so you can react to the visual direction before I touch every other route
3. The exact result-page sentence templates (one per dominant pattern)

If any of the 8 sections above need adjustment, push back now — once approved I'll build it in one pass.