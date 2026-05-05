## Save the honest read-out into `.lovable/backlog.md`

Append the full assessment to the existing backlog file as a new dated section, so each blocker becomes a referenceable item we can work through one by one.

### File change

`.lovable/backlog.md` — append below the existing "coping prompt" section:

```markdown
---

## Honest read of where Held is — 2026-05-05

Reference assessment. Each numbered blocker below is a candidate work item;
we'll convert them into individual plans as we pick them up.

### What the product is supposed to do
A two-minute, no-advice, no-score reflective experience that makes the
invisible mental load of parenting visible — and is supposed to grow into a
"system that anticipates and supports". Current funnel:
landing → onboarding → cards → reflection → result → share.

### What's working
- **Tone & craft.** Writing, typography, paper aesthetic, restraint. Strongest
  asset — do not dilute.
- **Funnel is end-to-end.** Onboarding, deck, reactions, reflection, result,
  share, coping all wired to the DB. 13 sessions / 50 reactions in.
- **Tech foundation is clean.** Server functions, RLS, no admin-key leaks,
  sensible schema.

### Blockers (ranked)

1. **Result page doesn't deliver on the headline promise.**
   Promise: "you see the shape of what you're carrying, and how it compares
   to other parents." Reality: one category label + a count. Not a shape, not
   a comparison. Biggest single risk to retention/sharing/monetisation.

2. **There is no "next" — and we've told the user there will be one.**
   About says "stay tuned." Result says "start again." No email capture, no
   account, no return path. Every visitor is one-shot. Add a soft email
   capture on the result page. *(partially addressed — keep validating.)*

3. **Card deck is too small and too static.**
   ~64% of the deck served per session; re-visits feel repetitive. Cards
   aren't personalised by `role_tags` / `age_tags` even though the columns
   exist. Either use the tags or remove the onboarding (currently theatre).

4. **Collecting data with no way to look at it.**
   No internal view. Can't answer "which cards resonate?", "what are parents
   writing in?", "where do they drop off?". Minimal password-gated admin page
   reading aggregates would unblock every future product decision.

5. **"Comparison to other parents" is a hollow number.**
   `parents_this_week` is a count, not a comparison. Real version: "7 in 10
   parents who took this also flagged 'school messages' as weighing." Data
   exists to compute it.

6. **Mobile / one-handed reality is unverified.**
   Card screen, reflect textarea, share sheet, copy-to-clipboard fallback
   all need a real phone pass at 10pm-in-bed conditions.

7. **About page is a values statement, not a proof of trust.**
   No faces, no names, no contact, no explicit privacy statement, no "what
   we do with your answers." The "anonymous" promise lives in the footer;
   it should be explicit on About.

8. **Anti-spam / abuse is missing.**
   Public INSERT on `sessions`, `reactions`, `reflections`, `coping` with no
   rate limit, no captcha. One script can poison the dataset (and the
   comparison stat we eventually build on it). Cheap now, painful later.

9. **SEO / discovery is undefined.**
   No sitemap, no structured data, no content surface, no target keyword.
   "Mental load parenting" is a real search; held isn't on it. Growth is
   100% word-of-mouth via share — which only fires after a strong result
   (see #1).

10. **Product thesis is still a diagnostic, not a "system".**
    About promises anticipation and support. Today held is a one-shot
    diagnostic — no second session, no memory, no anticipation. Fine as MVP
    positioning, but every roadmap item should be evaluated against "does
    this move us from diagnostic to system?"

### Suggested order of attack
1. Stronger result page (multi-dimensional: top categories %, severity
   sentence, what weighs, one real comparison stat).
2. Email capture on result. *(in progress)*
3. Personalise the deck by `role_tags` / `age_tags`.
4. Internal data view.
5. Grow the deck to ~40–60 cards.
6. Rate limiting + basic abuse protection before any growth push.
7. Then: saved sessions, returning users, gentle weekly check-ins.
```

### Out of scope for this step
- No code changes, no DB changes.
- We're just persisting the document so we can pick items off it next.
