<script lang="ts">
	import { getSettings } from 'layerchart';
	import { Button, Menu, Switch, Toggle, ToggleGroup, ToggleOption, Tooltip } from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';

	import ViewSourceButton from '$lib/components/ViewSourceButton.svelte';
	import { examples } from '$lib/context.js';
	import { page } from '$app/state';

	import LucideSettings from '~icons/lucide/settings';
	import LucideCode from '~icons/lucide/code';
	import LucideChevronLeft from '~icons/lucide/chevron-left';
	import LucideChevronRight from '~icons/lucide/chevron-right';

	// TODO: `setSettings({...})` or just use default?
	const settings = getSettings();

	let { data, children } = $props();

	const { metadata } = $derived(data);

	// Add examples to context for Example component to use
	const examplesContext = {
		get current() {
			return data.examples;
		}
	};
	examples.set(examplesContext);
</script>

<div class="mb-4">
	<!-- Show back if viewing individual example or all component examples -->
	{#if page.params.example || page.route.id == '/docs/[type]/[name]/examples'}
		<Button
			size="sm"
			icon={LucideChevronLeft}
			href="/docs/{page.params.type}/{page.params.name}"
			class="mb-4 border"
		>
			Back to {page.params.name}
		</Button>
	{/if}

	<div class="flex items-center gap-2 text-xs font-bold">
		<div class="text-surface-content/50 capitalize">
			{metadata.section}
		</div>

		{#if page.params.example}
			<LucideChevronRight class="text-sm opacity-25" />
			<a href="/docs/{page.params.type}/{page.params.name}" class="text-primary">{metadata.name}</a>
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
</div>

<svelte:boundary>
	{#snippet pending()}
		loading...
	{/snippet}

	{@render children()}
</svelte:boundary>
