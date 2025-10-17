<script lang="ts">
	import { AreaChart, Spline } from 'layerchart';
	import { curveCatmullRom } from 'd3-shape';
	import { getSfoTemperatures } from '$lib/data.remote';

	const data = $derived(await getSfoTemperatures());
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
