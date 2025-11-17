<script lang="ts">
	import { LineChart } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

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
	padding={20}
	height={300}
/>
