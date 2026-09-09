<script lang="ts">
	import { mount, unmount, untrack, type Snippet } from 'svelte';
	import { Code } from '@layerstack/docs/components';
	import { Button, CopyButton, ToggleGroup, ToggleOption, Tooltip } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import LucideCode from '~icons/lucide/code';
	import LucideFilePen from '~icons/lucide/file-pen';
	import LucideLoaderCircle from '~icons/lucide/loader-circle';
	import LucideRotateCcw from '~icons/lucide/rotate-ccw';
	import type { Diagnostic } from './compile';

	let {
		source = '',
		preview,
		class: className
	}: {
		source?: string;
		/** The real, statically-imported example. Shown until the user starts editing. */
		preview?: Snippet;
		class?: string;
	} = $props();

	type Sandbox = typeof import('./lazy');

	let sandbox = $state<Sandbox | null>(null);
	let loading = $state(false);
	let loadError = $state<string | null>(null);

	// Seeded once — the editor owns the source once the sandbox is live.
	const original = untrack(() => source);
	let editorValue = $state(original);
	let diagnostics = $state<Diagnostic[]>([]);
	let elapsed = $state(0);
	let runtimeError = $state<string | null>(null);

	let mode = $state<'view' | 'edit'>('view');
	/**
	 * Distinct from `loading`: true only once the user has actually asked for the editor.
	 * The hover prefetch sets `loading` too, and showing progress for a speculative fetch
	 * the user never asked for is just noise.
	 */
	let pending = $state(false);

	/**
	 * Pull in the compiler and editor. Called on `pointerenter` over the toggle as well as
	 * on the switch itself, so the ~390KB chunk is usually in flight before the click lands.
	 *
	 * Returns the in-flight promise rather than bailing out when a fetch is already running:
	 * a click that lands mid-prefetch has to await the *same* load, otherwise it would
	 * resolve immediately and switch to a mode whose editor doesn't exist yet.
	 */
	let inFlight: Promise<void> | null = null;
	function load() {
		if (sandbox) return Promise.resolve();
		if (!inFlight) {
			loading = true;
			inFlight = import('./lazy')
				.then((m) => {
					sandbox = m;
				})
				.catch((err) => {
					loadError = err instanceof Error ? err.message : String(err);
				})
				.finally(() => {
					loading = false;
				});
		}
		return inFlight;
	}

	async function setMode(next: 'view' | 'edit') {
		if (next === 'edit' && !sandbox) {
			pending = true;
			await load();
			pending = false;
		}
		mode = next;
	}

	function reset() {
		editorValue = original;
	}

	let target = $state<HTMLDivElement | null>(null);
	let debounced = $state(untrack(() => source));

	/**
	 * The real example keeps rendering until the source actually changes.
	 *
	 * Compiling on activation instead would remount the chart the moment you click into
	 * the code, and examples built on `createDateSeries` and friends draw fresh
	 * `Math.random()` data on every mount — so merely looking at the source would appear
	 * to redraw the chart. Latched, because toggling back on undo would reshuffle again.
	 */
	let live = $state(false);
	$effect(() => {
		if (editorValue !== untrack(() => original)) live = true;
	});

	$effect(() => {
		const next = editorValue;
		const timer = setTimeout(() => (debounced = next), 120);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		const sb = sandbox;
		const src = debounced;
		const el = target;
		if (!sb || !el || !live) return;

		const result = sb.compileSource(src);
		diagnostics = result.diagnostics;
		elapsed = Math.round(result.elapsed);
		if (!result.url) return;

		let component: Record<string, any> | null = null;
		let disposed = false;

		import(/* @vite-ignore */ result.url)
			.then(({ default: Component }) => {
				URL.revokeObjectURL(result.url!);
				if (disposed) return;
				runtimeError = null;
				component = mount(Component, { target: el });
			})
			.catch((err) => {
				URL.revokeObjectURL(result.url!);
				if (!disposed) runtimeError = err instanceof Error ? err.message : String(err);
			});

		return () => {
			disposed = true;
			if (component) unmount(component);
		};
	});

	const errors = $derived(diagnostics.filter((d) => d.severity === 'error'));
	const status = $derived(runtimeError ?? errors[0]?.message ?? (live ? `${elapsed}ms` : null));
</script>

<div class={cls('grid md:grid-cols-2 border rounded-sm overflow-clip', className)}>
	<div
		class="code-panel relative min-h-0 overflow-hidden bg-surface-200 dark:bg-surface-300 border-b md:border-b-0 md:border-r"
	>
		{#if mode === 'edit' && sandbox}
			<sandbox.CodeEditor bind:value={editorValue} {diagnostics} autofocus class="h-full" />
		{:else}
			<!-- `Code`'s own copy button is off; the overlay below provides one for both modes. -->
			<Code source={editorValue} copyButton={false} class="outline-none h-full" />
		{/if}

		<!--
			Same position `Code` puts its copy button, so nothing moves between modes.
			`pointerenter` starts fetching the editor chunk before the click lands.
		-->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute top-1 right-1 z-10 flex items-center gap-0.5 rounded-sm bg-surface-200/80 dark:bg-surface-300/80 p-0.5 backdrop-blur-sm"
			onpointerenter={load}
		>
			{#if editorValue !== original}
				<Tooltip title="Revert to the original example">
					<Button
						icon={LucideRotateCcw}
						size="sm"
						iconOnly
						class="text-surface-content/70 hover:bg-surface-100/20 p-1"
						on:click={reset}
					/>
				</Tooltip>
			{/if}

			<Tooltip title="Copy source">
				<CopyButton
					value={editorValue}
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
				value={mode}
				variant="outline"
				size="xs"
				inset
				on:change={(e) => setMode(e.detail.value)}
				classes={{
					root: 'ml-1.5',
					option: 'px-1.5 py-0 leading-5 flex items-center gap-1'
				}}
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
					{#if pending}
						<LucideLoaderCircle class="size-3 animate-spin" />
					{:else}
						<LucideFilePen class="size-3" />
					{/if}
					Edit
				</ToggleOption>
			</ToggleGroup>
		</div>

		{#if loadError}
			<div
				class="absolute inset-x-2 bottom-2 rounded-sm border border-danger bg-danger/10 p-2 text-xs text-danger"
			>
				Couldn't load the editor: {loadError}
			</div>
		{/if}
	</div>

	<div class="relative overflow-auto p-4 bg-surface-100">
		{#if live}
			<div bind:this={target}></div>
		{:else}
			{@render preview?.()}
		{/if}

		{#if status}
			<div
				class={cls(
					'absolute right-2 bottom-1 max-w-[90%] truncate text-[10px]',
					runtimeError || errors.length ? 'text-danger' : 'text-surface-content/40'
				)}
				title={status}
			>
				{status}
			</div>
		{/if}
	</div>
</div>

<style>
	/*
	 * `Code` exposes no hook for its inner scroll container, which is `h-auto` — left
	 * alone it grows past the panel instead of scrolling inside it, so activating the
	 * editor (which does fill the panel) would resize the whole block.
	 */
	.code-panel :global(.Code) {
		height: 100%;
	}
</style>
