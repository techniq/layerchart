<script lang="ts">
	import type { Placement } from 'layerchart';
	import { Button, Field, Menu, RangeField, Toggle } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	interface Props {
		placement?: Placement;
		xOffset?: number;
		yOffset?: number;
		radius?: number;
	}

	let {
		placement = $bindable(undefined),
		xOffset = $bindable(undefined),
		yOffset = $bindable(undefined),
		radius = $bindable(undefined)
	}: Props = $props();

	const placementOptions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	] as const;
</script>

<div
	class={cls(
		'grid gap-2 mb-4 screenshot-hidden',
		radius !== undefined ? 'grid-cols-4' : 'grid-cols-3'
	)}
>
	<Toggle let:on={open} let:toggle>
		<Field label="Placement" class="cursor-pointer" on:click={toggle}>
			<span class="text-sm">
				{placement}
			</span>
		</Field>

		<Menu {open} on:close={toggle} placement="bottom-start">
			<div class="grid grid-cols-3 gap-1 p-1">
				{#each placementOptions as option (option)}
					<Button
						variant="outline"
						color={option === placement ? 'primary' : 'default'}
						on:click={() => (placement = option)}
					>
						{option}
					</Button>
				{/each}
			</div>
		</Menu>
	</Toggle>
	<RangeField label="X offset" bind:value={xOffset} max={10} />
	<RangeField label="Y offset" bind:value={yOffset} max={10} />
	{#if radius !== undefined}
		<RangeField label="Radius" bind:value={radius} max={10} />
	{/if}
</div>
