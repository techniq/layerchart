<script lang="ts">
	import { toTitleCase } from '@layerstack/utils';
	import { LoadingPlaceholder } from '@layerstack/docs/components';
	import { examples } from '@layerstack/docs/context';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { intersectExampleLayers } from '$lib/utils/layers.js';
	import { page } from '$app/state';

	import LucideBlocks from '~icons/lucide/blocks';

	let { data, children } = $props();

	const { metadata } = $derived(data);

	// Derive examples reactively so changes propagate to child components
	const currentExamples = $derived.by(() => {
		const base = data.examples ?? {};

		// If there's an example from page data (for individual example pages), merge it in
		if (page.data.example && page.params.name && page.params.example) {
			const componentName = page.params.name;
			const exampleName = page.params.example;
			return {
				...base,
				[componentName]: {
					...base[componentName],
					[exampleName]: page.data.example
				}
			};
		}

		// If there are examples from page data (for /examples page), merge them in
		if (page.data.examples) {
			const pageExamples = page.data.examples as typeof base;
			// Deep merge the examples
			const merged = { ...base };
			for (const [comp, exs] of Object.entries(pageExamples)) {
				merged[comp] = { ...merged[comp], ...exs };
			}
			return merged;
		}

		return base;
	});

	// Add examples to context for Example component to use
	// Use getter to ensure child components get reactive access
	const examplesContext = {
		get current() {
			return currentExamples;
		}
	};
	examples.set(examplesContext);

	// Determine available layers from per-example (<script module>) or component metadata (markdown frontmatter)
	const pageExample = $derived.by(() => {
		const { name, example } = page.params;
		return name && example ? currentExamples[name]?.[example] : null;
	});
	// For example pages, intersect the supported layers of every component used.
	// A Spline in an otherwise Html-capable example narrows the toggle to [svg, canvas].
	const computedExampleLayers = $derived.by(() => {
		const exampleInfo = page.params.example
			? data.catalog?.examples.find((e) => e.name === page.params.example)
			: undefined;
		return exampleInfo
			? intersectExampleLayers(exampleInfo.components, metadata.layers ?? [])
			: null;
	});
	let layers = $derived(
		pageExample?.module?.layers ?? computedExampleLayers ?? metadata.layers ?? []
	);

	const title = $derived(
		pageExample?.module?.title ??
			toTitleCase(page.params.example?.replaceAll('-', ' ') ?? toTitleCase(metadata.name))
	);

	const breadcrumbs = $derived([
		{ label: metadata.category },
		...(page.params.example
			? [{ label: metadata.name, href: `/docs/components/${page.params.name}` }]
			: [])
	]);
</script>

<PageHeader
	{title}
	icon={LucideBlocks}
	{breadcrumbs}
	{layers}
	{metadata}
	description={pageExample?.module?.description ??
		(page.params.example == null ? metadata.description : undefined)}
/>

<svelte:boundary>
	{#snippet pending()}
		<LoadingPlaceholder />
	{/snippet}

	{@render children()}
</svelte:boundary>
