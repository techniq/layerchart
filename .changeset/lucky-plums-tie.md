---
'layerchart': minor
---

[Tooltip] Replace TooltipContext's snapToDataX/Y with `<Tooltip top="data" left="data" />`. Add `center` prop to position based on center instead of top/left corner. Add more tooltip examples. . Issue #51

**Breaking Change**

Before:
```svelte
<Chart tooltip={{ snapToDataX: true, snapToDataX: true }}>
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
