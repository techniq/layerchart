<script lang="ts">
	import { Button, Menu, Switch, Toggle, ToggleGroup, ToggleOption, Tooltip } from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';

	import { h1 as H1, h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';
	import ViewSourceButton from '$lib/components/ViewSourceButton.svelte';
	import { examples } from '$lib/context.js';
	import { shared } from '$lib/shared.svelte.js';

	import LucideSettings from '~icons/lucide/settings';
	import LucideCode from '~icons/lucide/code';

	let { data } = $props();

	const { PageComponent, metadata } = $derived(data);

	const examplesContext = {
		get current() {
			return data.examples;
		}
	};

	examples.set(examplesContext);
</script>

<div class="flex items-center gap-4">
	<H1>{metadata.name}</H1>
	<span class="flex items-center gap-1">
		{#if metadata.layers}
			<ToggleGroup
				bind:value={shared.renderContext}
				variant="fill"
				color="primary"
				inset
				gap="px"
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
							<Switch bind:checked={shared.debug} />
						</label>
					</Menu>
				</Button>
			</Tooltip>
		</Toggle>
	</span>
</div>

<div class="text-sm text-surface-content/70">{metadata.description}</div>

<div class="flex gap-2 mt-3">
	{#if metadata.source}
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

<svelte:boundary>
	<PageComponent {examples} />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>

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
