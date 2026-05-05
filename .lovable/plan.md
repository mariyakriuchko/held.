# Roadmap — fix the critical gaps, one step at a time

We'll tackle the four blockers from the critical review in order of impact. Each step is a self-contained shippable change so we can pause, review, and adjust between them.

---

## Step 1 — Stronger result page (highest impact)

**Goal:** turn the result from a single label into a real "shape of your load" that feels worth sharing.

What changes on `/result/$token`:
- **Severity profile**: aggregate the user's `weighs=true` reactions by `cards.severity` (low / medium / high) and show a small 3-bar breakdown ("3 heavy · 5 medium · 2 light").
- **Category breakdown**: group weighed cards by `cards.category`, show top 3 ("school logistics · sleep · admin").
- **Comparison stat**: for the user's top-weighed card, compute "X out of last 100 parents also flagged this" from `reactions` table. Falls back gracefully if sample is small.
- **Keep** the existing label + session count, but reframe as supporting context.

Technical:
- New server fn `getResultProfile(token)` in `src/server/held.functions.ts` — does the joins/aggregations server-side.
- Update `src/routes/result.$token.tsx` to render the new sections with the same calm serif aesthetic.
- No schema changes needed.

---

## Step 2 — Email capture ("tell me when there's more")

**Goal:** give users a return path so the "stay tuned" promise is real.

- Soft, optional input at the bottom of the result page: *"want to hear when we add new things? leave your email."* No account, no password.
- New table `subscribers` (`id`, `email` unique, `session_id` nullable, `created_at`). RLS: public INSERT only, no SELECT.
- Server fn `subscribeEmail({ email, sessionId })` with basic email validation + duplicate-safe insert.
- Same input also appears on the new About page (Step 4 dependency, optional now).

---

## Step 3 — Personalized deck (make onboarding matter)

**Goal:** the role/age questions currently do nothing — fix that.

- Update `getDeck` in `src/server/held.functions.ts` to filter `cards` where:
  - `role_tags` overlaps the session's `parent_role` (or empty array = applies to all)
  - `age_tags` overlaps the session's `age_bands` (or empty = all)
- Fallback: if filtered deck < N cards, top up with general cards so flow never breaks.
- No UI changes; the onboarding answers start mattering immediately.

---

## Step 4 — Internal dashboard (evidence to iterate)

**Goal:** a private page to see what's actually happening.

- New route `/admin` gated by a single shared password (env var `ADMIN_PASSWORD`), stored in sessionStorage after entry. Not user accounts — just a soft gate for the team.
- Server fn `getAdminStats()` returns:
  - sessions per day (last 30 days)
  - top 10 most-weighed cards
  - top 10 most-skipped cards
  - drop-off: % of sessions that finish the deck vs. abandon
  - email signups count
- Renders as plain tables/sparklines — function over form.

---

## Out of scope (for now)
- Rate-limiting on public INSERTs — note it as a follow-up; current volume doesn't warrant infra yet.
- SEO/discovery surfaces — separate workstream once the product loop is tighter.
- About page + analytics from the previous plan — we can fold those in after Step 2 if you want, or before. Let me know.

---

## Suggested order of execution
1. Step 1 (result page) — biggest perceived value jump
2. Step 2 (email capture) — unlocks retention
3. Step 3 (personalized deck) — closes the onboarding loop
4. Step 4 (admin dashboard) — gives us data to decide what's next

Approve and I'll start with Step 1 only. We review before moving to Step 2.
