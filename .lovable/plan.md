## Held (working name) — v0 Plan

A quiet, honest research tool for parents. Not a quiz. Not a productivity app. A short experience that says *"you're not the only one carrying this"* — and in exchange, captures real signal about what modern parents actually hold in their heads.

Working name kept as **Held** for now (parked for later revision).

---

## What we're optimizing for

One feeling: **"someone finally said it out loud."**

If a parent reaches the end and forwards the link to one other parent with a message like *"this one"* or *"read this"* — v0 worked. Everything else (data, archetypes, growth) follows from that.

---

## The flow (5 screens)

```
Hero  →  Onboarding (3 Qs)  →  Cards (~16)  →  Reflection  →  Result  →  (optional) Coping
```

### 1. Hero
- One sentence, large, lots of breathing room:
  *"You're carrying more than anyone sees."*
- Sub: *"A quiet two minutes about the invisible part of parenting. No advice. No score. No fixing."*
- Single button: **Begin**
- Tiny line below: *"~2 minutes. Anonymous. We're parents trying to understand parents."*

### 2. Onboarding (3 questions, one screen, no progress bar)
1. **You are…** Mother / Father / Co-parent or other / Prefer not to say
2. **How many children?** 1 / 2 / 3+
3. **Ages** (multi-select chips): 0–2 / 2–4 / 5–7 / 8–10 / 11+

Rationale for keeping the parent-role question: the mental load gap between mothers and fathers is the single most important variable in this research. Without it, "not my world" from a father and "this is my life" from a mother collapse into noise. It's one tap, and it changes the integrity of every downstream insight.

### 3. Cards (~16 shown from a pool of ~25)
- One card at a time. Centered. Full attention.
- Card text is a specific, mundane scenario — not a category label.
  - *"You're the one who notices the shoes are getting tight."*
  - *"You wake up already running through tomorrow's logistics."*
  - *"You remember which friend's birthday party is this weekend, which gift is wrapped, and which one still needs a card."*
- Three reactions, no icons screaming at you:
  - **this is my life**
  - **rarely**
  - **not my world**
- Optional fourth micro-action on each card: a small, ghosted *"this one stings"* tap — silent signal, no UI change. High-value research signal for which cards land hardest.
- Subtle progress: *"4 of 16"* in small muted text. No bar, no gamification.

### 4. Reflection (one open text field, optional)
- Prompt: *"What's one thing you carry that wasn't on any card?"*
- Placeholder: *"Or skip — it's okay."*
- Skippable. No character counter. No "great answer!" feedback.

### 5. Result (minimal, one insight)
- One sentence, hand-written tone, based on top 2–3 categories:
  - *"Most of what you carry is the noticing — the small things no one else sees coming."*
- Below it, three soft lines: the categories that came up most for you, in plain language.
- One quiet line: *"You're not the only one. [N] parents told us the same this week."*
- Two actions:
  - **Send this to someone who'd get it** (copies a personal link)
  - **Read what other parents said** (link to a small public reflections wall — moderated, no names)

### 6. After the result — coping question (optional, framed gently)
- One screen, appears after result, easy to dismiss.
- *"Last thing — and only if you want. When the load gets heavy, what actually helps you cope right now?"*
- Free text + 4 optional chips to make it easier to start: *talking to a friend / time alone / scrolling / nothing really works right now*
- This is where we learn the gap between what parents need and what's available — critical for whatever Held becomes next. Placing it after the result (not before) protects the emotional arc and still captures the answer from the people who felt seen.

---

## Tone & voice rules (locked)

- **Permission, not prescription.** Never "you should," "try this," "here's a tip."
- **Naming what's already true**, not adding tasks.
- **Lowercase, short sentences, generous whitespace.** Closer to a handwritten note than an app.
- Words to **never use** in v0: *productivity, optimize, balance, hack, journey, mindful, self-care, score, archetype, level.*
- Words that belong: *carry, hold, notice, remember, slip, quiet, enough.*

---

## Visual direction

One sentence: **a quiet room, not a feed.**

- **Palette:** off-white background (warm, paper-like, not pure white), deep ink text, one muted accent (dusty terracotta or soft sage — picked in build). No gradients, no glassmorphism, no shadows-as-decoration.
- **Typography:** one serif for the cards and hero (something humane like Source Serif or Fraunces), one clean sans for UI. Generous line height. Text is the design.
- **Imagery:** none in v0. No stock parent photos. No illustrations of smiling families. The absence of imagery *is* the statement — this is not Instagram parenting.
- **Motion:** slow, almost imperceptible. Cards fade between, don't slide. No bounces, no confetti, no "✨". Reactions register with a gentle dim, not a celebration.
- **Layout:** mobile-first, single column, max ~520px content width even on desktop. The product should feel the same on a phone in bed at 11pm as on a laptop.
- **What it must NOT feel like:** a quiz, a wellness app, a corporate survey, a Calm/Headspace clone, a BuzzFeed result page.
- **What it should feel like:** the second page of a thoughtful book. A friend's text. A pause.

---

## Data model (Lovable Cloud / Supabase)

```
sessions     (id, token, parent_role, num_children, age_bands[], created_at, channel)
cards        (id, category, scenario, age_tags[], role_tags[])
reactions    (session_id, card_id, reaction, stings boolean, created_at)
reflections  (session_id, text, created_at)
coping       (session_id, text, chips[], created_at)
shares       (session_id, channel, created_at)   // for attribution
```

No accounts. Session token in a cookie. Public result page at `/r/<token>` with strong OG meta for shares.

---

## Card seed (~25 cards across categories)

Categories (internal, never shown to user): *noticing, remembering, anticipating, soothing, mediating, logistics, identity-loss, invisible-decisions.*

Cards drafted in build, reviewed together before launch. Goal: every card should make at least one parent in our test group quietly say "yeah."

---

## Out of scope for v0 (explicit)

- Archetypes, heatmaps, comparison charts
- Email capture as a gate (we'll add a soft optional capture on the result page only)
- Auth, accounts, history
- Image-card sharing (OG meta only)
- Localization (English only)
- Admin dashboard (we'll read data via Supabase directly for week 1)

---

## Success signals for week 1

1. **Completion rate** above 60% from card 1 to result.
2. **Forward rate**: % of finishers who copy the share link.
3. **Reflection fill rate**: % who write something in the open field. This is the resonance proxy.
4. **"Stings" taps per session**: tells us which cards do the real work.
5. **Qualitative**: read every reflection by hand for the first 200 sessions.

---

## Technical notes (for build)

- TanStack Start, file-based routes: `/`, `/begin`, `/cards`, `/reflect`, `/result/$token`, `/r/$token` (public), `/wall`.
- Cards served from DB, shuffled per session with age/role weighting.
- Result page server-rendered with per-token OG meta tags.
- All reactions written optimistically; no loading spinners in the card flow.
- Mobile-first, no layout shift, no font flash (preload the serif).

---

## What I need from you next (after approval)

1. Sign-off on the parent-role question staying in onboarding.
2. A pass on the 25 card scenarios once drafted — your ear for what's real matters more than mine here.
3. A working name decision (parked — we ship under "Held" and revisit before any external sharing).
