<script lang="ts">
	import type { Placement } from 'layerchart';
	import { Button, Field, Menu, RangeField, Toggle } from 'svelte-ux';

	// <AnnotationPointControls bind:placement bind:xOffset bind:yOffset bind:radius />

	interface Props {
		placement?: Placement;
		xOffset?: number;
		yOffset?: number;
		radius?: number;
	}

	let {
		placement = $bindable('top'),
		xOffset = $bindable(0),
		yOffset = $bindable(0),
		radius = $bindable(4)
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

<div class="grid grid-cols-4 gap-2 mb-2">
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

	<RangeField label="Radius" bind:value={radius} max={10} />
	<RangeField label="X Offset" bind:value={xOffset} max={10} />
	<RangeField label="Y Offset" bind:value={yOffset} max={10} />
</div>
