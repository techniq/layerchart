<script lang="ts">
	import { defaultChartPadding, LinearGradient, LineChart, Spline } from 'layerchart';
	import { getDailyTemperature } from '$lib/data.remote';
	import { ticks } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';

	const data = $derived(await getDailyTemperature());
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	c="value"
	cScale={scaleSequential(interpolateTurbo)}
	yDomain={null}
	padding={defaultChartPadding({ top: 40 })}
	height={300}
	legend={{ title: 'Temperature (°F)', placement: 'top-right' }}
>
	{#snippet marks()}
		<LinearGradient stops={ticks(1, 0, 10).map(interpolateTurbo)} vertical>
			{#snippet children({ gradient })}
				<Spline stroke={gradient} />
			{/snippet}
		</LinearGradient>
	{/snippet}
</LineChart>
