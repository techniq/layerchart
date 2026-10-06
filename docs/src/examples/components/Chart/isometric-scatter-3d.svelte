<script lang="ts">
	import { Axis, Chart, Circle, Frame, Grid, Highlight, Layer, Tooltip } from 'layerchart';
	import { scaleQuantize } from 'd3-scale';

	// Seeded, so the points are the same on every load
	let seed = 7;
	function random() {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	}

	const data = Array.from({ length: 100 }, () => ({
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
	isometric={{ rotate: -30, tilt: 70 }}
	transform={{ mode: 'projection' }}
	tooltipContext={{ mode: 'quadtree', radius: 20 }}
	padding={{ top: 24, bottom: 24, left: 40, right: 24 }}
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	{#snippet children({ context })}
		{@const hovered = context.tooltip.data}
		<Layer>
			<Frame class="fill-surface-content/3 stroke-surface-content/20" />
			<Grid x y z />
			<Axis placement="bottom" tickLabelProps={{ viewport: true }} />
			<Axis placement="left" tickLabelProps={{ viewport: true }} />
			<Axis placement="back" />

			<!-- The hovered point traced on all three grids, with its light spot on each -->
			<Highlight data={hovered} lines={{ strokeWidth: 1 }} shadows axis="both" />

			<Circle cx="x" cy="y" r={6} fill="z" viewport class="stroke-surface-100" />

			<!-- A ring around the hovered point -->
			<Highlight
				data={hovered}
				points={{
					r: 8,
					fill: 'none',
					stroke: 'var(--color-surface-content)',
					strokeWidth: 1.5,
					class: 'drop-shadow-none'
				}}
			/>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.List>
					<Tooltip.Item label="x" value={data.x} format="decimal" />
					<Tooltip.Item label="y" value={data.y} format="decimal" />
					<Tooltip.Item label="z" value={data.z} format="decimal" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
