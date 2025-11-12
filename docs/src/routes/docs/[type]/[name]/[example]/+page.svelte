<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';
	import H2 from '$lib/markdown/components/h2.svelte';
	import { Button } from 'svelte-ux';

	let { data } = $props();

	let example = page.params.example!;
	let component = page.url.searchParams.get('component') ?? page.params.name!;

	const exampleInfo = $derived(data.catalog?.examples.find((e) => e.name === example));
</script>

<Example name={example} {component} showCode />

<H2>Component Docs</H2>
<div class="flex flex-wrap gap-2 mt-1">
	{#each exampleInfo?.components as componentUsage}
		<Button variant="fill-light" href="/docs/components/{componentUsage.component}" size="sm">
			{componentUsage.component}
		</Button>
	{/each}
</div>
