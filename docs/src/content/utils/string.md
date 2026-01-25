---
description: Utility string functions.
category: tools
layers: []
related:
  [
    /docs/components/BarChart/duration-civilization-timeline,
    /docs/components/BarChart/duration-civilization-timeline-dense,
    /docs/components/Text/playground,
    components/Text,
    https://www.layerstack.dev/docs/utils/string
  ]
---

## Usage

### truncate()

:::note
[Full Layerstack API](https://www.layerstack.dev/docs/utils/string)
:::

```svelte live
<script lang="ts">
	import { truncate } from '@layerstack/utils';

	const str = 'This is a really long string of text.';
</script>

{truncate(str, 21)}
```

### toTitleCase()

```svelte live
<script lang="ts">
	import { toTitleCase } from '@layerstack/utils';
</script>

{toTitleCase('string of text')}
```