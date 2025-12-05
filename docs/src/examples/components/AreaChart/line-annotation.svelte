<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y="value"
	padding={{ ...defaultChartPadding(), left: 25 }}
	height={300}
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
/>
