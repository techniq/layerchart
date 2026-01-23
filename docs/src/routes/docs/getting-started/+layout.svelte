<script lang="ts">
	import OpenLLMsButton from '$lib/components/OpenLLMs.svelte';

	let { data, children } = $props();
</script>

<h1 class="text-3xl font-bold mb-2">{data.metadata.title}</h1>
<div class="mb-4">
	<OpenLLMsButton />
</div>

<svelte:boundary>
	{#snippet pending()}
		loading...
	{/snippet}

	{@render children()}
</svelte:boundary>
