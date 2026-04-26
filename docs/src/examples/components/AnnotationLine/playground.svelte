<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { Button, Field, Menu, RangeField, Switch, Toggle } from 'svelte-ux';
	import { AnnotationLine, Circle, LineChart, type Placement } from 'layerchart';
	import { movable } from '$lib/attachments/movable.js';

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

	let x1: Date = $state(new Date('2009-01-01'));
	let y1 = $state(200);
	let x2: Date = $state(new Date('2010-12-31'));
	let y2 = $state(600);

	let placement: Placement = $state('top');
	let xOffset = $state(0);
	let yOffset = $state(0);

	let showControls = $state(true);

	export { data };
</script>

<div class="flex flex-wrap gap-2 mb-2 screenshot-hidden">
	<Field label="Show controls" class="w-26 shrink-0">
		<Switch bind:checked={showControls} />
	</Field>

	<Toggle let:on={open} let:toggle>
		<Field label="Placement" class="cursor-pointer flex-1 basis-40" on:click={toggle}>
			<span class="text-sm">{placement}</span>
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
	<RangeField
		label="X offset"
		bind:value={xOffset}
		min={-100}
		max={100}
		classes={{ root: 'flex-1 basis-40' }}
	/>
	<RangeField
		label="Y offset"
		bind:value={yOffset}
		min={-100}
		max={100}
		classes={{ root: 'flex-1 basis-40' }}
	/>
</div>

<LineChart
	{data}
	x="date"
	y="value"
	height={300}
	padding={{ top: 10, bottom: 20, left: 25 }}
	tooltipContext={false}
>
	{#snippet aboveMarks({ context })}
		<AnnotationLine
			{x1}
			{y1}
			{x2}
			{y2}
			label={placement}
			labelPlacement={placement}
			labelXOffset={xOffset}
			labelYOffset={yOffset}
			props={{
				line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
				label: { fill: 'var(--color-danger)' }
			}}
		/>

		{#if showControls}
			{@const xScale = context.xScale as (value: Date | number) => number}
			{@const yScale = context.yScale as (value: number) => number}
			{@const xInvert = (context.xScale as any).invert as (value: number) => Date}
			{@const yInvert = (context.yScale as any).invert as (value: number) => number}

			<!-- drag start point -->
			<Circle
				cx={xScale(x1)}
				cy={yScale(y1)}
				r={6}
				class="fill-danger/20 stroke-danger cursor-move [stroke-dasharray:3_3]"
				{@attach movable({
					onMove: ({ dx, dy }) => {
						x1 = xInvert(xScale(x1) + dx);
						y1 = yInvert(yScale(y1) + dy);
					}
				})}
			/>

			<!-- drag end point -->
			<Circle
				cx={xScale(x2)}
				cy={yScale(y2)}
				r={6}
				class="fill-danger/20 stroke-danger cursor-move [stroke-dasharray:3_3]"
				{@attach movable({
					onMove: ({ dx, dy }) => {
						x2 = xInvert(xScale(x2) + dx);
						y2 = yInvert(yScale(y2) + dy);
					}
				})}
			/>
		{/if}
	{/snippet}
</LineChart>
