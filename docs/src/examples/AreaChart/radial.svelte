<script lang="ts">
	import { AreaChart, Spline } from 'layerchart';
	import { curveCatmullRom } from 'd3-shape';
	import { ascending, flatGroup, max, mean, min } from 'd3-array';
	import { csvParse, autoType } from 'd3-dsv';

	const data = await fetch('/data/examples/sfoTemperatures.csv').then(async (r) => {
		return flatGroup(
			// @ts-expect-error
			csvParse<{ date: Date; tavg: number; tmax: number; tmin: number }>(await r.text(), autoType),
			(d) => new Date(Date.UTC(2000, d.date.getUTCMonth(), d.date.getUTCDate())) // group by day of year
		)
			.sort(([a], [b]) => ascending(a, b)) // sort chronologically
			.map(([date, v]) => ({
				date,
				avg: mean(v, (d) => d.tavg || NaN),
				min: mean(v, (d) => d.tmin || NaN),
				max: mean(v, (d) => d.tmax || NaN),
				minmin: min(v, (d) => d.tmin || NaN),
				maxmax: max(v, (d) => d.tmax || NaN)
			}));
	});
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y={['minmin', 'maxmax']}
	yRange={({ height }) => [height / 5, height / 2]}
	radial
	rule={{ class: 'stroke-surface-content/20' }}
	props={{
		area: { line: false, fillOpacity: 1 },
		xAxis: { format: 'month', tickMarks: false },
		yAxis: { ticks: 4, format: (v) => v + '° F' },
		highlight: { points: false },
		tooltip: {
			context: { mode: 'bisect-x' }
		}
	}}
	series={[
		{
			key: 'min_max',
			label: 'min/max',
			value: ['min', 'max'],
			color: 'var(--color-primary)',
			props: { opacity: 0.2, line: { opacity: 0.2 } }
		},
		{
			key: 'minmin_maxmax',
			label: 'minmin/maxmax',
			value: ['minmin', 'maxmax'],
			color: 'var(--color-primary)',
			props: { opacity: 0.2, line: { opacity: 0.2 } }
		}
	]}
	height={500}
>
	{#snippet belowMarks()}
		<Spline y="avg" curve={curveCatmullRom} class="stroke-primary" />
	{/snippet}
</AreaChart>
