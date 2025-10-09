<script lang="ts">
	import { examples } from '$lib/context';
	import { Button, CopyButton, Dialog, Toggle, Tooltip } from 'svelte-ux';
	import { slide } from 'svelte/transition';

	import LucideCode from '~icons/lucide/code';
	import LucideTable from '~icons/lucide/table';

	import Code from './Code.svelte';

	let { name }: { name: string } = $props();

	const example = examples.get()?.[name];

	let showCode = $state(false);

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

	function getDataAsString(_data: typeof example.data) {
		try {
			// Regular expression to match quoted instantiation (ex. `"new Date(...)"`) and stripe the quotes  (`new Date(...)`)
			const datePattern = /"(new \w+\([^)]*\))"/g;
			return JSON.stringify(_data, replacer, 2).replace(datePattern, '$1');
		} catch (e) {
			console.error('Error capturing value to copy', e);
			return '';
		}
	}
</script>

{#if example}
	<example.component />

	{#if showCode}
		<div transition:slide class="border border-t-0">
			<Code source={example.source} />
		</div>
	{/if}

	{#if example.source}
		<Button
			icon={LucideCode}
			class="text-surface-content/70 py-1"
			on:click={() => (showCode = !showCode)}
		>
			{showCode ? 'Hide' : 'Show'} Code
		</Button>
	{/if}

	{#if example.data}
		<Toggle let:on={open} let:toggle let:toggleOff>
			<Button icon={LucideTable} class="text-surface-content/70 py-1" on:click={toggle}
				>View data</Button
			>
			<Dialog
				{open}
				on:close={toggleOff}
				class="max-h-[98dvh] md:max-h-[90dvh] max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto_1fr_auto]"
			>
				<div class="grid grid-cols-[1fr_auto] gap-3 items-center p-4">
					<div class="overflow-auto">
						<div class="text-lg font-semibold">Chart data</div>
					</div>

					<Tooltip title="Copy">
						<CopyButton
							value={() => getDataAsString(example.data)}
							variant="fill-light"
							color="primary"
						/>
					</Tooltip>
				</div>

				<!-- TODO: add svelte-inspect-value -->
				<!-- <Json value={example.data} /> -->

				<div slot="actions">
					<Button variant="fill" color="primary">Close</Button>
				</div>
			</Dialog>
		</Toggle>
	{/if}
{:else}
	Example "{name}" not found.
{/if}
