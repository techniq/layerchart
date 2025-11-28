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
			x: [data[2].date, data[4].date],
			pattern: {
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}
		}
	]}
	height={300}
/>
