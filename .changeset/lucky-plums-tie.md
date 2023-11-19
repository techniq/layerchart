---
'layerchart': minor
---

[Tooltip] Position improvements including `anchor` support

**Breaking Change**

## Replace TooltipContext's `snapToDataX/Y` with `<Tooltip x="data" y="data" />`

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

## Rename `<Tooltip left={...} top={...} />` to `<Tooltip x={...} y={...} />`

Before:

```svelte
<Chart tooltip>
  <Tooltip left={0} top={0}>
    ...
  </Tooltip>
</Chart>
```

After:

```svelte
<Chart tooltip>
  <Tooltip x={0} left={0}>
    ...
  </Tooltip>
</Chart>
```

## Additional

- Rename tooltipContext's `top`/`left` to `x`/`y`
- Add `anchor` prop to align based on corner/edge/center (9 points) of tooltip instead of always top-left corner.
- Add more tooltip examples
