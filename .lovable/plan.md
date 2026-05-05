Create **one preview set** of `held.` logo concepts at a single size for review. No full export until approved.

## Preview deliverables

5 concepts, each rendered as a single **PNG at 600×600** on warm paper background:

1. **Mark A — Classic.** `held.` baseline-aligned dot. Standard wordmark.
2. **Mark B — Heavy dot.** Dot ~1.6× larger, ink-accent color. Reads "weight."
3. **Mark C — Dot above.** Dot floats above the `d` baseline, like a breath.
4. **Mark D — Dot only.** Single ink-accent dot on the field. Avatar / favicon contender.
5. **Mark E — Stacked.** `held.` over small-caps tagline `parents trying to understand parents`.

All five share:
- Fraunces serif, true lowercase, regular weight.
- Warm paper background matching site `--background`.
- Ink-accent dot color matching site `--ink-accent`.
- 600×600 square so they sit side-by-side for comparison.

## Process

1. Read `src/styles.css` to grab the exact paper + ink-accent colors.
2. Fetch Fraunces from Google Fonts into `/tmp` (not committed).
3. Write a small Python (Pillow) script that renders all five marks from one shared template.
4. Save outputs to `public/brand/preview/` so they're visible in the repo file tree:
   - `held-mark-a-classic.png`
   - `held-mark-b-heavy-dot.png`
   - `held-mark-c-dot-above.png`
   - `held-mark-d-dot-only.png`
   - `held-mark-e-stacked.png`
5. Visual QA each PNG (open + inspect: spacing, dot weight, no clipping).
6. Surface all five inline as artifacts so the user can scan and pick favorites.

## Out of scope (until approval)

- All other sizes (300, 400, 32, 180, 1200×630, 1584×396).
- SVG masters.
- `public/brand/README.md` usage guide.
- Dark-mode / inverse variants.

After review, the user picks 1–2 winners and I run the full export pass.