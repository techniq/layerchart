<script lang="ts">
	import { AreaChart } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y="value"
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
