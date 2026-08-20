<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Chart, Group, Legend, Spline, Text, pivotLonger } from 'layerchart';
	import { extent } from 'd3-array';
	import { scaleLinear, scalePoint } from 'd3-scale';

	const dimensions = {
		bill_length_mm: 'Bill length',
		bill_depth_mm: 'Bill depth',
		flipper_length_mm: 'Flipper length',
		body_mass_g: 'Body mass'
	};
	const keys = Object.keys(dimensions) as (keyof typeof dimensions)[];

	const rows = penguins
		.filter((d) => keys.every((k) => d[k] !== 'NA'))
		.map((d, id) => ({ ...d, id }));

	// One scale per dimension. Its default `0–1` range positions the lines on the chart's shared
	// `y`, and a pixel-ranged copy draws that dimension's axis in real units.
	const scales = new Map(
		keys.map((k) => [
			k as string,
			scaleLinear().domain(extent(rows, (d) => d[k] as number) as [number, number])
		])
	);

	// One row per (penguin, dimension), carrying `id` and `species` along for `z` and the color
	const data = pivotLonger(rows, keys, 'dimension', 'value');

	const series = [
		{ key: 'Adelie', color: 'var(--color-info)' },
		{ key: 'Chinstrap', color: 'var(--color-warning)' },
		{ key: 'Gentoo', color: 'var(--color-success)' }
	];

	export { data };
</script>

<Chart
	{data}
	x="dimension"
	xScale={scalePoint()}
	xDomain={keys}
	y={(d) => scales.get(d.dimension)?.(d.value)}
	yDomain={[0, 1]}
	z="id"
	{series}
	padding={{ left: 48, right: 48, top: 48, bottom: 8 }}
	height={400}
>
	{#snippet legend()}
		<Legend variant="swatches" placement="top-left" orientation="horizontal" />
	{/snippet}

	{#snippet axis({ context })}
		{#each keys as key (key)}
			<Group x={context.xScale(key)}>
				<Axis
					placement="left"
					scale={scales.get(key)?.copy().range([context.height, 0])}
					ticks={6}
					rule
				/>
				<Text
					value={dimensions[key]}
					y={-12}
					textAnchor="middle"
					class="text-xs font-medium fill-surface-content"
				/>
			</Group>
		{/each}
	{/snippet}

	{#snippet marks({ context })}
		<!-- One mark, one line per penguin (`z`), colored from its species' `series` entry -->
		<Spline
			data={data.filter((d) => context.series.isVisible(d.species))}
			stroke="species"
			strokeWidth={1}
			opacity={(d) => (context.series.isHighlighted(d.species, true) ? 0.4 : 0.05)}
		/>
	{/snippet}
</Chart>
