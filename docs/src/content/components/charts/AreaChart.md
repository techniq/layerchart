---
description: Streamlined Chart configuration for Area charts
layers: [svg, canvas]
related: [components/Chart, components/Area, examples/Area]
---

<script lang="ts">
	import Code from '$lib/components/Code.svelte';

	import Basic from '$examples/AreaChart/basic.svelte';
	import BasicSource from '$examples/AreaChart/basic.svelte?raw';

	import Example from '$lib/components/Example.svelte';

	import PromiseExample from '$lib/components/PromiseExample.svelte';
	import AsyncExample from '$lib/components/AsyncExample.svelte';
</script>

## Examples

### Direct import

<Basic />
<Code source={BasicSource} />

### Example component

> Injected source via rehype plugin

<Example component="AreaChart" name="basic">
	<Basic />
</Example>

### Promise import

> Issue after build

<PromiseExample component="AreaChart" name="basic" />

### Async import

> Issue with initial page view

> Issue after build

<AsyncExample component="AreaChart" name="basic" />
