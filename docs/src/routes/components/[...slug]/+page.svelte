<script lang="ts">
	import { Button, Menu, Switch, Toggle, ToggleGroup, ToggleOption, Tooltip } from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';

	import Code from '$lib/components/Code.svelte';
	import { h1 as H1, h2 as H2 } from '$lib/markdown/blueprints/default/blueprint.svelte';
	import { examples } from '$lib/context.js';
	import { shared } from '$lib/shared.svelte.js';

	import LucideSettings from '~icons/lucide/settings';

	let { data } = $props();

	const { PageComponent, metadata } = $derived(data);
	examples.set(data.examples);
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

<div class="text-surface-content/70">{metadata.description}</div>

<svelte:boundary>
	<PageComponent {examples} />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>

{#if metadata.related.length}
	<H2>Related</H2>
	<div>{metadata.related.join(', ')}</div>
{/if}

{#if metadata.source}
	<H2>Component source</H2>
	<Code source={metadata.source} />
{/if}
