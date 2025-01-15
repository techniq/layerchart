---
'layerchart': minor
---

Replaced `inset: number` prop on `Bar`/`Bars` components with `insets: Insets | undefined`.

To migrate from `inset` to `insets` replace `inset = n` with:
- `insets = { x: n / 2 }` if `orientation="vertical"`
- `insets = { y: n / 2 }` if `orientation="horizontal"`
