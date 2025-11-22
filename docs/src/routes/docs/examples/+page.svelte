<script lang="ts">
	import { Button, MenuField, ScrollingValue, TextField } from 'svelte-ux';
	import { sum } from 'd3-array';
	import { sortFunc } from '@layerstack/utils';
	import { useSearchParams } from 'runed/kit';
	import { z } from 'zod';

	import ExampleLink from '$lib/components/ExampleLink.svelte';
	import H1 from '$lib/markdown/components/h1.svelte';
	import H2 from '$lib/markdown/components/h2.svelte';

	import LucideSearch from '~icons/lucide/search';
	import LucideZoomIn from '~icons/lucide/zoom-in';
	import LucideZoomOut from '~icons/lucide/zoom-out';
	import { cls } from '@layerstack/tailwind';

	let { data } = $props();

	export const schema = z.object({
		filter: z.string().nullable().default(null),
		section: z.string().nullable().default(null)
	});
	let params = useSearchParams(schema);

	let columnCount = $state(typeof window !== 'undefined' && window.innerWidth > 800 ? 3 : 2);

	let visibleExamples = $derived.by(() => {
		let filtered = data.components;

		// Filter by selected section (component or section)
		if (params.section) {
			const selected = params.section.toLowerCase();
			filtered = filtered.filter(
				({ component, section }) =>
					component === params.section || section?.toLowerCase() === selected
			);
		}

		// Filter by search query
		if (!params.filter) {
			return filtered;
		}

		const query = params.filter.toLowerCase().trim();
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
					'geo',
					'layout',
					'annotations',
					'interactions',
					'fill',
					'clipping',
					'layers',
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
	Browse {@render scrollingValue(totalVisibleExamples)} examples across {@render scrollingValue(
		visibleExamples.length
	)} components
</p>

<div class="sticky top-29 h-0">
	<div
		class={cls(
			// 'relative bg-linear-to-b from-surface-200 via-surface-200 via-65% to-surface-200/0 h-16 _outline',
			'relative h-16 mask-b-from-50%',
			// dot background
			'bg-radial from-black/0 from-[1px] to-surface-200/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg'
		)}
	></div>
</div>

<div
	class={cls(
		'sticky top-16 grid grid-cols-[1fr_200px_auto] items-center gap-3 py-2 z-1',
		// dot background
		'bg-radial from-black/0 from-[1px] to-surface-200/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg'
	)}
>
	<TextField placeholder="Filter" bind:value={params.filter} clearable>
		{#snippet prepend()}
			<LucideSearch class="text-surface-content/50 mr-4" />
		{/snippet}
	</TextField>

	<div>
		<MenuField options={sectionOptions} bind:value={params.section} />
	</div>

	<div class="flex gap-2">
		<Button
			icon={LucideZoomIn}
			on:click={() => (columnCount = Math.max(1, columnCount - 1))}
			variant="fill-outline"
			class="size-9 border-surface-content/30 pt-1"
			disabled={columnCount <= 1}
		/>
		<Button
			icon={LucideZoomOut}
			on:click={() => (columnCount = Math.min(5, columnCount + 1))}
			variant="fill-outline"
			class="size-9 border-surface-content/30 pt-1"
			disabled={columnCount >= 5}
		/>
	</div>
</div>

<div class="grid gap-10">
	{#each visibleExamples as { component, examples } (component)}
		<div>
			<H2 id={component} class="sticky top-29 pt-2 pb-1">{component}</H2>
			<div
				style:--column-count="repeat({columnCount}, 1fr)"
				class="grid grid-cols-(--column-count) gap-4"
			>
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
