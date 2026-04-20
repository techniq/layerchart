<script module lang="ts">
	import { getFaithful } from '$lib/data.remote';
	const data = await getFaithful();
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Button, Field, Menu, MenuField, RangeField, Switch, Toggle } from 'svelte-ux';
	import { AnnotationPoint, Circle, ScatterChart, type Placement } from 'layerchart';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import type { LinkSweep, LinkType } from '$lib/utils/linkUtils.js';
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

	const anchorOptions = ['start', 'middle', 'end'].map((v) => ({ label: v, value: v }));
	const linkTypeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded', 'swoop'].map((v) => ({
		label: v,
		value: v
	}));
	const linkSweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((v) => ({
		label: v,
		value: v
	}));
	const linkOrientationOptions = [
		{ label: 'horizontal', value: 'horizontal' },
		{ label: 'vertical', value: 'vertical' }
	];

	let dataX = $state(80);
	let dataY = $state(4.25);

	let placement: Placement = $state('bottom-right');
	let xOffset = $state(50);
	let yOffset = $state(50);
	let radius = $state(100);
	let textAnchor: 'start' | 'middle' | 'end' = $state('middle');
	let verticalAnchor: 'start' | 'middle' | 'end' = $state('start');

	let showControls = $state(true);

	let linkEnabled = $state(true);
	let type: LinkType = $state('beveled');
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);
	let sweep: LinkSweep = $state('horizontal-vertical');
	let orientation: 'horizontal' | 'vertical' = $state('horizontal');
	let linkRadius = $state(30);
	let bend = $state(22.5);

	const link = $derived(
		linkEnabled ? { type, curve, sweep, orientation, radius: linkRadius, bend } : false
	);

	// Sign of each offset on the label's pixel position (from AnnotationPoint's
	// labelProps math): left flips x, top flips y, other placements are +1.
	const signX = $derived(placement.includes('left') ? -1 : 1);
	const signY = $derived(placement.includes('top') ? -1 : 1);

	// Unit vector from ring center toward the placement direction.
	const dirX = $derived(placement.includes('left') ? -1 : placement.includes('right') ? 1 : 0);
	const dirY = $derived(placement.includes('top') ? -1 : placement.includes('bottom') ? 1 : 0);
	const dirMag = $derived(Math.hypot(dirX, dirY) || 1);

	export { data };
</script>

<div class="flex flex-wrap gap-2 mb-2 screenshot-hidden">
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
	<MenuField
		label="Text Anchor"
		options={anchorOptions}
		bind:value={textAnchor}
		stepper
		classes={{ menuIcon: 'hidden', root: 'flex-1 basis-40' }}
	/>
	<MenuField
		label="Vertical Anchor"
		options={anchorOptions}
		bind:value={verticalAnchor}
		stepper
		classes={{ menuIcon: 'hidden', root: 'flex-1 basis-40' }}
	/>
</div>

<div class="flex flex-wrap gap-2 mb-2 screenshot-hidden">
	<Field label="Show controls" class="w-26 shrink-0">
		<Switch bind:checked={showControls} />
	</Field>
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
	<RangeField
		label="Radius"
		bind:value={radius}
		min={0}
		max={200}
		classes={{ root: 'flex-1 basis-40' }}
	/>
</div>

<div class="flex flex-wrap gap-2 mb-2 screenshot-hidden">
	<Field label="Link" class="w-26 shrink-0">
		<Switch bind:checked={linkEnabled} />
	</Field>
	{#if linkEnabled}
		<MenuField
			label="Link Type"
			options={linkTypeOptions}
			bind:value={type}
			stepper
			classes={{ menuIcon: 'hidden', root: 'flex-1 basis-40' }}
		/>
		{#if type === 'd3'}
			<CurveMenuField bind:value={curve} classes={{ root: 'flex-1 basis-40' }} />
			<MenuField
				label="Orientation"
				options={linkOrientationOptions}
				bind:value={orientation}
				stepper
				classes={{ menuIcon: 'hidden', root: 'flex-1 basis-40' }}
			/>
		{/if}
		{#if type === 'beveled' || type === 'rounded'}
			<RangeField
				label="Link Radius"
				bind:value={linkRadius}
				min={0}
				classes={{ root: 'flex-1 basis-40' }}
			/>
		{/if}
		{#if type === 'swoop'}
			<RangeField
				label="Bend (°)"
				bind:value={bend}
				min={-90}
				max={90}
				classes={{ root: 'flex-1 basis-40' }}
			/>
		{/if}
		<MenuField
			label="Link Sweep"
			options={linkSweepOptions}
			bind:value={sweep}
			stepper
			classes={{ menuIcon: 'hidden', root: 'flex-1 basis-40' }}
		/>
	{/if}
</div>

<ScatterChart
	{data}
	x="waiting"
	y="eruptions"
	xNice
	yNice
	height={400}
	padding={{ top: 10, right: 10, bottom: 20, left: 30 }}
	tooltipContext={false}
>
	{#snippet aboveMarks({ context })}
		<AnnotationPoint
			x={dataX}
			y={dataY}
			r={radius}
			label={placement}
			labelPlacement={placement}
			labelXOffset={xOffset}
			labelYOffset={yOffset}
			{link}
			props={{
				circle: { class: 'stroke-secondary' },
				label: { class: 'fill-secondary font-bold', textAnchor, verticalAnchor }
			}}
		/>

		{#if showControls}
			{@const ringX = context.xScale(dataX)}
			{@const ringY = context.yScale(dataY)}
			{@const labelX = ringX + (radius * dirX) / dirMag + xOffset * signX}
			{@const labelY = ringY + (radius * dirY) / dirMag + yOffset * signY}

			<!-- drag center -->
			<Circle
				cx={ringX}
				cy={ringY}
				r={6}
				class="fill-secondary/20 stroke-secondary cursor-move [stroke-dasharray:3_3]"
				{@attach movable({
					onMove: ({ dx, dy }) => {
						const xScale = context.xScale as any;
						const yScale = context.yScale as any;
						dataX = xScale.invert(xScale(dataX) + dx);
						dataY = yScale.invert(yScale(dataY) + dy);
					}
				})}
			/>

			<!-- drag label -->
			<Circle
				cx={labelX}
				cy={labelY}
				r={6}
				class="fill-secondary/20 stroke-secondary cursor-move [stroke-dasharray:3_3]"
				{@attach movable({
					onMove: ({ dx, dy }) => {
						xOffset += dx * signX;
						yOffset += dy * signY;
					}
				})}
			/>

			<!-- drag radius -->
			<Circle
				cx={ringX + radius}
				cy={ringY}
				r={6}
				class="fill-secondary/20 stroke-secondary cursor-ew-resize [stroke-dasharray:3_3]"
				{@attach movable({
					axis: 'x',
					onMove: ({ dx }) => {
						radius = Math.max(0, radius + dx);
					}
				})}
			/>
		{/if}
	{/snippet}
</ScatterChart>
