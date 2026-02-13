<script lang="ts">
	import { Table } from 'svelte-ux';

	import { h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';
	import { tableCell } from '@layerstack/svelte-table';
	import ExampleListing from '$lib/components/ExampleListing.svelte';
	import { page } from '$app/state';

	import RelatedLink from '$lib/components/RelatedLink.svelte';

	let { data } = $props();
	const { PageComponent, metadata, api, catalog } = $derived(data);
</script>

<!-- Markdown page -->
<PageComponent />

{#if catalog && (catalog.examples?.length || catalog.usage?.length)}
	<div class="mt-12">
		<ExampleListing {catalog} viewAllHref="/docs/components/{page.params.name}/examples" />
	</div>
{/if}

{#if api?.properties.length}
	<H2 id="api-reference">API Reference</H2>

	<Table
		data={api?.properties}
		columns={[
			{ name: 'name', header: 'Property' },
			{ name: 'description', header: 'Description' },
			{ name: 'type', header: 'Type' }
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
									<span class="text-xs font-pixel bg-surface-content/10 px-2 py-1 rounded border"
										>{value}</span
									>
									{#if rowData.required}
										<span
											class="bg-danger/10 px-1 py-0.5 font-medium rounded border border-danger text-danger text-xs"
											>required</span
										>
									{/if}
								</div>
							{:else if column.name === 'type'}
								<span class="font-pixel text-xs text-surface-content/70">{value}</span>
							{:else if column.name === 'description'}
								<span class="whitespace-pre-line">{value}</span>
								{#if rowData.default != null}
									<div class="mt-2 text-surface-content/70">
										default: <span class="font-pixel">{rowData.default}</span>
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
			also available:
			<div class="inline-flex gap-2">
				{#each api.extends as extended}
					<span class="text-sm bg-surface-content/10 px-1 py-0.5 rounded border"
						>{extended.name}</span
					>
				{/each}
			</div>
		</div>
	{/if}
{/if}

{#if metadata.related.length}
	<H2 id="related">Related</H2>
	<div class="grid grid-cols-xs gap-2 mt-2">
		{#each metadata.related as related}
			<RelatedLink value={related} />
		{/each}
	</div>
{/if}
