---
'layerchart': minor
---

breaking(Bar|Bars): Replaced `inset: number` prop with `insets: Insets | undefined`.

To migrate from `inset` to `insets` replace `inset = n` with:

- `insets = { x: n / 2 }` if `orientation="vertical"`
- `insets = { y: n / 2 }` if `orientation="horizontal"`
