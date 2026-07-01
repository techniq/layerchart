<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import { slide } from 'svelte/transition';
	import {
		Button,
		CopyButton,
		Dialog,
		Field,
		Menu,
		MenuItem,
		Notification,
		Toggle,
		ToggleGroup,
		ToggleOption,
		Tooltip
	} from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	import { examples } from '@layerstack/docs/context';
	import { resolveExamplePath } from '@layerstack/docs/content';
	import { untrack } from 'svelte';
	import { Code, Json } from '@layerstack/docs/components';

	import LucideCode from '~icons/lucide/code';
	import LucideFullscreen from '~icons/lucide/fullscreen';
	import LucideTable from '~icons/lucide/table';
	import LucideFilePen from '~icons/lucide/file-pen';
	import LucideGripVertical from '~icons/lucide/grip-vertical';
	import LucideImageDown from '~icons/lucide/image-down';
	import LucideCopy from '~icons/lucide/copy';

	import { page } from '$app/state';
	import { openInStackBlitz } from '$lib/utils/stackblitz.svelte';
	import {
		downloadImage,
		downloadSvg,
		getChartImageBlob,
		getChartSvgString,
		getSettings
	} from 'layerchart';

	const settings = getSettings();
	import { movable } from '$lib/actions/movable';

	let {
		component = page.params.name!,
		name,
		path,
		showCode = false,
		showLineNumbers = false,
		highlight,
		variant = 'default',
		noResize = false,
		clip = false,
		class: className
	}: {
		component?: string;
		name?: string;
		path?: string;
		showCode?: boolean;
		showLineNumbers?: boolean;
		highlight?: string;
		variant?: 'default' | 'basic';
		noResize?: boolean;
		clip?: boolean;
		class?: string;
	} = $props();

	// Get example from context (eagerly loaded by layout)
	// Cache context at init time — getContext() must be called during component initialization
	const examplesCtx = examples.get();

	// Use $state + $effect to break potential infinite reactivity loops during HMR
	let example = $state<{ component: any; source: string } | undefined>(undefined);

	$effect(() => {
		const current = examplesCtx?.current;
		let next: typeof example;
		if (path) {
			// Path-based example
			const resolvedPath = resolveExamplePath(
				path,
				page.url.pathname,
				page.url.pathname.startsWith('/docs/guides/') ? 'guides' : 'components'
			);
			next = current?.['__path__']?.[resolvedPath];
		} else if (component && name) {
			// Component/name-based example
			next = current?.[component]?.[name];
		} else {
			next = undefined;
		}
		// Only assign if the reference actually changed to avoid unnecessary downstream reactivity
		// Untrack both the read and write to prevent this effect from depending on its own output
		untrack(() => {
			if (example !== next) {
				example = next;
			}
		});
	});

	let containerEl = $state<HTMLElement | null>(null);
	let containerWidth = $state<number | undefined>(undefined);
	const minWidth = 200;

	/**
	 * Custom JSON replacer (to use with JSON.stringify()) to convert `Date` instances to `new Date()`
	 */
	function replacer(this: any, key: string, value: any): any {
		// TODO: Improve handling of circular structures and handle other data types (Map, Set, etc)
		if (this[key] instanceof Date) {
			return `new Date('${this[key].toISOString()}')`;
		}

		return value;
	}

	function getDataAsString(_data: any) {
		try {
			// Regular expression to match quoted instantiation (ex. `"new Date(...)"`) and stripe the quotes  (`new Date(...)`)
			const datePattern = /"(new \w+\([^)]*\))"/g;
			return JSON.stringify(_data, replacer, 2).replace(datePattern, '$1');
		} catch (e) {
			console.error('Error capturing value to copy', e);
			return '';
		}
	}

	let ref = $state<SvelteComponent | null>(null);
	let data = $derived.by(() => {
		try {
			return ref?.data;
		} catch {
			return undefined;
		}
	});

	// Ensure component name is always resolved consistently
	const resolvedComponent = $derived(component ?? page.params.name ?? '');
	// Only set view-transition-name on detail pages (when page.params.example matches)
	// This prevents conflicts with ExampleScreenshot on listing pages
	const isDetailPage = $derived(page.params.example === name);
	const viewTransitionName = $derived(
		isDetailPage && resolvedComponent && name ? `lc-${resolvedComponent}-${name}` : undefined
	);

	let canResize = $derived.by(() => {
		// Prop
		if (typeof noResize === 'boolean') {
			return !noResize;
		}

		// Page setting
		if (page.data.metadata?.resize !== undefined) {
			return page.data.metadata.resize;
		}

		// Check if source has any Chart component has explicit width in
		if (example?.source) {
			const hasExplicitWidth = /<\w*Chart[^>]*[\s\n]+width=\{[^}]+\}/.test(example.source);
			return !hasExplicitWidth;
		}

		return true;
	});

	let sentinelEl = $state<HTMLElement | null>(null);
	let intersected = $state(false);
	const lazy = $derived(!isDetailPage);
	let isVisible = $derived(!lazy || intersected);

	$effect(() => {
		if (!lazy || !sentinelEl) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					intersected = true;
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(sentinelEl);
		return () => observer.disconnect();
	});

	// $inspect({ component, name, isVisible, intersected, lazy, example });

	let svgUnavailable = $state(false);
	let svgUnavailableTimer: ReturnType<typeof setTimeout>;

	function handleSvgDownload() {
		const downloaded = downloadSvg(containerEl!, { filename: name ?? component });
		if (!downloaded) {
			clearTimeout(svgUnavailableTimer);
			svgUnavailable = true;
			svgUnavailableTimer = setTimeout(() => (svgUnavailable = false), 3000);
		}
	}

	async function handleSvgCopy() {
		const svg = getChartSvgString(containerEl!);
		if (!svg) {
			clearTimeout(svgUnavailableTimer);
			svgUnavailable = true;
			svgUnavailableTimer = setTimeout(() => (svgUnavailable = false), 3000);
			return;
		}
		await navigator.clipboard.writeText(svg);
	}

	// PNG capture options dialog — used by both Copy as PNG and Export as PNG.
	let pngDialogOpen = $state(false);
	let pngAction = $state<'copy' | 'export'>('copy');
	let pngPixelRatio = $state(1);
	let pngBackground = $state<'transparent' | 'white' | 'black' | 'surface'>('transparent');

	function openPngDialog(action: 'copy' | 'export') {
		pngAction = action;
		pngDialogOpen = true;
	}

	function resolveBackground(): string | undefined {
		if (pngBackground === 'transparent') return undefined;
		// Resolve `surface` to the actual rendered background color so the PNG
		// matches the on-page chrome (and follows the active light/dark theme).
		if (pngBackground === 'surface') {
			return containerEl
				? window.getComputedStyle(containerEl).backgroundColor || undefined
				: undefined;
		}
		return pngBackground;
	}

	async function runPngCapture() {
		const options = {
			pixelRatio: pngPixelRatio,
			background: resolveBackground()
		};
		if (pngAction === 'copy') {
			const blob = await getChartImageBlob(containerEl!, options);
			await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
		} else {
			await downloadImage(containerEl!, { ...options, filename: name ?? component });
		}
		pngDialogOpen = false;
	}
</script>

<div class={cls('example relative', clip && 'overflow-clip', className)}>
	{#if example}
		<div
			class={cls(
				variant === 'default' && 'border rounded-t-sm bg-surface-300',
				!showCode && 'rounded-b-sm'
			)}
		>
			<div
				class={cls(
					'relative max-w-full',
					variant === 'default' && 'p-4 rounded bg-surface-200 shadow-lg'
				)}
				bind:this={containerEl}
				style:width={containerWidth ? `${containerWidth}px` : undefined}
				style:view-transition-name={viewTransitionName}
			>
				{#if isVisible}
					<svelte:boundary>
						<example.component bind:this={ref} />
						{#snippet failed(error, reset)}
							<div class="border border-danger rounded-md bg-danger/5 p-4 text-sm">
								<div class="font-semibold text-danger mb-2">
									Example error{#if component && name}: {component}/{name}{/if}
								</div>
								<pre
									class="text-danger/80 whitespace-pre-wrap break-words overflow-auto max-h-60">{error}</pre>
								<Button variant="outline" color="danger" size="sm" class="mt-2" on:click={reset}
									>Retry</Button
								>
							</div>
						{/snippet}
						{#snippet pending()}
							<div class="min-h-80 flex items-center justify-center text-surface-content/30">
								Loading...
							</div>
						{/snippet}
					</svelte:boundary>
				{:else}
					<div bind:this={sentinelEl} class="min-h-80"></div>
				{/if}

				{#if canResize}
					<div
						class="absolute top-0 right-0 bottom-0 flex items-center w-3 cursor-ew-resize select-none hover:bg-surface-content/5 transition-opacity screenshot-hidden"
						title="Drag to resize"
						use:movable={{
							axis: 'x',
							onMove: (e) => {
								const newWidth = (containerWidth ?? containerEl?.offsetWidth ?? 0) + e.detail.dx;
								if (newWidth >= minWidth) {
									containerWidth = newWidth;
								}
							}
						}}
					>
						<LucideGripVertical class="text-surface-content/50" />
					</div>
				{/if}
			</div>
		</div>

		{#if showCode}
			<div transition:slide class={cls('border border-t-0', showCode && 'rounded-b-sm')}>
				<Code source={example.source} {showLineNumbers} {highlight} class="outline-none" />
			</div>
		{/if}

		{#if variant === 'default'}
			<div class="mt-0.5">
				{#if example.source}
					<Button
						icon={LucideCode}
						class="text-surface-content/70 py-1"
						on:click={() => (showCode = !showCode)}
					>
						{showCode ? 'Hide' : ''} Code
					</Button>
				{/if}

				{#if data}
					<Toggle let:on={open} let:toggle let:toggleOff>
						<Button icon={LucideTable} class="text-surface-content/70 py-1" on:click={toggle}>
							Data
						</Button>

						<Dialog
							{open}
							on:close={toggleOff}
							class="max-h-[98dvh] md:max-h-[90dvh] w-160 max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto_1fr_auto]"
						>
							<div class="grid grid-cols-[1fr_auto] gap-3 items-center p-4">
								<div class="overflow-auto">
									<div class="text-lg font-semibold">Chart data</div>
								</div>

								<Tooltip title="Copy">
									<CopyButton
										value={() => getDataAsString(data)}
										variant="fill-light"
										color="primary"
									/>
								</Tooltip>
							</div>

							<Json value={data} class="border-t" />

							<div slot="actions">
								<Button variant="fill" color="primary">Close</Button>
							</div>
						</Dialog>
					</Toggle>
				{/if}

				{#if page.params.example == null && component && name}
					<!-- Only show View if not already viewing specific example -->
					<Button
						href="/docs/components/{component}/{name}"
						icon={LucideFullscreen}
						class="text-surface-content/70 py-1"
					>
						View
					</Button>
				{/if}

				{#if component && name}
					<Button
						icon={LucideFilePen}
						class="text-surface-content/70 py-1"
						on:click={() => openInStackBlitz(component, name)}
					>
						Edit
					</Button>
				{/if}

				<Toggle let:on={open} let:toggle let:toggleOff>
					<Button icon={LucideImageDown} class="text-surface-content/70 py-1" on:click={toggle}>
						Export
						<Menu {open} on:close={toggleOff} placement="bottom-start" classes={{ menu: 'p-1' }}>
							<MenuItem icon={LucideCopy} on:click={() => openPngDialog('copy')}>
								Copy as PNG
							</MenuItem>
							<MenuItem icon={LucideImageDown} on:click={() => openPngDialog('export')}>
								Export as PNG
							</MenuItem>
							{#if settings.layer !== 'canvas'}
								<MenuItem icon={LucideCopy} on:click={handleSvgCopy}>Copy as SVG</MenuItem>
								<MenuItem icon={LucideImageDown} on:click={handleSvgDownload}>
									Export as SVG
								</MenuItem>
							{/if}
						</Menu>
					</Button>
				</Toggle>
			</div>
		{/if}
	{:else}
		<div class="border border-danger bg-danger/5 text-danger px-4 py-2 rounded-md">
			Example <span class="font-bold">`{path ?? name}`</span>
			{#if component && !path}
				for <span class="font-bold">`{component}`</span>
			{/if}
			not found.
		</div>
	{/if}
</div>

{#if svgUnavailable}
	<div class="fixed bottom-4 right-4 z-50">
		<Notification
			description="SVG is not available for Canvas-only charts"
			color="warning"
			closeIcon
			on:close={() => (svgUnavailable = false)}
		/>
	</div>
{/if}

<Dialog bind:open={pngDialogOpen} on:close={() => (pngDialogOpen = false)} class="max-w-md">
	<div slot="title">{pngAction === 'copy' ? 'Copy as PNG' : 'Export as PNG'}</div>

	<div class="grid gap-4 p-4">
		<Field label="Resolution" dense>
			<ToggleGroup bind:value={pngPixelRatio} variant="outline" size="sm">
				<ToggleOption value={1}>1×</ToggleOption>
				<ToggleOption value={2}>2×</ToggleOption>
				<ToggleOption value={3}>3×</ToggleOption>
			</ToggleGroup>
		</Field>

		<Field label="Background" dense>
			<ToggleGroup bind:value={pngBackground} variant="outline" size="sm">
				<ToggleOption value="transparent">Transparent</ToggleOption>
				<ToggleOption value="surface">Surface</ToggleOption>
				<ToggleOption value="white">White</ToggleOption>
				<ToggleOption value="black">Black</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>

	<div slot="actions">
		<Button variant="fill" color="primary" on:click={runPngCapture}>
			{pngAction === 'copy' ? 'Copy' : 'Export'}
		</Button>
		<Button on:click={() => (pngDialogOpen = false)}>Cancel</Button>
	</div>
</Dialog>
