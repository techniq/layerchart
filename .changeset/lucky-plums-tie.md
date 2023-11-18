---
'layerchart': minor
---

[Tooltip] Replace TooltipContext's snapToDataX/Y with `<Tooltip top="data" left="data" />`. Add `anchor` prop to align based on corner/edge/center (13 points) of tooltip instead of always top-left corner. Add more tooltip examples.

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
  <Tooltip left="data" top="data">
    ...
  </Tooltip>
</Chart>
```
