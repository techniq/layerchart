<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';

	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y="value"
	padding={defaultChartPadding({ left: 25 })}
	height={300}
	annotations={[
		{
			type: 'line',
			y: 500,
			label: 'Max',
			labelXOffset: 4,
			labelYOffset: 2,
			props: {
				label: { fill: 'var(--color-danger)' },
				line: { dashArray: [2, 2], stroke: 'var(--color-danger)' }
			}
		}
	]}
/>
