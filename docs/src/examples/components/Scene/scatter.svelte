<script lang="ts">
	import { Axis, Chart, Grid, Points, Tooltip, Scene } from '@layerchart/3d';
	import { scaleQuantize } from 'd3-scale';

	// Seeded, so the points are the same on every load
	let seed = 7;
	function random() {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	}

	const data = Array.from({ length: 200 }, () => ({
		x: random() * 10,
		y: random() * 10,
		z: random() * 10
	}));

	export { data };
</script>

<Chart
	{data}
	x="x"
	y="y"
	z="z"
	xDomain={[0, 10]}
	yDomain={[0, 10]}
	zDomain={[0, 10]}
	zRange={({ height }) => [0, height]}
	c="z"
	cScale={scaleQuantize()}
	cDomain={[0, 10]}
	cRange={[
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)',
		'var(--color-primary-900)'
	]}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene>
		<Grid />
		<Axis placement="bottom" label="x" />
		<Axis placement="left" label="y" />
		<Axis placement="back" label="z" />
		<Points r={6} tooltip />
	</Scene>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="x" value={data.x} format="decimal" />
				<Tooltip.Item label="y" value={data.y} format="decimal" />
				<Tooltip.Item label="z" value={data.z} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
