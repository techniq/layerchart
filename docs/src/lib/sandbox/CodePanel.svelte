<script lang="ts">
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
		lineNumbers = $bindable(false),
		highlight,
		onopenstackblitz,
		split = false,
		onsplitchange
	}: {
		sandbox: Sandbox;
		/**
		 * One setting for View and Edit, so switching modes never adds or drops the gutter.
		 * Bindable so the host keeps it when it remounts this panel (ex. changing layout).
		 */
		lineNumbers?: boolean;
		highlight?: string;
		/** Adds "Open in StackBlitz" to the menu when set. */
		onopenstackblitz?: () => Promise<void>;
		/** Whether the host shows this beside the preview rather than below it. */
		split?: boolean;
		/** Shows the layout toggle when set. */
		onsplitchange?: (split: boolean) => void;
	} = $props();

	let opening = $state(false);

	// `surface-content` rather than a surface shade, so the hover reads on the translucent
	// toolbar in both themes.
	const iconButton =
		'text-surface-content/70 hover:text-surface-content hover:bg-surface-content/10 p-0.5';

	/**
	 * Clicking into the read-only code switches to Edit, with the caret where you clicked.
	 * Only a real click counts: a drag that moved the pointer or selected text stays in
	 * View (so code can still be copied), and a touch scroll never produces a click at all.
	 */
	let down: { x: number; y: number } | null = null;
	let caret = $state<{ x: number; y: number } | null>(null);

	function onpointerdown(e: PointerEvent) {
		if (sandbox.mode === 'edit' || e.button !== 0) return;
		down = { x: e.clientX, y: e.clientY };
		// Start fetching the editor as the click begins. Not for touch, where this is as
		// likely the start of a scroll.
		if (e.pointerType === 'mouse') sandbox.load();
	}

	function onclick(e: MouseEvent) {
		if (sandbox.mode === 'edit' || !down) return;
		const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4;
		down = null;
		if (moved || !getSelection()?.isCollapsed) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		caret = { x: e.clientX - rect.left, y: e.clientY - rect.top };
		sandbox.setMode('edit');
	}

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
<div class="code-panel relative bg-surface-200 dark:bg-surface-300">
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
				on:change={(e) => {
					caret = null;
					sandbox.setMode(e.detail.value);
				}}
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
						<MenuItem icon={LucideListOrdered} on:click={() => (lineNumbers = !lineNumbers)}>
							{lineNumbers ? 'Hide line numbers' : 'Show line numbers'}
						</MenuItem>
						{#if onsplitchange}
							<MenuItem
								icon={split ? LucideRows2 : LucideColumns2}
								on:click={() => onsplitchange(!split)}
							>
								{split ? 'Show code below' : 'Show code on left'}
							</MenuItem>
						{/if}
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
	<!-- Keyboard users switch with the View/Edit toggle; this is a shortcut for pointers. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="-mt-9" {onpointerdown} onpointercancel={() => (down = null)} {onclick}>
		{#if sandbox.mode === 'edit' && sandbox.module}
			<sandbox.module.CodeEditor
				bind:value={sandbox.source}
				diagnostics={sandbox.diagnostics}
				{lineNumbers}
				caretAt={caret}
				autofocus
			/>
		{:else}
			<!-- `Code`'s own copy button is off; the toolbar above serves both modes. -->
			<Code
				source={sandbox.source}
				showLineNumbers={lineNumbers}
				{highlight}
				copyButton={false}
				class="outline-none"
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
		Shared with `CodeEditor`'s gutter, which sits inside this panel: the panel's own
		background, translucent so the blur shows over code passing beneath.
	*/
	.code-panel {
		--code-gutter-bg: color-mix(in oklab, var(--color-surface-200) 80%, transparent);
	}

	:global(.dark) .code-panel {
		--code-gutter-bg: color-mix(in oklab, var(--color-surface-300) 80%, transparent);
	}

	/*
		`Code` draws each number as an inline `::before` on its line, so a long line scrolled
		them out of view. Here they're pinned to the left of the `pre` that scrolls, over a
		translucent, blurred strip the code passes beneath, matching `CodeEditor`'s gutter:
		0.5rem + a 2rem column + 0.5rem, then a 1rem gap, so the code still starts 4rem in.

		The strip is one element spanning the panel's padding too (per-line backgrounds would
		stop short of it), so the panel loses its left padding and the scroller starts at the
		edge. `isolation` keeps the strip and numbers' z-indexes inside the panel.
	*/
	.code-panel :global(.show-line-numbers) {
		padding-left: 0;
		isolation: isolate;
	}

	.code-panel :global(.show-line-numbers::before) {
		content: '';
		position: absolute;
		inset-block: 0;
		left: 0;
		z-index: 1;
		width: 3rem;
		background-color: var(--code-gutter-bg);
		backdrop-filter: blur(8px);
	}

	/*
		Sticky numbers can't travel past their block, so it has to be as wide as the longest
		line. The 4rem inset is padding with the number pulled back into it, rather than the
		number's own width: tab stops count from the start of the line box, so a number taking
		up room there shifted every indent a few px off the editor's.
	*/
	.code-panel :global(.show-line-numbers .shiki) {
		width: max-content;
		min-width: 100%;
		padding-left: 4rem;
	}

	.code-panel :global(.show-line-numbers .shiki .line::before) {
		position: sticky;
		left: 0;
		z-index: 2;
		width: 3rem;
		margin-left: -4rem;
		padding: 0 0.5rem;
	}
</style>
