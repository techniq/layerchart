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

:::note
See [LayerStack](https://www.layerstack.dev/docs/utils/string) for full API documentation.
:::

### truncate()

```svelte live
<script lang="ts">
	import { truncate } from '@layerstack/utils';

	const str = 'This is a really long string of text.';
</script>

{truncate(str, 21)}
```

:::note
Truncation is also built into the [Text](/docs/components/Text) component via the `truncate` prop.

:::

### toTitleCase()

```svelte live
<script lang="ts">
	import { toTitleCase } from '@layerstack/utils';
</script>

{toTitleCase('string of text')}
```