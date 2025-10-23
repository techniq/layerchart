<script lang="ts">
	import { BarChart, asAny } from 'layerchart';
	import { extent } from 'd3-array';
	import { scaleLinear } from 'd3-scale';
	import { interpolate, quantize } from 'd3-interpolate';
	import { interpolateSpectral } from 'd3-scale-chromatic';
	import { timeMonth } from 'd3-time';

	// This would normally come from the load function in +page.ts
	// For this example, we'll create mock temperature data
	const data = Array.from({ length: 365 }, (_, i) => {
		const date = new Date(2000, 0, 1);
		date.setDate(i + 1);
		return {
			date,
			min: 40 + Math.random() * 20,
			max: 60 + Math.random() * 30,
			avg: 50 + Math.random() * 25
		};
	});

	const avgExtents = extent(data, (d) => d.avg);

	export { data };
</script>

<BarChart
	{data}
	x="date"
	y={['min', 'max']}
	yDomain={[null, null]}
	yRange={({ height }) => [height / 5, height / 2]}
	c="avg"
	cScale={scaleLinear()}
	cDomain={quantize(interpolate(avgExtents[0], asAny(avgExtents[1])), 7)}
	cRange={quantize(interpolateSpectral, 7).reverse()}
	radial
	props={{
		xAxis: { ticks: { interval: timeMonth.every(3) } },
		yAxis: { ticks: 4, format: (v) => v + '° F' },
		grid: { xTicks: 12 }
	}}
	height={600}
/>
