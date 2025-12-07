<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Button, CopyButton, Dialog, Toggle, Tooltip } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	import { examples } from '$lib/context';
	import Code from './Code.svelte';
	import Json from './Json.svelte';

	import LucideCode from '~icons/lucide/code';
	import LucideFullscreen from '~icons/lucide/fullscreen';
	import LucideTable from '~icons/lucide/table';
	import LucideFilePen from '~icons/lucide/file-pen';
	import LucideGripVertical from '~icons/lucide/grip-vertical';

	import { page } from '$app/state';
	import { openInStackBlitz } from '$lib/utils/stackblitz.svelte';
	import { movable } from '$lib/actions/movable';

	let {
		component = page.params.name!,
		name,
		showCode = false,
		variant = 'default',
		noResize = false,
		clip = false,
		class: className
	}: {
		component: string;
		name: string;
		showCode?: boolean;
		variant?: 'default' | 'basic';
		noResize?: boolean;
		clip?: boolean;
		class?: string;
	} = $props();

	const example = examples.get()?.current[component]?.[name];

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
	let data = $derived(ref?.data);

	let canResize = $derived.by(() => {
		// Prop
		if (noResize) {
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
			>
				<example.component bind:this={ref} />
				{#if canResize}
					<div
						class="absolute top-0 right-0 bottom-0 flex items-center w-3 cursor-ew-resize select-none hover:bg-surface-content/5 transition-opacity"
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
				<Code source={example.source} class="outline-none" />
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

				{#if page.params.example == null}
					<!-- Only show View if not already viewing specific example -->
					<Button
						href="/docs/components/{component}/{name}"
						icon={LucideFullscreen}
						class="text-surface-content/70 py-1"
					>
						View
					</Button>
				{/if}

				<Button
					icon={LucideFilePen}
					class="text-surface-content/70 py-1"
					on:click={() => openInStackBlitz(component, name)}
				>
					Edit
				</Button>
			</div>
		{/if}
	{:else}
		<div class="border border-danger bg-danger/5 text-danger px-4 py-2 rounded-md">
			Example <span class="font-bold">`{name}`</span> for
			<span class="font-bold">`{component}`</span> not found.
		</div>
	{/if}
</div>
