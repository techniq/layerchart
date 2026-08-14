<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Chart, Group, Legend, Spline, Text } from 'layerchart';
	import { extent } from 'd3-array';
	import { scaleLinear, scalePoint } from 'd3-scale';

	type DimensionKey = 'bill_length_mm' | 'bill_depth_mm' | 'flipper_length_mm' | 'body_mass_g';

	const dimensions: { key: DimensionKey; label: string }[] = [
		{ key: 'bill_length_mm', label: 'Bill length' },
		{ key: 'bill_depth_mm', label: 'Bill depth' },
		{ key: 'flipper_length_mm', label: 'Flipper length' },
		{ key: 'body_mass_g', label: 'Body mass' }
	];

	const rows = penguins.filter((d) => dimensions.every((dim) => d[dim.key] !== 'NA'));

	// Each dimension keeps its own domain — this is what the axes are drawn from, so their ticks
	// read in real units rather than normalized ones.
	const domains = new Map(
		dimensions.map((dim) => [
			dim.key,
			extent(rows, (d) => d[dim.key] as number) as [number, number]
		])
	);

	// ...but positions are normalized to a shared 0–1 domain, so every dimension can share the
	// chart's own y scale.
	function normalize(key: DimensionKey, value: number) {
		const [min, max] = domains.get(key)!;
		return (value - min) / (max - min);
	}

	// Long format — one point per (penguin, dimension). `z` splits it back into a line each.
	const data = rows.flatMap((d, index) =>
		dimensions.map((dim) => ({
			index,
			species: d.species,
			dimension: dim.key,
			value: d[dim.key] as number,
			t: normalize(dim.key, d[dim.key] as number)
		}))
	);
	export { data };

	type Point = (typeof data)[number];

	const series = [
		{ key: 'Adelie', color: 'var(--color-info)' },
		{ key: 'Chinstrap', color: 'var(--color-warning)' },
		{ key: 'Gentoo', color: 'var(--color-success)' }
	];
</script>

<Chart
	{data}
	x="dimension"
	xScale={scalePoint()}
	xDomain={dimensions.map((d) => d.key)}
	y="t"
	yDomain={[0, 1]}
	z="index"
	{series}
	padding={{ left: 48, right: 48, top: 48, bottom: 8 }}
	height={400}
>
	{#snippet legend()}
		<Legend variant="swatches" placement="top-left" orientation="horizontal" />
	{/snippet}

	{#snippet axis({ context })}
		{#each dimensions as dim (dim.key)}
			<Group x={context.xScale(dim.key)}>
				<!-- Each axis draws from its own scale, sharing the chart's pixel range -->
				<Axis
					placement="left"
					scale={scaleLinear().domain(domains.get(dim.key)!).range([context.height, 0])}
					ticks={6}
					rule
				/>
				<Text
					value={dim.label}
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
			opacity={(d: Point) => (context.series.isHighlighted(d.species, true) ? 0.4 : 0.05)}
		/>
	{/snippet}
</Chart>
