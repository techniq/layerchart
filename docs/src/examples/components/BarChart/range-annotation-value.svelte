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
			y: [75, null],
			pattern: {
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}
		},
		{
			type: 'line',
			label: 'Max',
			y: 75,
			props: {
				line: { class: '[stroke-dasharray:2,2] _stroke-danger' }
			}
		}
	]}
	height={300}
/>
