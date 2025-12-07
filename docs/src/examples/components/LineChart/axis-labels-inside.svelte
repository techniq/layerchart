<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	xNice
	height={300}
	props={{
		yAxis: {
			tickLabelProps: {
				textAnchor: 'start',
				verticalAnchor: 'end',
				dx: 4
			},
			tickLength: 0,
			rule: true
		}
	}}
	padding={{
		left: 0,
		top: 12,
		right: 10,
		bottom: 24
	}}
/>
