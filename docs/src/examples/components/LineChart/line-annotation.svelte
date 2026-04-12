<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';

	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	annotations={[
		{
			type: 'line',
			y: 500,
			label: 'Max',
			labelXOffset: 4,
			labelYOffset: 2,
			props: {
				label: { class: 'fill-danger' },
				line: { class: '[stroke-dasharray:2,2] stroke-danger' }
			}
		}
	]}
	padding={defaultChartPadding({ left: 25 })}
	height={300}
/>
