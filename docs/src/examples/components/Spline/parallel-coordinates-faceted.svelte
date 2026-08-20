<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Chart, Group, Spline, pivotLonger } from 'layerchart';
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

	// Domains span every species, so the panels stay comparable — see `parallel-coordinates`
	const scales = new Map(
		keys.map((k) => [
			k as string,
			scaleLinear().domain(extent(rows, (d) => d[k] as number) as [number, number])
		])
	);

	const data = pivotLonger(rows, keys, 'dimension', 'value');

	const series = [
		{ key: 'Adelie', color: 'var(--color-info)' },
		{ key: 'Chinstrap', color: 'var(--color-warning)' },
		{ key: 'Gentoo', color: 'var(--color-success)' }
	];

	export { data };
</script>

<!--
	`fy` splits the plot into a parallel coordinates per species. The lines themselves can't be
	faceted by dimension — each one crosses all four — so the dimensions stay on the shared `x`
	and the panels partition the rows instead.
-->
<Chart
	{data}
	x="dimension"
	xScale={scalePoint()}
	xDomain={keys}
	y={(d) => scales.get(d.dimension)?.(d.value)}
	yDomain={[0, 1]}
	z="id"
	fy="species"
	{series}
	padding={{ left: 48, right: 76, top: 32, bottom: 8 }}
	height={560}
>
	{#snippet axis({ context })}
		<!-- The dimension names are an axis over the shared `x`, so they draw above the top panel only -->
		<Axis placement="top" format={(d) => dimensions[d as keyof typeof dimensions]} tickLength={0} />

		{#each keys as key (key)}
			<Group x={context.xScale(key)}>
				<!-- `facetAll` — each dimension's units are worth repeating in every panel -->
				<Axis
					placement="left"
					scale={scales.get(key)?.copy().range([context.height, 0])}
					ticks={6}
					rule
					facetAll
				/>
			</Group>
		{/each}
	{/snippet}

	{#snippet marks()}
		<!-- No `data` prop, so each line is drawn from its own panel's rows -->
		<Spline stroke="species" strokeWidth={1} opacity={0.4} />
	{/snippet}
</Chart>
