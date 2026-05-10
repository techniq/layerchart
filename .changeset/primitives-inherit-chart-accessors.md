---
'layerchart': minor
---

feat(Circle, Text): Inherit chart accessors by default in data mode

`<Circle>` and `<Text>` now fall back to the chart's `x`/`y`/`r` accessors (via `xGet`/`yGet`/`rGet`) when the corresponding position prop is omitted — matching how `<Points>` and the new `<Dodge>` work. This lets the chart be the single source of truth for `x`/`y`/`r` and removes the boilerplate of repeating those props on every primitive:

```svelte
<!-- Before -->
<Chart {data} x="date" y="value" r="size" rRange={[2, 10]}>
  <Circle {data} cx="date" cy="value" r="size" />
</Chart>

<!-- After -->
<Chart {data} x="date" y="value" r="size" rRange={[2, 10]}>
  <Circle {data} />
</Chart>
```

`Circle` and `Text` also now enter data mode when `data` is explicitly passed (in addition to the existing trigger when `cx`/`cy`/`x`/`y` are data-driven), so the implicit-accessor pattern works without needing to pass redundant string accessors just to trigger iteration.

Behavior is unchanged whenever any position prop is set explicitly — the hardcoded defaults (0/0/1) only apply when neither prop nor chart-level config is present. All existing usages in the docs pass explicit position props, so this is purely additive.
