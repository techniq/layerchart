---
description: 'Streamlined Chart configuration for Area charts'
supportedContexts: [svg, canvas]
related: [components/Chart, components/Area, examples/Area]
---

<script lang="ts">
	import Code from '$lib/components/Code.svelte';
	import Example from '$lib/components/Example.svelte';

	import Basic from './examples/basic.svelte';
	import BasicSource from './examples/basic.svelte?raw';
</script>

## Examples

### Direct import

<Basic /> 
<Code source={BasicSource} />

### Example component

<Example name="basic">
	<Basic />
</Example>
