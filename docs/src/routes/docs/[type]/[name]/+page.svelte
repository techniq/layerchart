<script lang="ts">
	import { Button, Table, ToggleButton } from 'svelte-ux';

	import { h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';
	import { tableCell } from '@layerstack/svelte-table';
	import ExampleLink from '$lib/components/ExampleLink.svelte';
	import { slide } from 'svelte/transition';

	let { data } = $props();
	const { PageComponent, metadata, api, catalog } = $derived(data);

	const examples = $derived(catalog?.examples ?? []);

	const uniqueUsage = $derived.by(() => {
		if (!catalog) return [];

		const seen = new Set();
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

			return true;
		});
	});

	$inspect({ data });
</script>

<!-- Markdown page -->
<PageComponent />

<!-- {#if metadata.related.length}
	<H2>Related</H2>
	<div class="flex flex-wrap gap-2 mt-1">
		{#each metadata.related as related}
			<Button variant="fill-light" href="/{related}" size="sm">
				{related}
			</Button>
		{/each}
	</div>
{/if} -->

{#if catalog && (examples.length || uniqueUsage.length)}
	<H2>Examples</H2>
	<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
		{#each examples as example}
			<ExampleLink component={catalog.component} example={example.name} />
		{/each}
	</div>

	{#if uniqueUsage.length}
		{#if examples.length}
			<ToggleButton transition={slide} let:on={showDetails} class="mt-4" buttonPlacement="after">
				{showDetails ? 'show less' : 'show more'}...
				<div slot="toggle" class="mt-2">
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
						{#each uniqueUsage as usage}
							<ExampleLink component={usage.component} example={usage.example} showComponent />
						{/each}
					</div>
				</div>
			</ToggleButton>
		{:else}
			<!-- No direct examples, show immediately -->
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{#each uniqueUsage as usage}
					<ExampleLink component={usage.component} example={usage.example} showComponent />
				{/each}
			</div>
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
{/if}
