<script module lang="ts">
	import { getLayoffs } from '$lib/data.remote';
	const layoffs = await getLayoffs();
</script>

<script lang="ts">
	import { Area, Chart, Frame, Text } from 'layerchart';
	import { rollups, sum, max } from 'd3-array';
	import { sort } from '@layerstack/utils';
	import { utcMonth } from 'd3-time';

	const columns = 3;

	// Monthly totals per industry
	const byIndustry = rollups(
		layoffs.filter((d) => d.totalLaidOff != null),
		(rows) => sum(rows, (d) => d.totalLaidOff ?? 0),
		(d) => d.industry,
		(d) => +utcMonth.floor(d.date)
	);

	// The nine hardest-hit
	const industries = sort(
		byIndustry.map(([industry, months]) => ({
			industry,
			months,
			total: sum(months, ([, total]) => total)
		})),
		'total',
		'desc'
	).slice(0, columns * 3);

	// Each scaled to its own peak, so the panels compare shape rather than magnitude
	const data = industries.flatMap(({ industry, months }) => {
		const peak = max(months, ([, total]) => total) ?? 1;
		return sort(months, ([date]) => date).map(([date, total]) => ({
			industry,
			date: new Date(date),
			share: total / peak
		}));
	});

	const names = industries.map((d) => d.industry);
	const column = (d: { industry: string }) => names.indexOf(d.industry) % columns;
	const row = (d: { industry: string }) => Math.floor(names.indexOf(d.industry) / columns);

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
			value={names[facet.row * columns + facet.column]}
			x={6}
			y={6}
			verticalAnchor="start"
			class="text-xs font-medium fill-surface-content"
		/>
	{/snippet}
</Chart>
