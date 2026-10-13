<script lang="ts">
	import { untrack } from 'svelte';
	import { Code } from '@layerstack/docs/components';
	import {
		Button,
		CopyButton,
		Menu,
		MenuItem,
		Toggle,
		ToggleGroup,
		ToggleOption,
		Tooltip
	} from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import LucideCode from '~icons/lucide/code';
	import LucideColumns2 from '~icons/lucide/columns-2';
	import LucideEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import LucideFilePen from '~icons/lucide/file-pen';
	import LucideListOrdered from '~icons/lucide/list-ordered';
	import LucideLoaderCircle from '~icons/lucide/loader-circle';
	import LucideRotateCcw from '~icons/lucide/rotate-ccw';
	import LucideRows2 from '~icons/lucide/rows-2';
	import SimpleIconsStackblitz from '~icons/simple-icons/stackblitz';
	import type { Sandbox } from './state.svelte';

	let {
		sandbox,
		showLineNumbers = false,
		highlight,
		onopenstackblitz,
		split = false,
		onsplitchange,
		class: className
	}: {
		sandbox: Sandbox;
		showLineNumbers?: boolean;
		highlight?: string;
		/** Adds "Open in StackBlitz" to the menu when set. */
		onopenstackblitz?: () => Promise<void>;
		/** Whether the host shows this beside the preview rather than below it. */
		split?: boolean;
		/** Shows the layout toggle when set. */
		onsplitchange?: (split: boolean) => void;
		class?: string;
	} = $props();

	let opening = $state(false);

	const editing = $derived(sandbox.mode === 'edit' && sandbox.module);

	// Seeded from the prop, then owned here: one toggle drives both View and Edit, so
	// switching modes never adds or drops the gutter.
	let lineNumbers = $state(untrack(() => showLineNumbers));

	// `surface-content` rather than a surface shade, so the hover reads on the translucent
	// toolbar in both themes.
	const iconButton =
		'text-surface-content/70 hover:text-surface-content hover:bg-surface-content/10 p-0.5';

	async function openStackBlitz() {
		opening = true;
		await onopenstackblitz?.().finally(() => (opening = false));
	}
</script>

<!--
	The panel owns the background in both modes. In view mode `Code` paints its own
	`bg-surface-200 dark:bg-surface-300`, but the editor is deliberately transparent (so it
	can't disagree with `Code`), so without this the background disappears on switching to
	Edit anywhere the host didn't happen to supply one.
-->
<div class={cls('code-panel relative bg-surface-200 dark:bg-surface-300', className)}>
	<!--
		Sits where `Code` puts its copy button, and is identical in both modes so nothing
		moves when they swap. `pointerenter` starts fetching the editor chunk before the
		click lands. `screenshot-hidden` keeps it out of generated screenshots.

		Sticky, so a long source keeps its controls in view while the page scrolls: held
		just below the docs header (`--code-toolbar-top`, 4rem by default; a host that
		scrolls the panel itself sets it to 0), and only as far as the panel's bottom. The
		row keeps its real height so that limit holds; the code is pulled up under it
		instead (`-mt-9`), and the row ignores the pointer outside the toolbar so it doesn't
		block the lines beneath.
	-->
	<div
		class="screenshot-hidden pointer-events-none sticky top-[var(--code-toolbar-top,4rem)] z-10 flex h-9 justify-end"
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="pointer-events-auto mt-1 mr-1 flex h-fit items-center gap-0.5 rounded-sm bg-surface-200/80 dark:bg-surface-300/80 p-0.5 backdrop-blur-sm"
			onpointerenter={() => sandbox.load()}
		>
			{#if sandbox.dirty}
				<Tooltip title="Revert to the original example">
					<Button
						icon={LucideRotateCcw}
						size="sm"
						iconOnly
						class={iconButton}
						on:click={() => sandbox.reset()}
					/>
				</Tooltip>
			{/if}

			<Tooltip title="Copy source">
				<CopyButton value={sandbox.source} size="sm" iconOnly class={iconButton} />
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

			<!-- Occasional actions and set-once preferences, kept off the strip that covers the code. -->
			<Toggle let:on={open} let:toggle let:toggleOff>
				<Button
					icon={LucideEllipsisVertical}
					size="sm"
					iconOnly
					loading={opening}
					aria-label="More options"
					class={cls(iconButton, 'ml-0.5')}
					on:click={toggle}
				>
					<Menu {open} on:close={toggleOff} placement="bottom-end" classes={{ menu: 'p-1' }}>
						{#if onsplitchange}
							<MenuItem
								icon={split ? LucideRows2 : LucideColumns2}
								on:click={() => onsplitchange(!split)}
							>
								{split ? 'Show code below' : 'Show code on left'}
							</MenuItem>
						{/if}
						<MenuItem icon={LucideListOrdered} on:click={() => (lineNumbers = !lineNumbers)}>
							{lineNumbers ? 'Hide line numbers' : 'Show line numbers'}
						</MenuItem>
						{#if onopenstackblitz}
							<MenuItem icon={SimpleIconsStackblitz} on:click={openStackBlitz}>
								{sandbox.dirty ? 'Open edits in StackBlitz' : 'Open in StackBlitz'}
							</MenuItem>
						{/if}
					</Menu>
				</Button>
			</Toggle>
		</div>
	</div>
	<div class="-mt-9 h-full">
		{#if editing && sandbox.module}
			<sandbox.module.CodeEditor
				bind:value={sandbox.source}
				diagnostics={sandbox.diagnostics}
				{lineNumbers}
				autofocus
				class="h-full"
			/>
		{:else}
			<!-- `Code`'s own copy button is off; the toolbar above serves both modes. -->
			<Code
				source={sandbox.source}
				showLineNumbers={lineNumbers}
				{highlight}
				copyButton={false}
				class="outline-none h-full"
			/>
		{/if}
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
