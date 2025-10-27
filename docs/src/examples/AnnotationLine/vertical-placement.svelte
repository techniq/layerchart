<script lang="ts">
	import { AnnotationLine, LineChart, type Placement } from 'layerchart';
	import { Button, Field, Menu, RangeField, Toggle } from 'svelte-ux';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

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
	let placement: Placement = $state('top-right');
	let xOffset = $state(0);
	let yOffset = $state(0);

	export { data };
</script>

<div class="grid grid-cols-3 gap-2 mb-2">
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

	<RangeField label="X Offset" bind:value={xOffset} max={10} />
	<RangeField label="Y Offset" bind:value={yOffset} max={10} />
</div>

<LineChart {data} x="date" y="value" height={300}>
	{#snippet aboveMarks({ context })}
		<AnnotationLine
			x={new Date('2010-03-30')}
			label={placement}
			labelPlacement={placement}
			labelXOffset={xOffset}
			labelYOffset={yOffset}
			props={{
				line: { class: '[stroke-dasharray:2,2] stroke-danger' },
				label: { class: 'fill-danger' }
			}}
		/>
	{/snippet}
</LineChart>
