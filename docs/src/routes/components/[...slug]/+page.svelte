<script lang="ts">
	import Code from '$lib/components/Code.svelte';
	import { h1 as H1, h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';

	let { data } = $props();

	const { PageComponent, metadata } = $derived(data);
</script>

<H1>{metadata.name}</H1>
<div class="text-surface-content/70">{metadata.description}</div>
<div>{metadata.supportedContexts.join(', ')}</div>

<PageComponent />

<H2>Related</H2>
<div>{metadata.related.join(', ')}</div>

<H2>Component source</H2>
<Code source={metadata.source} />
