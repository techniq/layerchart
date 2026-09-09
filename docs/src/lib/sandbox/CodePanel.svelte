<script lang="ts">
	import { Code } from '@layerstack/docs/components';
	import { Button, CopyButton, ToggleGroup, ToggleOption, Tooltip } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import LucideCode from '~icons/lucide/code';
	import LucideFilePen from '~icons/lucide/file-pen';
	import LucideLoaderCircle from '~icons/lucide/loader-circle';
	import LucideRotateCcw from '~icons/lucide/rotate-ccw';
	import type { Sandbox } from './state.svelte';

	let {
		sandbox,
		showLineNumbers = false,
		highlight,
		class: className
	}: {
		sandbox: Sandbox;
		showLineNumbers?: boolean;
		highlight?: string;
		class?: string;
	} = $props();

	const editing = $derived(sandbox.mode === 'edit' && sandbox.module);
</script>

<!--
	The panel owns the background in both modes. In view mode `Code` paints its own
	`bg-surface-200 dark:bg-surface-300`, but the editor is deliberately transparent (so it
	can't disagree with `Code`), so without this the background disappears on switching to
	Edit anywhere the host didn't happen to supply one.
-->
<div class={cls('code-panel relative bg-surface-200 dark:bg-surface-300', className)}>
	{#if editing && sandbox.module}
		<sandbox.module.CodeEditor
			bind:value={sandbox.source}
			diagnostics={sandbox.diagnostics}
			autofocus
			class="h-full"
		/>
	{:else}
		<!-- `Code`'s own copy button is off; the toolbar below serves both modes. -->
		<Code
			source={sandbox.source}
			{showLineNumbers}
			{highlight}
			copyButton={false}
			class="outline-none h-full"
		/>
	{/if}

	<!--
		Sits where `Code` puts its copy button, and is identical in both modes so nothing
		moves when they swap. `pointerenter` starts fetching the editor chunk before the
		click lands. `screenshot-hidden` keeps it out of generated screenshots.
	-->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="screenshot-hidden absolute top-1 right-1 z-10 flex items-center gap-0.5 rounded-sm bg-surface-200/80 dark:bg-surface-300/80 p-0.5 backdrop-blur-sm"
		onpointerenter={() => sandbox.load()}
	>
		{#if sandbox.dirty}
			<Tooltip title="Revert to the original example">
				<Button
					icon={LucideRotateCcw}
					size="sm"
					iconOnly
					class="text-surface-content/70 hover:bg-surface-100/20 p-0.5"
					on:click={() => sandbox.reset()}
				/>
			</Tooltip>
		{/if}

		<Tooltip title="Copy source">
			<CopyButton
				value={sandbox.source}
				size="sm"
				iconOnly
				class="text-surface-content/70 hover:bg-surface-100/20 p-0.5"
			/>
		</Tooltip>

		<!--
			Kept deliberately short: this floats over the code, and every extra pixel of
			height hides another line. At ~30px it clears everything below line one.
		-->
		<ToggleGroup
			value={sandbox.mode}
			variant="outline"
			size="xs"
			inset
			on:change={(e) => sandbox.setMode(e.detail.value)}
			classes={{ root: 'ml-1.5', option: 'px-1.5 py-0 leading-5 flex items-center gap-1' }}
		>
			<ToggleOption value="view">
				<LucideCode class="size-3" />
				View
			</ToggleOption>
			<ToggleOption value="edit">
				<!--
					Same-size icon swap rather than a text change: the label is inside an
					auto-width toggle, so "Edit" -> "Loading…" resized the whole toolbar and
					visibly shifted it left mid-hover.
				-->
				{#if sandbox.pending}
					<LucideLoaderCircle class="size-3 animate-spin" />
				{:else}
					<LucideFilePen class="size-3" />
				{/if}
				Edit
			</ToggleOption>
		</ToggleGroup>
	</div>

	{#if sandbox.loadError}
		<div
			class="absolute inset-x-2 bottom-2 rounded-sm border border-danger bg-danger/10 p-2 text-xs text-danger"
		>
			Couldn't load the editor: {sandbox.loadError}
		</div>
	{/if}
</div>

<style>
	/*
	 * `Code` exposes no hook for its inner scroll container, which is `h-auto` — left
	 * alone it grows past a height-constrained panel instead of scrolling inside it, so
	 * activating the editor (which does fill the panel) would resize the whole block.
	 */
	.code-panel :global(.Code) {
		height: 100%;
	}
</style>
