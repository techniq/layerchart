<script lang="ts">
	import Code from '$lib/components/Code.svelte';
	import { h1 as H1, h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';

	let { data } = $props();

	const { PageComponent, metadata } = $derived(data);
</script>

<H1>{metadata.name}</H1>
<div class="text-surface-content/70">{metadata.description}</div>
<div>{metadata.layers.join(', ')}</div>

<svelte:boundary>
	<PageComponent />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>

{#if metadata.related.length}
	<H2>Related</H2>
	<div>{metadata.related.join(', ')}</div>
{/if}

{#if metadata.source}
	<H2>Component source</H2>
	<Code source={metadata.source} />
{/if}
