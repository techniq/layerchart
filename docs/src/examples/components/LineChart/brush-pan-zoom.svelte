<script lang="ts">
	import { LineChart, ChartClipPath, Spline, defaultChartPadding } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	brush
	transform={{ mode: 'domain', axis: 'x' }}
	motion={{ type: 'spring' }}
	clip
	padding={defaultChartPadding({ left: 25 })}
	height={300}
/>
