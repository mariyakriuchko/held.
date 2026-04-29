## Goal

Answer three questions a first-time visitor silently asks — *what is this, why me, what do I get* — without turning the landing into a wall of text. Keep the emotional hook as the headline; add one quiet structural beat underneath.

## Proposed new landing copy

```
you're carrying more than anyone sees.            ← unchanged headline

Two minutes on the invisible part of parenting.   ← unchanged sub
No advice. No score. No fixing.

──────  what happens  ──────                       ← tiny eyebrow label, muted

Small moments. The school email at 9pm.
The dentist appointment you keep meaning to book. Summer sneakers should have be ordered a week ago.
You say which ones happen in your house — and which ones weigh.

At the end you see the shape of what you're carrying,
and how it compares to other parents.

[ begin ]                                          ← unchanged button

Anonymous. Skip anything. Built by parents trying to
understand parents — your answers help the picture.
```

Three short beats added, ~50 words total. The page still fits in one viewport on desktop and stays in the same hush.

## What each beat does

1. **"Sixteen small moments…"** — answers *what actually happens*. Two concrete examples (school email, dentist) immediately ground it; the reader recognises themselves before they've clicked anything.
2. **"At the end you see the shape…"** — answers *what's in it for me*. Promises recognition + comparison, which is the actual payoff of the diagnostic, without overpromising "insight" or "results."
3. **"Built by parents… your answers help the picture"** — answers *who's behind this and why should I bother*. Reframes the session as participation in something, not a self-test. Replaces the current footnote which only said "anonymous, skip anything."

## Visual treatment

- The "what happens" block sits between the sub-paragraph and the button, separated by a thin muted eyebrow label (small caps, `text-muted-foreground`, similar weight to the existing footer).
- Two short paragraphs, generous leading, same `text-foreground/80` as the existing sub.
- The closing line replaces the current "Anonymous. Skip anything you don't want to answer." — it carries that meaning plus the *why*.
- No new colors, no new fonts, no images. Same calm.
- One small editorial flourish: the word "shape" in the second beat gets the `.underline-hand` accent, mirroring the headline's "anyone sees" and tying the promise visually back to the hook.

## Files to change

- `src/routes/index.tsx` — insert the new block between the existing sub-paragraph and the `Link to="/begin"`; replace the trailing micro-copy line.

That's it — one file, no new components, no migrations.

## Two phrasings I'd want you to pick between before I build

I'll ask once before editing:

- The middle beat could be **"how it compares to other parents"** (community framing — softer, more research-y) or **"what tends to weigh most for parents like you"** (personalised framing — feels more like a result *for you*). They aim at different motivations.
- The closing line could lean **research** ("your answers help the picture") or **solidarity** ("you're not the only one tracking all this"). Both fit the tone; they pull the reader toward different reasons to start.

I'll ask you those two as a quick multiple-choice once you approve the structure.