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
				x: [data[0]?.date, data[9]?.date],
				y: [40, 60]
			},
			props: {
				class: 'fill-info/30 stroke-info stroke-2'
			}
		}
	]}
	height={300}
/>
