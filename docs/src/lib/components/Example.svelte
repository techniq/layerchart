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

	import { page } from '$app/state';

	let {
		component = page.params.name!,
		name,
		showCode = false
	}: { component: string; name: string; showCode?: boolean } = $props();

	const example = examples.get()?.current[component]?.[name];

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

	let canResize = $derived(page.data.metadata?.resize);
</script>

<div class="example relative mt-1">
	{#if example}
		<div
			class={cls(
				'border rounded-t-sm bg-surface-300',
				canResize && 'overflow-hidden',
				!showCode && 'rounded-b-sm'
			)}
		>
			<div
				class={cls(
					'p-4 outline rounded bg-surface-200 shadow-lg',
					canResize && 'resize-x overflow-hidden max-w-full'
				)}
			>
				<!-- {#if page.params.example} -->
				<example.component bind:this={ref} />
				<!-- {:else}
					Inspect to view
				{/if} -->
			</div>
		</div>

		{#if showCode}
			<div transition:slide class="border border-t-0">
				<Code source={example.source} />
			</div>
		{/if}

		<div class="mt-0.5">
			{#if example.source}
				<Button
					icon={LucideCode}
					class="text-surface-content/70 py-1"
					on:click={() => (showCode = !showCode)}
				>
					{showCode ? 'Hide' : 'Show'} Code
				</Button>
			{/if}

			{#if data}
				<Toggle let:on={open} let:toggle let:toggleOff>
					<Button icon={LucideTable} class="text-surface-content/70 py-1" on:click={toggle}>
						View data
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
				<Button
					href="{page.url.pathname}/{name}{component !== page.params.name
						? `?component=${component}`
						: ''}"
					icon={LucideFullscreen}
					class="text-surface-content/70 py-1"
				>
					Inspect
				</Button>
			{/if}
		</div>
	{:else}
		<div class="border border-danger bg-danger/5 text-danger px-4 py-2 rounded-md">
			Example <span class="font-bold">`{name}`</span> for
			<span class="font-bold">`{component}`</span> not found.
		</div>
	{/if}
</div>
