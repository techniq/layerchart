<script lang="ts">
	import { LineChart } from 'layerchart';
	import { curveLinearClosed } from 'd3-shape';

	const data = [
		{ name: 'fastball', value: 10 },
		{ name: 'change', value: 0 },
		{ name: 'slider', value: 4 },
		{ name: 'cutter', value: 8 },
		{ name: 'curve', value: 5 }
	];

	export { data };
</script>

<LineChart
	{data}
	x="name"
	y="value"
	radial
	points
	props={{
		spline: {
			curve: curveLinearClosed,
			class: 'stroke-primary fill-primary/20'
		},
		xAxis: {
			tickLength: 10
		},
		yAxis: {
			ticks: [0, 5, 10],
			format: (d) => ''
		},
		grid: {
			yTicks: [0, 5, 10]
		},
		highlight: {
			lines: false
		},
		tooltip: {
			context: {
				mode: 'voronoi'
			}
		}
	}}
	padding={20}
	height={300}
/>
