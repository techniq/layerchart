<script lang="ts">
	import { Button } from 'svelte-ux';

	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';
	import H2 from '$lib/markdown/components/h2.svelte';

	import LucideLink from '~icons/lucide/link';
	import ComponentLink from '$lib/components/ComponentLink.svelte';

	let { data } = $props();

	let example = page.params.example!;
	let component = page.url.searchParams.get('component') ?? page.params.name!;

	const exampleInfo = $derived(data.catalog?.examples.find((e) => e.name === example));
	// console.log({ exampleInfo, data });
</script>

<Example name={example} {component} showCode />

<H2>Component Docs</H2>
<div class="flex flex-wrap gap-2 mt-1">
	{#each exampleInfo?.components as componentUsage}
		<Button
			icon={LucideLink}
			variant="fill-light"
			href="/docs/components/{componentUsage.component}"
			size="sm"
		>
			{componentUsage.component}
		</Button>
		<!-- <ComponentLink component={componentUsage.component} example="basic" /> -->
	{/each}
</div>
