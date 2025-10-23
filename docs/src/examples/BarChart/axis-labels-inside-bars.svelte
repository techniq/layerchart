<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<BarChart
	{data}
	x="value"
	y="date"
	labels
	orientation="horizontal"
	axis="y"
	rule={false}
	props={{
		yAxis: {
			tickSize: 0,
			class: 'text-xs fill-surface-content',
			dx: 8
		},
		bars: { class: 'fill-primary' }
	}}
	padding={{ left: 0, bottom: 16 }}
	height={500}
/>
