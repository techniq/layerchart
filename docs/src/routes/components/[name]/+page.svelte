<script lang="ts">
	import { Button } from 'svelte-ux';

	import { h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';

	let { data } = $props();
	const { PageComponent, metadata } = $derived(data);
</script>

<!-- Markdown page -->
<PageComponent />

{#if metadata.related.length}
	<H2>Related</H2>
	<div class="flex flex-wrap gap-2 mt-1">
		{#each metadata.related as related}
			<Button variant="fill-light" href="/{related}" size="sm">
				{related}
			</Button>
		{/each}
	</div>
{/if}
