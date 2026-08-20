<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Brush, BrushState, Chart, Group, Spline, Text, pivotLonger } from 'layerchart';
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

	// One scale per dimension, normalizing to `0–1` so every dimension shares the chart's `y`
	const scales = new Map(
		keys.map((k) => [
			k as string,
			scaleLinear().domain(extent(rows, (d) => d[k] as number) as [number, number])
		])
	);

	const data = pivotLonger(rows, keys, 'dimension', 'value');

	// One selection per dimension, each owned by its `<Brush>` below and read back here
	let brushes = $state<Record<string, BrushState | undefined>>({});

	const active = $derived(keys.filter((k) => brushes[k]?.active));

	// A penguin is kept when it falls inside *every* brushed dimension
	const selectedIds = $derived(
		new Set(
			rows
				.filter((row) =>
					active.every((k) => brushes[k]!.contains({ y: scales.get(k)!(row[k] as number) }))
				)
				.map((d) => d.id)
		)
	);

	const BRUSH_WIDTH = 24;

	export { data };
</script>

<!--
	Drag along an axis to brush that dimension, and drag across several to intersect them — a line
	is kept only when it falls inside every selection. Drag a selection to move it, its edges to
	resize, or click an axis to clear it.
-->
<div class="text-sm text-surface-content/70 mb-2">
	{selectedIds.size} of {rows.length} penguins
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
	padding={{ left: 48, right: 48, top: 32, bottom: 8 }}
	height={400}
>
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

	{#snippet marks()}
		<!-- One mark, one line per penguin (`z`); brushed-out lines stay as faint context -->
		<Spline
			stroke={(d) =>
				selectedIds.has(d.id) ? 'var(--color-primary)' : 'var(--color-surface-content)'}
			strokeWidth={1}
			opacity={(d) => (selectedIds.has(d.id) ? 0.4 : 0.03)}
		/>
	{/snippet}
</Chart>
