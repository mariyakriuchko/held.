## About page + Privacy page (with editable copy file)

Two new routes. About is warm and human; Privacy carries the GDPR-required detail. **All privacy copy lives in a single editable file** so you can edit prose directly without touching React.

---

### 1. `/about` — `src/routes/about.tsx`

Single calm screen, same `Shell` + Fraunces voice as homepage.

```text
held.                                      about

we're a family of five
trying to understand
what it takes.

──── who ────
expats in berlin, both working parents, three kids
— 4, 8, and 12. twelve years in the city. we've
lived it all with them from birth toward teenage
years (almost there). we know, in our bones, what
it takes to raise kids in germany — and in a big
city specifically.

──── why ────
we're on a mission to recognise the effort and
the strength it takes. and, based on everything
we've lived, to build a help system that
anticipates and supports.

not a planner. not a to-do list. not a calendar.

──── your data ────
held is anonymous. we never share or sell your
answers. the patterns we see are used only to
build a more meaningful product for parents like
us. full details: privacy.

──── what's next ────
stay tuned. these things take time to build well —
and we care deeply about what this becomes. leave
your email and we'll keep you in the loop.

[ your email ]            [ keep me posted ]
```

- Eyebrows `who` / `why` / `your data` / `what's next`: `text-[11px] uppercase tracking-[0.18em] text-muted-foreground`.
- "not a planner. not a to-do list. not a calendar." — italic Fraunces, slightly larger, muted.
- "privacy" → `Link to="/privacy"`, ink-accent underline.
- Email block reuses the result-page form; writes to `subscribers` with `source: "about"`.
- `head()`: per-route title / description / og tags.

---

### 2. Editable privacy copy — `src/content/privacy.ts`

Plain TypeScript module exporting structured content. **This is the only file you need to touch to edit the privacy text.**

```ts
// src/content/privacy.ts
export const privacyMeta = {
  title: "privacy — held.",
  description: "how held handles your data. anonymous by design.",
  lastUpdated: "2026-05-05",
};

export const privacyIntro = `
held is built by parents, for parents. this page explains
what we collect, what we don't, and what your rights are.
plain language first; legal details below.
`;

export const privacySections = [
  {
    eyebrow: "who runs held",
    body: `
      held is run by [TODO: founder names].
      contact: [TODO: hello@held.tld].
      address: [TODO: berlin postal address].
    `,
  },
  {
    eyebrow: "what we collect",
    body: `
      an anonymous session id, your card reactions, optional
      reflection text, optional coping note, and your email
      only if you choose to leave one.
    `,
  },
  {
    eyebrow: "what we don't collect",
    body: `
      no account. no name. no ad tracking. no third-party
      analytics. no cookies beyond what's strictly needed
      for the app to work.
    `,
  },
  {
    eyebrow: "legal basis (GDPR art. 6)",
    body: `
      legitimate interest for anonymous product analytics;
      explicit consent for the optional email signup.
    `,
  },
  {
    eyebrow: "how we use it",
    body: `
      to show you your result, to compute aggregate patterns
      shown to other parents, and to improve the cards. your
      email is used only to send occasional product updates.
      we never share or sell your data.
    `,
  },
  {
    eyebrow: "how long we keep it",
    body: `
      anonymous reactions are kept indefinitely as part of the
      aggregate. emails are kept until you ask us to remove them.
    `,
  },
  {
    eyebrow: "who we share it with",
    body: `
      nobody. data is hosted on Lovable Cloud (Supabase, EU
      region) as our processor. we never sell or share data.
    `,
  },
  {
    eyebrow: "your rights (GDPR art. 15–22)",
    body: `
      access, rectification, erasure, portability, objection,
      and the right to withdraw consent. to exercise any of
      these, email [TODO: hello@held.tld].
    `,
  },
  {
    eyebrow: "complaints",
    body: `
      you can lodge a complaint with your local data protection
      authority. in germany, that's the BfDI or your state DPA.
    `,
  },
  {
    eyebrow: "changes",
    body: `
      last updated [see top]. we'll note any material changes
      here and on the homepage.
    `,
  },
] as const;
```

Edit headings via `eyebrow`, prose via `body`. Add or remove sections by editing the array. No React knowledge needed.

---

### 3. `/privacy` — `src/routes/privacy.tsx`

Thin shell. Imports from `src/content/privacy.ts` and renders the array.

```tsx
// pseudo-shape
import { privacyMeta, privacyIntro, privacySections } from "@/content/privacy";

// head() uses privacyMeta
// renders: headline → lastUpdated stamp → intro → sections.map(...)
```

- Headline: `privacy.` (Fraunces, large, ink-accent dot).
- Each section: small uppercase eyebrow + body paragraph(s), same rhythm as About.
- `lastUpdated` shown as small muted text under the headline.

---

### 4. Header + footer — `src/components/held/Shell.tsx`

- **Header:** small lowercase serif link on the right opposite `held.`:
  - on `/` and most routes → `about`
  - on `/about` → `begin` (links to `/`)
  - `text-sm text-muted-foreground hover:text-foreground`, no underline.
- **Footer:**
  ```
  held · anonymous · parents trying to understand parents · about · privacy
  ```
  `about` and `privacy` are `Link`s, muted-foreground.

---

### 5. Server function — `src/server/held.functions.ts`

Confirm `subscribeEmail` accepts an optional `source` string and writes to `subscribers.source` (column already exists). If missing, add it. No DB migration.

---

### Files

| File | Change |
| --- | --- |
| `src/routes/about.tsx` | New route. |
| `src/content/privacy.ts` | New file — all privacy copy lives here. |
| `src/routes/privacy.tsx` | New route — thin renderer over the content file. |
| `src/components/held/Shell.tsx` | Header `about`/`begin` link; footer `about` + `privacy` links. |
| `src/server/held.functions.ts` | Ensure `subscribeEmail` supports `source: "about"`. |

### Out of scope

- Impressum (German legal page) — depends on legal entity; flagged as follow-up.
- Cookie banner — not needed today (no non-essential cookies).
- No DB changes.

### Before publishing (you, not Lovable)

`src/content/privacy.ts` contains `[TODO: …]` markers for founder names, contact email, and postal address. Fill these in before sharing the site publicly.
