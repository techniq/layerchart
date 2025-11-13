<script lang="ts">
	import type { Placement } from 'layerchart';
	import { Button, Field, Menu, RangeField, Toggle } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	// <AnnotationRangePointLineControls bind:placement bind:xOffset bind:yOffset bind:radius includeRadius/>

	interface Props {
		placement?: Placement;
		xOffset?: number;
		yOffset?: number;
		radius?: number;
		includeRadius?: boolean;
	}

	let {
		placement = $bindable('center'),
		xOffset = $bindable(0),
		yOffset = $bindable(0),
		radius = $bindable(4),
		includeRadius = $bindable(false)
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
	class={cls('grid gap-2 mb-4', 'screenshot-hidden', includeRadius ? 'grid-cols-4' : 'grid-cols-3')}
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
	{#if includeRadius}
		<RangeField label="Radius" bind:value={radius} max={10} />
	{/if}
</div>
