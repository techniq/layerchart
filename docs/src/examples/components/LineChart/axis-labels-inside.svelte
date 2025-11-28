<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	height={300}
	props={{
		yAxis: {
			tickLabelProps: {
				textAnchor: 'start',
				verticalAnchor: 'end'
			},
			tickLength: 0
		}
	}}
	padding={{
		left: 0,
		top: 10,
		bottom: 24
	}}
/>
