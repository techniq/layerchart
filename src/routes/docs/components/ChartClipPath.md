---
component: $component
filename: $filename
description: Convenient way to clip specific components (axis labels, etc) within chart while still allowing some to overflow (tooltips, etc)
---

<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import api from '$lib/components/ChartClipPath.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';

	import Preview from '$lib/docs/Preview.svelte';
</script>

# Examples

> TODO

# API

<ApiDocs {api} />
