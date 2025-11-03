<script lang="ts">
	import { MenuField, ScrollingValue, TextField } from 'svelte-ux';
	import { sum } from 'd3-array';

	import ExampleLink from '$lib/components/ExampleLink.svelte';
	import H1 from '$lib/markdown/components/h1.svelte';
	import H2 from '$lib/markdown/components/h2.svelte';

	import LucideSearch from '~icons/lucide/search';
	import { sortFunc } from '@layerstack/utils';

	let { data } = $props();

	let filterQuery = $state<string | null>(null);
	let selectedSection = $state<string | null>(null);

	let visibleExamples = $derived.by(() => {
		let filtered = data.components;

		// Filter by selected section (component or section)
		if (selectedSection) {
			const selected = selectedSection.toLowerCase();
			filtered = filtered.filter(
				({ component, section }) =>
					component === selectedSection || section?.toLowerCase() === selected
			);
		}

		// Filter by search query
		if (!filterQuery) {
			return filtered;
		}

		const query = filterQuery.toLowerCase().trim();

		return filtered
			.map(({ component, section, examples }) => {
				// If component name matches, return all examples for this component
				if (component.toLowerCase().includes(query)) {
					return { component, section, examples };
				}

				// Otherwise, filter examples by name
				const filteredExamples = examples.filter((example) =>
					example.name.toLowerCase().includes(query)
				);

				// Only return component if it has matching examples
				if (filteredExamples.length > 0) {
					return { component, section, examples: filteredExamples };
				}

				return null;
			})
			.filter((item) => item !== null);
	});

	let totalVisibleExamples = $derived.by(
		() => sum(visibleExamples.map(({ examples }) => examples.length)) ?? 0
	);

	// Get unique sections from components
	let componentSections = $derived.by(() => {
		const sections = new Set<string>();
		data.components.forEach(({ section }) => {
			if (section) {
				sections.add(section);
			}
		});
		return Array.from(sections).sort(
			sortFunc((section) =>
				[
					'charts',
					'common',
					'primitives',
					'marks',
					'annotations',
					'interactions',
					'geo',
					'layout',
					'fill',
					'clipping',
					'other'
				].indexOf(section)
			)
		);
	});

	let sectionOptions = $derived.by(() => [
		{ label: 'All', value: null },
		...componentSections.map((section) => ({
			label: section.charAt(0).toUpperCase() + section.slice(1),
			value: section,
			group: 'Sections'
		})),
		...data.components.map(({ component }) => ({
			label: component,
			value: component,
			group: 'Components'
		}))
	]);
</script>

<svelte:head>
	<title>Examples - LayerChart</title>
</svelte:head>

<H1>Examples</H1>
<p class="text-sm text-surface-content/50 mb-10">
	<!-- Browse {totalVisibleExamples} examples across {visibleExamples.length} components -->
	Browse {@render scrollingValue(totalVisibleExamples)} examples across {@render scrollingValue(
		visibleExamples.length
	)} components
</p>

<div class="grid grid-cols-[1fr_200px] gap-3">
	<TextField placeholder="Filter" bind:value={filterQuery} class="mb-6">
		{#snippet prepend()}
			<LucideSearch class="text-surface-content/50 mr-4" />
		{/snippet}
	</TextField>

	<div>
		<MenuField options={sectionOptions} bind:value={selectedSection} />
	</div>
</div>

<div class="grid gap-10">
	{#each visibleExamples as { component, examples } (component)}
		<div>
			<H2 id={component}>{component}</H2>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{#each examples as example (example.name)}
					<ExampleLink {component} example={example.name} />
				{/each}
			</div>
		</div>
	{/each}
</div>

{#snippet scrollingValue(value: number)}
	<ScrollingValue {value} class="tabular-nums text-surface-content" />
	<!-- {#each Math.abs(value).toString().split('') as num}
		<ScrollingValue value={Number(num)} single class="tabular-nums" />
	{/each} -->
{/snippet}
