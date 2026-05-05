# Structural & brand polish

Hero copy stays as-is. Changes below are structural, brand, and metadata only.

## 1. Header logo — drop wavy underline (`src/components/held/Shell.tsx`)

Remove the `underline-hand` class from the header "held" wordmark so the header matches the official Mark B (clean wordmark + green dot). The hand-underline stays available as a content device — still used inside the H1 on "anyone sees".

## 2. Eyebrow relabel (`src/routes/index.tsx`)

Change the small-caps label above the example block from `what you'll do` to `what this is`. Body copy underneath stays the same.

## 3. Footer copyright (`src/components/held/Shell.tsx`)

Add `© 2026 held.` as a second line under the existing footer row, same muted styling.

## 4. Favicon + OG image (`src/routes/__root.tsx`)

Wire the brand assets already in `public/brand/`:

- `<link rel="icon" type="image/png" sizes="32x32" href="/brand/held-mark-d-32.png">`
- `<link rel="icon" type="image/png" sizes="16x16" href="/brand/held-mark-d-16.png">`
- `<link rel="apple-touch-icon" sizes="180x180" href="/brand/held-mark-d-180.png">`
- `og:image` → `/brand/held-og-1200x630.png`
- Upgrade `twitter:card` from `summary` to `summary_large_image`

Existing title/description meta stays unchanged (matches current hero voice).

## Files touched

- `src/components/held/Shell.tsx` — remove header underline, add footer copyright
- `src/routes/index.tsx` — eyebrow label
- `src/routes/__root.tsx` — favicon links, OG image, twitter card type

No new dependencies, no route changes, no backend, no hero copy changes.
