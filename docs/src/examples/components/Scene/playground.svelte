<script lang="ts">
	import { Axis, Bars, Chart, Grid, Scene, Tooltip } from '@layerchart/3d';
	import { scaleBand, scaleQuantize } from 'd3-scale';
	import { extent } from 'd3-array';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	// A hill: tallest in the middle, falling away to the corners
	const size = 12;
	const centre = (size - 1) / 2;
	const data = Array.from({ length: size * size }, (_, i) => {
		const x = i % size;
		const y = Math.floor(i / size);
		return { x, y, value: Math.hypot(centre, centre) - Math.hypot(x - centre, y - centre) };
	});

	let camera = $state<'perspective' | 'orthographic'>('perspective');
	// Bound, so dragging to orbit moves the sliders too
	let rotate = $state(-45);
	let tilt = $state(60);
	let fov = $state(35);
	let margin = $state(0.1);
	let controls = $state(true);
	// The top of the `z` range, in pixels
	let height = $state(150);

	export { data };
</script>

<div class="flex flex-wrap gap-2">
	<Field label="Camera">
		<ToggleGroup bind:value={camera} variant="outline">
			<ToggleOption value="perspective">Perspective</ToggleOption>
			<ToggleOption value="orthographic">Orthographic</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Controls">
		<ToggleGroup bind:value={controls} variant="outline">
			<ToggleOption value={true}>On</ToggleOption>
			<ToggleOption value={false}>Off</ToggleOption>
		</ToggleGroup>
	</Field>
	<RangeField
		label="Rotate"
		bind:value={rotate}
		min={-180}
		max={180}
		step={1}
		format="integer"
		class="w-48"
	/>
	<RangeField
		label="Tilt"
		bind:value={tilt}
		min={0}
		max={90}
		step={1}
		format="integer"
		class="w-48"
	/>
	<RangeField
		label="Field of view"
		disabled={camera === 'orthographic'}
		bind:value={fov}
		min={10}
		max={90}
		step={1}
		class="w-48"
	/>
	<RangeField
		label="Margin"
		bind:value={margin}
		min={0}
		max={0.5}
		step={0.05}
		format="percentRound"
		class="w-48"
	/>
	<RangeField label="Height" bind:value={height} min={0} max={300} step={10} class="w-48" />
</div>

<Chart
	{data}
	x="x"
	xScale={scaleBand().padding(0.1)}
	y="y"
	yScale={scaleBand().padding(0.1)}
	z="value"
	zRange={[0, height]}
	c="value"
	cScale={scaleQuantize()}
	cDomain={extent(data, (d) => d.value)}
	cRange={[
		'var(--color-primary-100)',
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)'
	]}
	tooltipContext
	height={500}
	class={controls ? 'cursor-grab active:cursor-grabbing' : ''}
>
	<Scene {camera} bind:rotate bind:tilt {fov} {margin} {controls}>
		<Grid x={false} y={false} />
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Axis placement="back" />
		<Bars />
	</Scene>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="x" value={data.x} />
				<Tooltip.Item label="y" value={data.y} />
				<Tooltip.Item label="value" value={data.value} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
