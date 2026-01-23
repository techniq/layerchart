<script lang="ts">
	import OpenLLMsbutton from '$lib/components/OpenLLMs.svelte';

	let { data, children } = $props();
</script>

<h1 class="text-3xl font-bold mb-2">{data.metadata.title}</h1>
<!-- OpenLLMsbutton is shown as example on LLMs page, do not show again -->
{#if data.metadata.title !== 'LLMs'}
	<div class="mb-4">
		<OpenLLMsbutton example={data.metadata.title === 'L L Ms'} />
	</div>
{/if}

<svelte:boundary>
	{#snippet pending()}
		loading...
	{/snippet}

	{@render children()}
</svelte:boundary>
