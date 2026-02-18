---
description: Utility function to easily manipulate numbers and dates to different formats and locales.
category: tools
layers: []
related:
  [
    /docs/components/BarChart/sparkbar-fixed-position-tooltip,
    https://www.layerstack.dev/docs/utils/format#playgrounds
  ]
---

## Usage

### format()

:::note
[Full Layerstack API](https://www.layerstack.dev/docs/utils/format)
:::

```svelte live
<script lang="ts">
	import { format } from '@layerstack/utils';
</script>

{format(1234.56, 'integer')}<br />
{format(1234.56, 'decimal')}<br />
{format(1234.56, 'currency')}<br />
{format(1234.56, 'currency', { currency: 'EUR' })}<br />
{format(0.5678, 'percent')}<br />
{format(0.5678, 'percentRound')}<br />
{format(1_234_567, 'metric')}<br />
{format(new Date(), 'day', { variant: 'short' })}<br />
{format(new Date(), 'custom', { custom: 'eee, MMMM do' })}<br />
```
