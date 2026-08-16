<script module lang="ts">
	import { getLayoffs } from '$lib/data.remote';
	const layoffs = await getLayoffs();
</script>

<script lang="ts">
	import { Area, Chart, Frame, Text, pivotLonger } from 'layerchart';
	import { rollup, sum, union, max as d3Max } from 'd3-array';
	import { utcMonth } from 'd3-time';

	const columns = 3;

	// Monthly totals per industry, for the nine hardest-hit industries
	const byIndustry = rollup(
		layoffs.filter((d) => d.totalLaidOff != null),
		(rows) => sum(rows, (d) => d.totalLaidOff ?? 0),
		(d) => d.industry,
		(d) => +utcMonth.floor(d.date)
	);

	const industries = Array.from(byIndustry)
		.sort(([, a], [, b]) => sum(b.values()) - sum(a.values()))
		.slice(0, 9)
		.map(([industry]) => industry);

	// `fx` is the column, `fy` the row — the index of the industry divided by the column count.
	// This is how Observable Plot wraps a one-dimensional facet into a grid.
	const position = new Map(industries.map((industry, i) => [industry, i]));
	const column = (d: { industry: string }) => (position.get(d.industry) ?? 0) % columns;
	const row = (d: { industry: string }) => Math.floor((position.get(d.industry) ?? 0) / columns);

	// Each industry is scaled to its own peak, so the panels compare shape rather than magnitude —
	// Plot's `normalizeY("extent")`
	const data = industries.flatMap((industry) => {
		const months = byIndustry.get(industry)!;
		const peak = d3Max(months.values()) ?? 1;
		return Array.from(months, ([date, total]) => ({
			industry,
			date: new Date(date),
			share: total / peak
		})).sort((a, b) => +a.date - +b.date);
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="share"
	yDomain={[0, 1]}
	fx={column}
	fy={row}
	facet={{ padding: 0.03, axis: false }}
	axis={false}
	padding={{ top: 4, right: 4, bottom: 4, left: 4 }}
	height={320}
>
	{#snippet marks({ facet })}
		<Frame class="stroke-surface-content/20 fill-none" />
		<Area
			y0={0}
			y1="share"
			fill="var(--color-primary)"
			fillOpacity={0.3}
			line={{ stroke: 'var(--color-primary)' }}
		/>

		<!--
			The panel headers can't come from the `fx` / `fy` axes here — those are grid positions,
			not names — so `facet` gives each panel the industry it's drawing.
		-->
		<Text
			value={industries[facet.row * columns + facet.column]}
			x={6}
			y={6}
			verticalAnchor="start"
			class="text-xs font-medium fill-surface-content"
		/>
	{/snippet}
</Chart>
