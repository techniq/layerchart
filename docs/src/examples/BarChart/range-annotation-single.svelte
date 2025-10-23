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
	x="date"
	y="value"
	annotations={[
		{
			type: 'range',
			data: {
				x: [data[2]?.date, data[5]?.date],
				y: [0, 100]
			},
			props: {
				class: 'fill-warning/20 stroke-warning'
			}
		}
	]}
	height={300}
/>
