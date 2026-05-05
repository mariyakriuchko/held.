# Result page — make the core message land

The result page right now opens with a category fragment ("the school messages.") and a vague subline. The user reads it and goes "…ok?" instead of "YES, this is exactly us." Fix: lead with a real sentence built from *their actual weighed cards*, then push everything else down.

---

## What the page looks like, top to bottom

1. **The headline sentence** — 1–2 sentences in the user's voice, generated from the specific scenarios they flagged. This is the whole point of the page.
  - Example shape: *"you're the one tracking the permission slips, the dentist appointment nobody else remembers, and which kid needs which lunchbox by tuesday — and none of it is written down anywhere but in your head."*
  - Generated server-side from the top weighed cards via Lovable AI (`google/gemini-2.5-flash`).
  - Persisted to `sessions.headline` so reloads + the shared `/r/$token` view are stable.
2. **Share + email, together** — one block, immediately under the headline, while recognition is hot.
  - Primary button: *"send this to someone who'd get it"* (existing share)
  - Directly under it, inline: *"and tell us where to send what comes next"* + email field
  - Replaces today's layout where share is mid-page and email is buried at the bottom.
3. **Supporting detail** (below the CTA, calmer):
  - **Rename** "the shape of it" → **"what it looks like for you"** (heavy/medium/light bars)
  - **Rename** "also showing up" → **"and underneath that"**
  - **Rename** "you're not alone in this" → **"others carrying the same thing"** (comparison stat)
  - Drop the "here's what came up" eyebrow — the headline does that work now.
4. Footer: parents-this-week stat + "start again" link (unchanged).
5. **"What helps you cope?" form — removed for now.** Logged in `.lovable/backlog.md` to revisit once the admin dashboard exists and we have a way to act on the signal. Possibly returns later as a one-line prompt inside the email-confirmation state, so it doesn't compete with the core moment.

---

## How the headline gets generated

New column on `sessions`: `headline text` (nullable). Populated once on first `getResult` call when null.

In `getResult`:

- Collect the user's top ~5 weighed scenarios (`weighs=true` OR `reaction='this_is_my_life'`).
- Call Lovable AI with a tight system prompt:
  > "write one short paragraph (max 2 sentences, ~40 words) that names what this parent is carrying, in second person, lowercase, calm, specific. use 2–3 of the scenarios they flagged. no therapy-speak. no 'you are not alone'. make them feel seen and get the feeling - 'YES, this is my reality!'."
- Pass the actual scenario strings + dominant category as context.
- Persist the result back to `sessions.headline`. Wrapped in try/catch — never blocks the page.
- Fallback (AI fails or <2 weighed cards): a tightened templated sentence built from category + severity (close to today's copy).

---

## Technical changes

- **Migration**: `alter table sessions add column headline text;`
- `**src/server/held.functions.ts**`:
  - Extend `getResult`: fetch session with `headline`; if null and weighed cards ≥2, call Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`, `LOVABLE_API_KEY`), write back, return.
  - Helper `generateHeadline(scenarios, category, severity)` colocated in the same file, fully error-handled.
  - Return shape gains `headline: string | null`.
  - Remove `submitCoping` server function (and its client import).
- `**src/routes/result.$token.tsx**`:
  - Replace top block with the headline rendered in serif.
  - Move `EmailCapture` directly under the share button as one combined CTA block.
  - Rename section eyebrows as listed above.
  - Remove `CopingForm` component, the toggle button, and related state.
  - Update `head()` `og:description` to use the headline when present (much better link previews).

No new routes. No other schema changes. The `coping` table stays in the DB untouched (no destructive migration) so the backlog idea can resume later without data loss.

---

## Backlog entry (created in `.lovable/backlog.md`)

```
## coping prompt — paused 2026-05-05
- Cut from result page to keep the headline → share → email flow uncluttered.
- DB table `coping` left in place; no data lost.
- Revisit when:
  1. admin dashboard (Step 4) exists so we can actually read the signal, AND
  2. we have a content/feature loop that uses "what helps".
- Likely return shape: one optional line inside the email-confirmation state
  ("before you go — what helps when it's heavy?"), not a separate section.
```

---

Approve and I'll implement.