<script lang="ts">
	import { Button, Table } from 'svelte-ux';

	import { h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';
	import { tableCell } from '@layerstack/svelte-table';

	let { data } = $props();
	const { PageComponent, metadata, api } = $derived(data);
</script>

<!-- Markdown page -->
<PageComponent />

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
