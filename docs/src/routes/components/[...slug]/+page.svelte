<script lang="ts">
	import Code from '$lib/components/Code.svelte';

	let { data } = $props();

	const { Component, metadata } = $derived(data);
</script>

<h1 class="text-3xl font-bold">{metadata.name}</h1>
<div class="text-surface-content/70">{metadata.description}</div>
<div>{metadata.supportedContexts.join(', ')}</div>

<Component />

Related:
<div>{metadata.related.join(', ')}</div>

Source:
<Code source={metadata.source} />
