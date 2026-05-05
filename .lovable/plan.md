## Changes

### 1. Headline prompt — force the subject

In `src/server/held.functions.ts`, update the `generateHeadline` system prompt so the sentence **must** begin with `you`, `you're`, or `you've`. The model has been dropping the subject (e.g. *"the one who sees the next step…"*) — fix it explicitly and give it varied opening templates to choose from.

New constraint added to the prompt:

- "the sentence MUST start with the word 'you' or 'you're' or 'you've' — never drop the subject, never start with 'the one'."
- Varied opening examples: `"you're the one who…"`, `"you remember…"`, `"you've been holding…"`, `"you keep track of…"`.

Also wipe cached headlines again so existing sessions regenerate cleanly:

```sql
update public.sessions set headline = null;
```

### 2. CTA — email primary, share secondary

In `src/routes/result.$token.tsx`, restructure `ShareAndEmail` so the page has **one clear primary action**:

- **Primary:** email field + "keep me posted" button (full-width, sits directly under the headline card).
- **Secondary:** small text link below — `"or send this to someone who'd get it →"` — which still triggers the share/copy flow.

Layout:

```text
[ your email — for what comes next ]  [ keep me posted ]

         or send this to someone who'd get it →
```

When email is submitted successfully, the share link stays available (still useful, just not primary). When share copies the link, show "link copied" inline next to the secondary link.

### 3. Social proof line rephrase

In `src/routes/result.$token.tsx`, replace:

> "14 parents sat with these cards this week."

with:

> **"14 other parents recornized themselves in these cards this week."**

(Singular form: "1 other parent saw themselves in these cards this week.")

This ties directly to the "yes, that's me" goal of the headline — reinforces recognition + freshness, removes the vague "sat".

## Files


| File                                              | Change                                                                                         |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/server/held.functions.ts`                    | Tighten headline prompt to require `you`-prefix subject.                                       |
| `supabase/migrations/<ts>_reset_headlines_v2.sql` | `update public.sessions set headline = null;`                                                  |
| `src/routes/result.$token.tsx`                    | Restructure `ShareAndEmail` (email primary, share secondary link); rephrase social-proof line. |


No new dependencies, no schema changes.