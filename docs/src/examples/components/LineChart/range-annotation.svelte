<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	annotations={[
		{
			type: 'range',
			x: [new Date('2010-01-01'), new Date('2010-12-31')],
			label: 'Range',
			labelPlacement: 'bottom',
			labelYOffset: 4,
			pattern: {
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}
		}
	]}
	padding={defaultChartPadding({ left: 30 })}
	height={300}
/>
