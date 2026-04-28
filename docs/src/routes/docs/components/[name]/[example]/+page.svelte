<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';
	import H2 from '$lib/markdown/components/h2.svelte';

	import ComponentLink from '$lib/components/ComponentLink.svelte';
	import ExampleListing from '$lib/components/ExampleListing.svelte';

	let { data } = $props();

	const example = $derived(page.params.example!);
	const component = $derived(page.url.searchParams.get('component') ?? page.params.name!);

	const exampleInfo = $derived(data.catalog?.examples.find((e) => e.name === example));
</script>

<Example name={example} {component} showCode />

<H2>Components</H2>
<div class="grid grid-cols-xs gap-2 mt-2">
	{#each exampleInfo?.components as componentUsage}
		<ComponentLink component={componentUsage.component} />
	{/each}
</div>

{#if data.catalog}
	<div class="mt-12">
		<ExampleListing catalog={data.catalog} title="More examples" exclude={example} />
	</div>
{/if}
