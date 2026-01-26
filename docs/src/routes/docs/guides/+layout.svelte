<script lang="ts">
	import OpenWithButton from '$lib/components/OpenWithButton.svelte';

	let { data, children } = $props();
</script>

<h1 class="text-3xl font-bold mb-2">{data.metadata.title}</h1>
<!-- OpenWithButton is shown as example on LLMs page, do not show again -->
{#if data.metadata.title !== 'LLMs'}
	<div class="mb-4">
		<OpenWithButton example={data.metadata.title === 'LLMs'} />
	</div>
{/if}

<svelte:boundary>
	{#snippet pending()}
		loading...
	{/snippet}

	{@render children()}
</svelte:boundary>
