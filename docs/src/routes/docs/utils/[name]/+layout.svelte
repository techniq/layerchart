<script lang="ts">
	import { LoadingPlaceholder } from '@layerstack/docs/components';
	import { examples } from '@layerstack/docs/context';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { page } from '$app/state';

	import LucideParentheses from '~icons/lucide/parentheses';

	let { data, children } = $props();

	const { metadata } = $derived(data);

	// Add examples to context for Example component to use
	const examplesContext = {
		get current() {
			return data.examples;
		}
	};
	examples.set(examplesContext);
</script>

<PageHeader
	title={page.params.example?.replaceAll('-', ' ') ?? metadata.name}
	icon={LucideParentheses}
	breadcrumbs={[
		{ label: metadata.category },
		...(page.params.example
			? [{ label: metadata.name, href: `/docs/utils/${page.params.name}` }]
			: [])
	]}
	description={page.params.example == null ? metadata.description : undefined}
	layers={data.layers}
	{metadata}
/>

<svelte:boundary>
	{#snippet pending()}
		<LoadingPlaceholder />
	{/snippet}

	{@render children()}
</svelte:boundary>
