<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { timeDay } from 'd3-time';

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
	xInterval={timeDay}
	xReverse
	props={{ bars: { insets: { x: 4 } } }}
	annotations={[
		{
			type: 'range',
			x: [new Date('2026-02-06T00:00'), new Date('2026-02-10T00:00')],
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
