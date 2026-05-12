<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Button, TextField, ToggleButton } from 'svelte-ux';

	import type { ComponentCatalog } from '../catalog.js';
	import { H2 } from '../markdown/components/index.js';
	import ExampleLink from './ExampleLink.svelte';

	import LucideSearch from '~icons/lucide/search';
	import LucideZoomIn from '~icons/lucide/zoom-in';
	import LucideZoomOut from '~icons/lucide/zoom-out';

	let {
		catalog,
		title = 'Examples',
		viewAllHref,
		exclude,
		initialColumnCount = 3,
		routeBase = '/docs/components'
	}: {
		catalog: ComponentCatalog;
		title?: string;
		viewAllHref?: string;
		exclude?: string;
		initialColumnCount?: number;
		routeBase?: string;
	} = $props();

	let columnCount = $state(3);
	let filterQuery = $state<string | null>(null);

	$effect(() => {
		columnCount = initialColumnCount;
	});

	const examples = $derived.by(() => {
		let exampleList = catalog?.examples ?? [];

		if (exclude) {
			exampleList = exampleList.filter((e) => e.name !== exclude);
		}

		if (!filterQuery) {
			return exampleList;
		}

		const query = filterQuery.toLowerCase().trim();
		return exampleList.filter((example) => example.name.toLowerCase().includes(query));
	});

	const uniqueUsage = $derived.by(() => {
		if (!catalog) return [];

		const seen = new Set<string>();
		const query = filterQuery?.toLowerCase().trim();

		return catalog.usage.filter((item) => {
			const key = `${item.component}::${item.example}`;
			if (
				catalog.examples.find(
					(ex) => ex.name === item.example && catalog.component === item.component
				)
			) {
				return false;
			}
			if (seen.has(key)) return false;
			seen.add(key);

			if (query) {
				return (
					item.example.toLowerCase().includes(query) || item.component.toLowerCase().includes(query)
				);
			}

			return true;
		});
	});

	const hasContent = $derived(examples.length || catalog?.usage?.length);
</script>

{#if hasContent}
	<div class="grid grid-cols-[1fr_auto] items-center gap-2">
		<H2 id={title.toLowerCase().replaceAll(' ', '-')}>{title}</H2>
		<div class="flex items-center gap-2 mb-2">
			{#if viewAllHref && catalog.examples?.length}
				<Button href="{viewAllHref}{filterQuery ? `?filter=${filterQuery}` : ''}">View all</Button>
			{/if}

			<TextField placeholder="Filter" bind:value={filterQuery} dense>
				{#snippet prepend()}
					<LucideSearch class="text-surface-content/50 mr-4" />
				{/snippet}
			</TextField>

			<div>
				<Button
					icon={LucideZoomOut}
					on:click={() => (columnCount = Math.min(5, columnCount + 1))}
					variant="fill-outline"
					class="size-8 border-surface-content/30 pt-1"
					disabled={columnCount >= 5}
				/>
				<Button
					icon={LucideZoomIn}
					on:click={() => (columnCount = Math.max(1, columnCount - 1))}
					variant="fill-outline"
					class="size-8 border-surface-content/30 pt-1"
					disabled={columnCount <= 1}
				/>
			</div>
		</div>
	</div>

	{#if examples.length}
		<div
			style:--column-count="repeat({columnCount}, 1fr)"
			class="grid grid-cols-(--column-count) gap-4"
		>
			{#each examples as example (example.name)}
				<ExampleLink
					{routeBase}
					component={catalog.component}
					example={example.name}
					title={example.title}
				/>
			{/each}
		</div>
	{:else if catalog.examples?.length}
		<p class="text-surface-content/50 text-sm">No examples match your filter.</p>
	{/if}

	{#if uniqueUsage.length}
		{#if examples.length}
			<ToggleButton transition={slide} let:on={showDetails} class="mt-4" buttonPlacement="after">
				{showDetails ? 'show less' : 'show more'}...
				<div slot="toggle" class="mt-2">
					<div
						style:--column-count="repeat({columnCount}, 1fr)"
						class="grid grid-cols-(--column-count) gap-4 border-t pt-4 mt-4"
					>
						{#each uniqueUsage as usage (`${usage.component}::${usage.example}`)}
							<ExampleLink
								{routeBase}
								component={usage.component}
								example={usage.example}
								showComponent
							/>
						{/each}
					</div>
				</div>
			</ToggleButton>
		{:else if catalog.examples?.length === 0}
			<div
				style:--column-count="repeat({columnCount}, 1fr)"
				class="grid grid-cols-(--column-count) gap-4"
			>
				{#each uniqueUsage as usage (`${usage.component}::${usage.example}`)}
					<ExampleLink
						{routeBase}
						component={usage.component}
						example={usage.example}
						showComponent
					/>
				{/each}
			</div>
		{:else if catalog.usage?.length}
			<p class="text-surface-content/50 text-sm mt-2">
				No additional usage examples match your filter.
			</p>
		{/if}
	{/if}
{/if}
