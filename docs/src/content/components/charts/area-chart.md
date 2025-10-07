---
description: 'Streamlined Chart configuration for Area charts'
supportedContexts: [svg, canvas]
related: [components/Chart, components/Area, examples/Area]
# api,
# source,
# pageSource,
---

<script lang="ts">
	import { AreaChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
</script>

## Examples

### Basic

<div class="h-[300px] p-4 border rounded-sm">
	<AreaChart data={dateSeriesData} x="date" y="value" />
</div>

```svelte
<div class="h-[300px] rounded-sm border p-4">
	<AreaChart data={dateSeriesData} x="date" y="value" />
</div>
```
