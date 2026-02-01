<script lang="ts">
	import OpenWithButton from '$lib/components/OpenWithButton.svelte';

	let { data, children } = $props();
</script>

<h1 class="text-3xl font-bold mb-2">{data.metadata.title}</h1>
<div class="mb-4">
	<OpenWithButton />
</div>

<svelte:boundary>
	{#snippet pending()}
		loading...
	{/snippet}

	{@render children()}
</svelte:boundary>
