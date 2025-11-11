<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Button, Table, TextField, ToggleButton } from 'svelte-ux';

	import { h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';
	import { tableCell } from '@layerstack/svelte-table';
	import ExampleLink from '$lib/components/ExampleLink.svelte';
	import { page } from '$app/state';

	import LucideSearch from '~icons/lucide/search';
	import LucideZoomIn from '~icons/lucide/zoom-in';
	import LucideZoomOut from '~icons/lucide/zoom-out';
	import Code from '$lib/components/Code.svelte';

	let { data } = $props();
	const { PageComponent, metadata, api, catalog } = $derived(data);

	let columnCount = $state(3);
	let filterQuery = $state<string | null>(null);

	const examples = $derived.by(() => {
		const exampleList = catalog?.examples ?? [];

		if (!filterQuery) {
			return exampleList;
		}

		const query = filterQuery.toLowerCase().trim();
		return exampleList.filter((example) => example.name.toLowerCase().includes(query));
	});

	const uniqueUsage = $derived.by(() => {
		if (!catalog) return [];

		const seen = new Set();
		const query = filterQuery?.toLowerCase().trim();

		// Filter out if additional usage in same example or already shown in examples
		return catalog.usage.filter((item) => {
			const key = `${item.component}::${item.example}`;
			// Check if already shown in main examples
			if (
				catalog.examples.find(
					(ex) => ex.name === item.example && catalog.component === item.component
				)
			) {
				return false;
			}
			// Check if already seen as additional usage in same example
			if (seen.has(key)) return false;
			seen.add(key);

			// Filter by query if provided
			if (query) {
				return (
					item.example.toLowerCase().includes(query) || item.component.toLowerCase().includes(query)
				);
			}

			return true;
		});
	});
</script>

<H2>Usage</H2>

<Code
	source={`import { ${page.params.name} } from 'layerchart';`}
	language="javascript"
	class="bg-surface-100 border rounded"
/>

<!-- Markdown page -->
<PageComponent />

{#if catalog && (catalog.examples?.length || catalog.usage?.length)}
	<div class="grid grid-cols-[1fr_auto] items-center gap-2 mt-12">
		<H2>Examples</H2>
		<div class="flex items-center gap-2 mb-2">
			{#if catalog.examples?.length}
				<Button href="/docs/{page.params.type}/{page.params.name}/examples">View all</Button>
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
			{#each examples as example}
				<ExampleLink component={catalog.component} example={example.name} />
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
						{#each uniqueUsage as usage}
							<ExampleLink component={usage.component} example={usage.example} showComponent />
						{/each}
					</div>
				</div>
			</ToggleButton>
		{:else if catalog.examples?.length === 0}
			<!-- No direct examples, show immediately -->
			<div
				style:--column-count="repeat({columnCount}, 1fr)"
				class="grid grid-cols-(--column-count) gap-4"
			>
				{#each uniqueUsage as usage}
					<ExampleLink component={usage.component} example={usage.example} showComponent />
				{/each}
			</div>
		{:else if catalog.usage?.length}
			<p class="text-surface-content/50 text-sm mt-2">
				No additional usage examples match your filter.
			</p>
		{/if}
	{/if}
{/if}

{#if api?.properties.length}
	<H2>API Reference</H2>

	<Table
		data={api?.properties}
		columns={[
			{ name: 'name', header: 'Property' },
			{ name: 'type', header: 'Type' },
			{ name: 'description', header: 'Description' }
		]}
		classes={{
			table: 'text-sm mt-1',
			th: 'border-b px-3 py-2 text-surface-content/50',
			tr: 'border-b last:border-b-0',
			td: 'px-3 py-4'
		}}
	>
		<tbody slot="data" let:columns let:data let:getCellValue let:getCellContent>
			{#each data ?? [] as rowData, rowIndex}
				<tr class="hover:bg-surface-content/5 border-b">
					{#each columns as column (column.name)}
						{@const value = getCellValue(column, rowData, rowIndex)}

						<td use:tableCell={{ column, rowData, rowIndex, tableData: data }}>
							{#if column.name === 'name'}
								<div class="flex items-center wrap gap-1">
									<span class="bg-surface-content/10 px-2 py-1 rounded border">{value}</span>
									{#if rowData.required}
										<span
											class="bg-danger/10 px-1 py-0.5 font-medium rounded border border-danger text-danger text-xs"
											>required</span
										>
									{/if}
								</div>
							{:else if column.name === 'type'}
								<span class="font-mono text-surface-content/70">{value}</span>
							{:else if column.name === 'description'}
								<span class="whitespace-pre-line">{value}</span>
								{#if rowData.default != null}
									<div class="mt-2 text-surface-content/70">
										Default: <span class="font-mono">{rowData.default}</span>
									</div>
								{/if}
							{:else}
								{getCellContent(column, rowData, rowIndex)}
							{/if}
						</td>
					{/each}
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="p-3 italic">No properties</td>
				</tr>
			{/each}
		</tbody>
	</Table>

	{#if api.extends?.length}
		<div class="mt-4">
			also availalble:
			<div class="inline-flex gap-2">
				{#each api.extends as extended}
					<span class="text-sm bg-surface-content/10 px-1 py-0.5 rounded border"
						>{extended.name}</span
					>
				{/each}
			</div>
		</div>
	{/if}

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
{/if}
