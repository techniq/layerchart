<script module lang="ts">
	import { getIris } from '$lib/data.remote';
	const iris = await getIris();
</script>

<script lang="ts">
	import { Axis, Brush, BrushState, Chart, Group, Spline, pivotLonger } from 'layerchart';
	import { extent } from 'd3-array';
	import { scaleLinear, scalePoint } from 'd3-scale';

	const dimensions = {
		sepal_length: 'Sepal length',
		sepal_width: 'Sepal width',
		petal_length: 'Petal length',
		petal_width: 'Petal width',
		species: 'Species'
	};
	const keys = Object.keys(dimensions) as (keyof typeof dimensions)[];

	const species = [...new Set(iris.map((d) => d.species))];

	// `species` is both a dimension and the color, and pivoting consumes the columns it reads —
	// so the color keeps a copy of its own
	const rows = iris.map((d, id) => ({ ...d, id, group: d.species }));

	/**
	 * One scale per dimension, each normalized to `0–1` so every dimension shares the chart's `y`.
	 * A categorical dimension takes a point scale over its values, where a quantitative one takes a
	 * linear scale over its extent.
	 */
	const scales = new Map<string, any>(
		keys.map((key) => [
			key,
			key === 'species'
				? // `padding` keeps the categories off the ends of the axis, so each sits in the middle
					// of its own slice — brushing near one takes it, rather than needing the exact point
					scalePoint().domain(species).range([0, 1]).padding(0.5)
				: scaleLinear().domain(extent(rows, (d) => d[key] as number) as [number, number])
		])
	);

	const data = pivotLonger(rows, keys, 'dimension', 'value');

	// One selection per dimension, each owned by its `<Brush>` below and read back here
	let brushes = $state<Record<string, BrushState | undefined>>({});

	const active = $derived(keys.filter((k) => brushes[k]?.active));

	// A flower is kept when it falls inside *every* brushed dimension
	const selectedIds = $derived(
		new Set(
			rows
				.filter((row) => active.every((k) => brushes[k]!.contains({ y: scales.get(k)(row[k]) })))
				.map((d) => d.id)
		)
	);

	const BRUSH_WIDTH = 24;

	export { data };
</script>

<!--
	The species axis is categorical, so it takes a point scale rather than a linear one — brushing
	it selects those species, and intersects with the numeric dimensions like any other.
-->
<div class="text-sm text-surface-content/70 mb-2">
	{selectedIds.size} of {rows.length} flowers
	{#if active.length}
		· brushed on {active.map((k) => dimensions[k]).join(', ')}
	{/if}
</div>

<Chart
	{data}
	x="dimension"
	xScale={scalePoint()}
	xDomain={keys}
	y={(d) => scales.get(d.dimension)?.(d.value)}
	yDomain={[0, 1]}
	z="id"
	c="group"
	cDomain={species}
	cRange={['var(--color-info)', 'var(--color-success)', 'var(--color-warning)']}
	padding={{ left: 48, right: 72, top: 32, bottom: 8 }}
	height={400}
>
	{#snippet axis({ context })}
		<!-- The dimension names are an axis over the shared `x`, rather than a label placed by hand -->
		<Axis placement="top" format={(d) => dimensions[d as keyof typeof dimensions]} tickLength={0} />

		{#each keys as key (key)}
			<Group x={context.xScale(key)}>
				<Axis
					placement="left"
					scale={scales.get(key).copy().range([context.height, 0])}
					ticks={key === 'species' ? species : 6}
					rule
				/>

				<Brush
					bind:state={brushes[key]}
					axis="y"
					x={-BRUSH_WIDTH / 2}
					width={BRUSH_WIDTH}
					classes={{ selection: 'fill-primary/15 stroke-primary/50' }}
				/>
			</Group>
		{/each}
	{/snippet}

	{#snippet marks({ context })}
		<!-- One line per flower (`z`), colored by species; brushed-out lines stay as faint context -->
		<Spline
			stroke={(d) =>
				selectedIds.has(d.id) ? context.cScale?.(d.group) : 'var(--color-surface-content)'}
			strokeWidth={1}
			opacity={(d) => (selectedIds.has(d.id) ? 0.5 : 0.03)}
		/>
	{/snippet}
</Chart>
