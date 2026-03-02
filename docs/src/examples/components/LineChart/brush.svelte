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
	brush
	motion={{ type: 'spring' }}
	padding={defaultChartPadding({ left: 25 })}
	height={300}
/>
