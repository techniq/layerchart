---
'layerchart': minor
---

[Tooltip] Position improvements

- Replace TooltipContext's `snapToDataX/Y`` with `<Tooltip x="data" y="data" />`.
- Add `anchor` prop to align based on corner/edge/center (9 points) of tooltip instead of always top-left corner.
- Rename TooltipContext's `top`/`left` to `x`/`y`
- Rename `<Tooltip left={...} top={...} />` to `<Tooltip x={...} y={...} />`
- Add more tooltip examples

**Breaking Change**

Before:

```svelte
<Chart tooltip={{ snapToDataX: true, snapToDataY: true }}>
  <Tooltip>
    ...
  </Tooltip>
</Chart>
```

After:

```svelte
<Chart tooltip>
  <Tooltip x="data" y="data">
    ...
  </Tooltip>
</Chart>
```
