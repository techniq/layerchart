---
component: $component
filename: $filename
---

<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import apiAxisX from '$lib/components/AxisX.svelte?raw&sveld';
	import apiAxisY from '$lib/components/AxisY.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';

	import Preview from '$lib/docs/Preview.svelte';
</script>

# Examples

> TODO

# API

## Axis X

<ApiDocs api={apiAxisX} />

## Axis Y

<ApiDocs api={apiAxisY} />
