<script lang="ts">
	import { AnnotationPoint, LineChart, type Placement } from 'layerchart';
	import { Button, Field, Menu, RangeField, Toggle } from 'svelte-ux';
	import { maxIndex } from 'd3-array';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());

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
	let placement: Placement = $state('top');
	let xOffset = $state(0);
	let yOffset = $state(0);
	let radius = $state(4);

	export { data };
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
				{#each placementOptions as option}
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

<LineChart {data} x="date" y="value" height={300}>
	{#snippet aboveMarks({ context })}
		{@const maxPoint = data[maxIndex(data, (d) => d.value)]}
		<AnnotationPoint
			x={maxPoint.date}
			y={maxPoint.value}
			r={radius}
			label={placement}
			labelPlacement={placement}
			labelXOffset={xOffset}
			labelYOffset={yOffset}
			props={{
				circle: { class: 'fill-secondary' },
				label: { class: 'fill-secondary font-bold' }
			}}
		/>
	{/snippet}
</LineChart>
