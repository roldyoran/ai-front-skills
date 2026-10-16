# NOTES — ui-ux-pro-max applied to `before.html`, saved as `after.html`

Skill: `ui-ux-pro-max` (Next Level Builder). Do not modify `before.html`.

## Design system (from `scripts/search.py --design-system`)

Query: `python packages/front-skills/skills-registry/ui-ux-pro-max/scripts/search.py
"beauty salon service booking" --design-system -p "Studio Aurea"`

- Pattern: Hero-Centric + Social Proof (hero CTA above fold, reviews before booking)
- Style: Soft UI Evolution, LIGHT only (avoid dark mode per system output)
- Tokens: `--color-primary #EC4899`, `--color-accent #8B5CF6`,
  `--color-background #FDF2F8`, `--color-foreground #831843`,
  `--color-muted #F1EEF5`, `--color-border #FBCFE8`
  (buttons/text use darkened ramps `#BE185D`/`#9D174D` to hold 4.5:1 on light)
- Type: Playfair Display (display) + Inter (body), base 16px, lh 1.6
- Landing supplement (`--domain landing "salon services pricing social-proof"`):
  Hero + Testimonials + CTA, 3–5 reviews with photo + name + service, CTA after proof
- UX supplement (`--domain ux "booking form accessibility"`):
  visible `<label for>`, submit loading → success/error, alt text,
  aria-labels, keyboard order = visual order

## What changed vs before

1. Sticky header with single primary CTA (`Book now`) + skip link + visible focus rings.
2. Hero with aggregate rating (4.9 · 480 verified reviews), dual CTA, trust row,
   next-available badge — conversion pattern instead of plain claim.
3. Services as bento grid with duration + from-price + includes line per card.
4. About rewritten as process checklist (consultation → patch test → formula on file).
5. Gallery captions carry service + duration (proof, not decoration).
6. New reviews section (3 verified cards) feeding the booking CTA.
7. Pricing as transparent menu with durations + "confirmed before we begin" note.
8. Booking form rebuilt: visible labels, required markers, helper text,
   inline blur validation, `aria-live` submit feedback, 44px targets.
9. Motion: 200ms transform/opacity only, `prefers-reduced-motion` disables it.
10. No emojis — inline SVG icons only; `cursor-pointer` on clickables.
