<script lang="ts">
	import { Button, Menu, Switch, Toggle, ToggleGroup, ToggleOption, Tooltip } from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';

	import { h1 as H1 } from '$lib/markdown/blueprints/default/blueprint.svelte';
	import ViewSourceButton from '$lib/components/ViewSourceButton.svelte';
	import { examples } from '$lib/context.js';
	import { shared } from '$lib/shared.svelte.js';
	import { page } from '$app/state';

	import LucideSettings from '~icons/lucide/settings';
	import LucideCode from '~icons/lucide/code';
	import LucideChevronRight from '~icons/lucide/chevron-right';

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

<div class="flex items-center gap-2 text-xs font-bold">
	<div class="text-surface-content/50 capitalize">
		{metadata.section}
	</div>

	{#if page.params.example}
		<LucideChevronRight class="text-sm opacity-25" />
		<a href="/components/{page.params.name}" class="text-primary">{metadata.name}</a>
	{/if}
</div>

<div class="flex items-center gap-4">
	<h1 class="text-3xl font-bold first-letter:capitalize">
		{page.params.example?.replaceAll('-', ' ') ?? metadata.name}
	</h1>
	<span class="flex items-center gap-1">
		{#if metadata.layers}
			<ToggleGroup
				bind:value={shared.layer}
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

{#if page.params.example == null}
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
{/if}

{@render children()}
