<script lang="ts">
	import { getSettings } from 'layerchart';
	import {
		Button,
		Menu,
		Switch,
		Table,
		Toggle,
		ToggleGroup,
		ToggleOption,
		Tooltip
	} from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';
	import { tableCell } from '@layerstack/svelte-table';

	import ViewSourceButton from '$lib/components/ViewSourceButton.svelte';
	import { examples } from '$lib/context.js';
	import { page } from '$app/state';

	import LucideSettings from '~icons/lucide/settings';
	import LucideCode from '~icons/lucide/code';
	import LucideChevronLeft from '~icons/lucide/chevron-left';
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import H2 from '$lib/markdown/components/h2.svelte';

	// TODO: `setSettings({...})` or just use default?
	const settings = getSettings();

	let { data, children } = $props();

	const { metadata, api } = $derived(data);

	// Add examples to context for Example component to use
	const examplesContext = {
		get current() {
			return data.examples;
		}
	};
	examples.set(examplesContext);
</script>

{#if page.params.example}
	<Button
		size="sm"
		icon={LucideChevronLeft}
		href="/{page.params.type}/{page.params.name}"
		class="mb-4 border"
	>
		Back to examples
	</Button>
{/if}

<div class="flex items-center gap-2 text-xs font-bold">
	<div class="text-surface-content/50 capitalize">
		{metadata.section}
	</div>

	{#if page.params.example}
		<LucideChevronRight class="text-sm opacity-25" />
		<a href="/{page.params.type}/{page.params.name}" class="text-primary">{metadata.name}</a>
	{/if}
</div>

<div class="flex items-center gap-4">
	<h1 class="text-3xl font-bold first-letter:capitalize">
		{page.params.example?.replaceAll('-', ' ') ?? metadata.name}
	</h1>
	<span class="flex items-center gap-1">
		{#if metadata.layers}
			<ToggleGroup
				bind:value={settings.layer}
				variant="outline"
				color="primary"
				inset
				rounded="full"
				size="sm"
			>
				{#each metadata.layers as layer}
					<ToggleOption value={layer}>{toTitleCase(layer)}</ToggleOption>
				{/each}
			</ToggleGroup>
		{/if}

		<Toggle let:on={open} let:toggle let:toggleOff>
			<Tooltip title="Settings">
				<Button iconOnly on:click={toggle}>
					<LucideSettings class="text-surface-content" />
					<Menu {open} on:close={toggleOff} placement="bottom-start" classes={{ menu: 'p-2' }}>
						<label class="flex items-center gap-2">
							<span class="text-sm text-surface-content">Debug</span>
							<Switch bind:checked={settings.debug} />
						</label>
					</Menu>
				</Button>
			</Tooltip>
		</Toggle>
	</span>
</div>

{#if page.params.example == null}
	<div class="text-sm text-surface-content/70">{metadata.description}</div>

	<div class="flex gap-2 mt-3">
		{#if 'source' in metadata}
			<ViewSourceButton
				label="Source"
				source={metadata.source}
				href={metadata.sourceUrl}
				icon={LucideCode}
			/>
		{/if}

		<!-- <ViewSourceButton
        label="Page source"
        source={pageSource}
        href={pageUrl
          ? `https://github.com/techniq/layerchart/blob/next/packages/layerchart/${pageUrl}`
          : ''}
        icon={LucideFilePenLine}
      /> -->

		<!-- {#if !hideTableOfContents}
        <Button
          icon={LucideChevronDown}
          on:click={() => {
            showTableOfContents = !showTableOfContents;
          }}
          variant="fill-light"
          color="primary"
          size="sm"
        >
          On this page
        </Button>
      {/if} -->
	</div>
{/if}

<svelte:boundary>
	{#snippet pending()}
		loading...
	{/snippet}

	{@render children()}

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
</svelte:boundary>
