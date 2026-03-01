---
title: Migrate from v1
---

## Chart Sizing

In version 1 of Layerchart, it required that you add a wrapping div to define the size of the chart. This is now optional, and the height and width can be set directly on the root LayerChart component.

```svelte diff
<script lang="ts">
    import { LineChart } from '@layerchart/svelte'; 
</script>

- <div class="h-[300]">
-    <LineChart {data} />
+   <LineChart {data} height={300} />
- </div>
```

...More to come soon!
