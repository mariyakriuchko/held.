# held. brand assets

All assets use **Fraunces Regular** (lowercase) on warm paper (`#F7F2E6`) with a deep forest green accent dot (`#386B4A`). Colors match `src/styles.css` tokens (`--paper`, `--ink`, `--accent-ink`).

## Files

### Wordmark — Mark B (`held.` with heavy dot)
Use whenever the brand name should be readable. Recommended for ≥96px.

| File | Use |
|---|---|
| `held-mark-b-1024.png` | Master / print / large social |
| `held-mark-b-600.png` | LinkedIn / Twitter profile (any size up to 600) |
| `held-mark-b-400.png` | Facebook profile |
| `held-mark-b-300.png` | Instagram profile |
| `held-mark-b-192.png` | PWA icon (Android) |
| `held-mark-b-180.png` | Apple touch icon |
| `held-mark-b-96.png` | Smallest readable wordmark |
| `held-mark-b-1024-transparent.png` | Overlay master (PNG, alpha) |
| `held-mark-b-512-transparent.png` | Overlay use |

### Dot only — Mark D (favicon / avatar fallback)
Wordmark becomes unreadable below ~64px. Use the dot at small sizes.

| File | Use |
|---|---|
| `held-mark-d-16.png` | Browser tab favicon |
| `held-mark-d-32.png` | Browser tab favicon (HiDPI) |
| `held-mark-d-64.png` | Small UI / inline avatar |
| `held-mark-d-96.png` | Small avatar |
| `held-mark-d-180.png` | Apple touch (dot variant) |
| `held-mark-d-192.png` | PWA (dot variant) |
| `held-mark-d-512-transparent.png` | Overlay master |
| `held-mark-d-1024-transparent.png` | Overlay master |

### Social banners

| File | Use |
|---|---|
| `held-og-1200x630.png` | Open Graph / link previews (Facebook, LinkedIn, Slack) |
| `held-banner-1584x396.png` | LinkedIn cover banner |
| `held-banner-1500x500.png` | Twitter / X header |

## Usage rules

- **Clear space:** keep at least 1× the height of the `h` empty around the mark.
- **Background:** use the warm paper tone or any quiet neutral. Do not place on busy photography.
- **Dot color:** the green dot is the only color accent — never recolor it.
- **Lowercase only:** never set `Held` or `HELD`. Always `held.`.
- **Don't recreate by typing:** Fraunces' default kerning is close, but use the PNGs as the source of truth.

## Regenerating

The render scripts live in `/tmp/render_export.py` (wordmark) and an inline dot script. To regenerate, fetch Fraunces Regular and re-run.
