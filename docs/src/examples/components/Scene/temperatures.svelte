<script module lang="ts">
	import { getDailyTemperatures } from '$lib/data.remote';
	const data = await getDailyTemperatures();
</script>

<script lang="ts">
	import { Axis, Chart, Scene, Spline, Tooltip, perspective } from '@layerchart/3d';
	import { extent } from 'd3-array';
	import { scaleSequential, scaleUtc } from 'd3-scale';
	import { interpolatePlasma } from 'd3-scale-chromatic';
	import { format } from '@layerstack/utils';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	let layout = $state<'radial' | 'linear'>('radial');

	// Radial: each year a loop around the plot's center, the day of the year the angle and the
	// temperature the distance out — then stacked up by year
	const [low, high] = extent(data, (d) => d.value as number) as [number, number];
	const rings = data.map((d) => {
		const angle = (((d.dayOfYear - 1) / 365) * 2 - 0.5) * Math.PI;
		const radius = 0.25 + (0.75 * ((d.value as number) - low)) / (high - low);
		return { ...d, cx: radius * Math.cos(angle), cy: radius * Math.sin(angle) };
	});

	// The loops kept round: across and down the same square in the middle of the plot
	const side = ({ width, height }: { width: number; height: number }) => Math.min(width, height);
	const xRange = (size: { width: number; height: number }) => [
		(size.width - side(size)) / 2,
		(size.width + side(size)) / 2
	];
	const yRange = (size: { width: number; height: number }) => [
		(size.height - side(size)) / 2,
		(size.height + side(size)) / 2
	];

	export { data };
</script>

<Field label="Layout" class="mb-2">
	<ToggleGroup bind:value={layout} variant="outline">
		<ToggleOption value="radial">Radial</ToggleOption>
		<ToggleOption value="linear">Linear</ToggleOption>
	</ToggleGroup>
</Field>

{#if layout === 'radial'}
	<!-- Each year's loop raised by year, oldest at the bottom, so warming shows as the tower widens -->
	<Chart
		view={perspective({ rotate: -30, tilt: 65 })}
		transform={{
			mode: 'canvas',
			drag: 'rotate',
			scrollMode: 'scale',
			scrollActivationKey: 'shift'
		}}
		data={rings}
		x="cx"
		y="cy"
		z="year"
		xDomain={[-1, 1]}
		yDomain={[-1, 1]}
		{xRange}
		{yRange}
		zDomain={[1940, 2024]}
		zRange={({ height }) => [0, height]}
		c="year"
		cScale={scaleSequential(interpolatePlasma)}
		g="year"
		tooltipContext
		height={550}
		class="cursor-grab active:cursor-grabbing"
	>
		<Scene>
			<Axis placement="back" format="none" label="Year" />
			<Spline strokeWidth={1} opacity={0.8} tooltip />
		</Scene>
		{@render tooltip()}
	</Chart>
{:else}
	<!-- A line per year across the day of the year, years running back, temperature up -->
	<Chart
		view={perspective({ rotate: -35, tilt: 60 })}
		transform={{
			mode: 'canvas',
			drag: 'rotate',
			scrollMode: 'scale',
			scrollActivationKey: 'shift'
		}}
		{data}
		x="date"
		xScale={scaleUtc()}
		y="year"
		z="value"
		zDomain={[low, high]}
		zRange={({ height }) => [0, height * 0.6]}
		c="year"
		cScale={scaleSequential(interpolatePlasma)}
		g="year"
		tooltipContext
		height={550}
		class="cursor-grab active:cursor-grabbing"
	>
		<Scene>
			<Axis placement="bottom" format="month" />
			<Axis placement="left" format="none" label="Year" />
			<Axis placement="back" format={(v) => v + '° F'} />
			<Spline strokeWidth={1} opacity={0.8} tooltip />
		</Scene>
		{@render tooltip()}
	</Chart>
{/if}

{#snippet tooltip()}
	<Tooltip.Root>
		{#snippet children({ data })}
			<!-- Dates are all in one year, for laying the years over each other -->
			<Tooltip.Header>
				{data.date.toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric',
					timeZone: 'UTC'
				})},
				{data.year}
			</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="Temperature" value={`${format(data.value, 'decimal')}° F`} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
{/snippet}
