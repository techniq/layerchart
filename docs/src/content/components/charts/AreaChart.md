---
description: 'Streamlined Chart configuration for Area charts'
supportedContexts: [svg, canvas]
related: [components/Chart, components/Area, examples/Area]
---

<script lang="ts">
	import Code from '$lib/components/Code.svelte';

	import Basic from '$examples/AreaChart/basic.svelte';
	import BasicSource from '$examples/AreaChart/basic.svelte?raw';

	import AsyncExample from '$lib/components/AsyncExample.svelte';
	import PromiseExample from '$lib/components/PromiseExample.svelte';
	import Example from '$lib/components/Example.svelte';
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

### Async import

<AsyncExample component="AreaChart" name="basic" />

### Promise import

<PromiseExample component="AreaChart" name="basic" />
