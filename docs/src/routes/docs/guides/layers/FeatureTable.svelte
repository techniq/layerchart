<script>
	import { Button, Table, Tooltip } from 'svelte-ux';
	import { tableCell } from '@layerstack/svelte-table';
	import { cls } from '@layerstack/tailwind';

	import LucideCheck from '~icons/lucide/check';
	import LucideX from '~icons/lucide/x';
	import LucideInfo from '~icons/lucide/info';

	let { data } = $props();
</script>

<Table
	{data}
	columns={[
		{
			name: 'feature',
			header: 'Feature',
			classes: { th: 'bg-surface-200', td: 'w-100 bg-surface-200' },
			sticky: {
				left: true
			}
		},
		{
			name: 'svg',
			header: 'Svg'
		},
		{
			name: 'html',
			header: 'Html'
		},
		{
			name: 'canvas',
			header: 'Canvas'
		},
		{
			name: 'webgl',
			header: 'WebGL'
		}
	]}
	classes={{
		container: 'overflow-x-auto',
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
						{#if column.name === 'feature'}
							{getCellContent(column, rowData, rowIndex)}
						{:else}
							<Tooltip
								title={[value.note?.trim(), value.link?.trim()].filter(Boolean).join('\n') ?? ''}
								placement="top"
								offset={2}
								classes={{ title: 'whitespace-pre-line' }}
							>
								<Button
									href={value.link}
									target="_blank"
									variant="none"
									class={cls(
										'relative inline-flex items-center gap-1 border px-2 pr-3 font-semibold rounded-full border-current',
										value.support ? 'text-success bg-success/5' : 'text-danger bg-danger/5'
									)}
								>
									{#if value.support}
										<LucideCheck /> Yes
									{:else}
										<LucideX /> No
									{/if}

									{#if value.note || value.link}
										<span
											class={cls(
												'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2',
												'size-4 grid place-content-center border border-surface-100 rounded-full bg-current text-xs',
												value.support
													? 'text-success-content bg-success'
													: 'text-danger-content bg-danger'
											)}
										>
											i
										</span>
									{/if}
								</Button>
							</Tooltip>
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
