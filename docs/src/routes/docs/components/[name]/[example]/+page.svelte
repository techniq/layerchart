<script lang="ts">
	import { Button } from 'svelte-ux';

	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';
	import H2 from '$lib/markdown/components/h2.svelte';

	import LucideLink from '~icons/lucide/link';
	import ComponentLink from '$lib/components/ComponentLink.svelte';
	import OpenWithButton from '$lib/components/OpenWithButton.svelte';

	let { data } = $props();

	const example = $derived(page.params.example!);
	const component = $derived(page.url.searchParams.get('component') ?? page.params.name!);

	const exampleInfo = $derived(data.catalog?.examples.find((e) => e.name === example));
</script>

<div class="mb-4">
	<OpenWithButton />
</div>

<Example name={example} {component} showCode />

<H2>Components</H2>
<div class="grid grid-cols-xs gap-2 mt-2">
	{#each exampleInfo?.components as componentUsage}
		<ComponentLink component={componentUsage.component} />
	{/each}
</div>
