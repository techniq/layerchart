<script lang="ts">
	import { LineChart } from 'layerchart';
	import { flatGroup } from 'd3-array';
	import { getDailyTemperatures } from '$lib/data.remote';

	const data = await getDailyTemperatures();

	export { data };
</script>

<LineChart
	x="date"
	y="value"
	yDomain={null}
	yRange={({ height }) => [height / 5, height / 2]}
	yNice={false}
	yPadding={[0, 20]}
	radial
	rule={{ y: '$top', class: 'stroke-surface-content/20' }}
	props={{
		spline: { class: 'stroke' },
		xAxis: { format: 'month', tickMarks: false },
		yAxis: { ticks: 4, format: (v) => v + '° F' },
		highlight: { points: false },
		tooltip: {
			context: {
				mode: 'manual'
			}
		}
	}}
	series={flatGroup(data, (d) => d.year).map(([year, data]) => {
		return {
			key: year.toString(),
			data,
			color: year >= 2023 ? 'var(--color-primary)' : 'var(--color-surface-content)',
			props: { opacity: year === 2024 ? 1 : year === 2023 ? 0.5 : 0.1 }
		};
	})}
	padding={20}
	height={500}
/>
