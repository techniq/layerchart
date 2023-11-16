---
'layerchart': minor
---

[Tooltip] Replace TooltipContext's snapToDataX/Y with `<Tooltip top="data" left="data" />`. Add `topAlign` / `leftAlign` props to position based on start/center/end instead of always top-left corner. Add more tooltip examples. Issue #51

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
