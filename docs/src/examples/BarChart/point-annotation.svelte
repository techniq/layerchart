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
			type: 'point',
			data: { date: data[5]?.date, value: data[5]?.value },
			props: {
				class: 'fill-danger stroke-danger-content',
				r: 4
			}
		}
	]}
	height={300}
/>
