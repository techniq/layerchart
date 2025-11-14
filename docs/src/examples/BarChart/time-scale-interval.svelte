<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { timeDay } from 'd3-time';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<BarChart
	data={data.filter((d) => Math.random() > 0.7)}
	x="date"
	y="value"
	xInterval={timeDay}
	height={300}
/>
